"""Instruction Data Ingestion, Validation, Balancing & Splitting Pipeline for Step 6."""

from collections import Counter
import hashlib
import json
import logging
from pathlib import Path
import random
from typing import Any, Dict, List, Tuple

from chemistry_llm.instruction_data.generators import generate_all_instruction_examples
from chemistry_llm.instruction_data.schema import ChemistryInstructionExample, example_from_dict

logger = logging.getLogger("chemistry_llm.instruction_pipeline")


class InstructionDataPipeline:
    """Manages full lifecycle of ChemNova chemistry instruction data."""

    def __init__(self, base_dir: Path = Path("chemistry_llm/instruction_data")):
        self.base_dir = Path(base_dir)
        self.raw_dir = self.base_dir / "raw"
        self.imported_dir = self.base_dir / "imported"
        self.cleaned_dir = self.base_dir / "cleaned"
        self.normalized_dir = self.base_dir / "normalized"
        self.validated_dir = self.base_dir / "validated"
        self.rejected_dir = self.base_dir / "rejected"
        self.deduplicated_dir = self.base_dir / "deduplicated"
        self.statistics_dir = self.base_dir / "statistics"
        self.manifests_dir = self.base_dir / "manifests"

        for p in [
            self.raw_dir,
            self.imported_dir,
            self.cleaned_dir,
            self.normalized_dir,
            self.validated_dir,
            self.rejected_dir,
            self.deduplicated_dir,
            self.statistics_dir,
            self.manifests_dir,
            self.base_dir / "instruction",
            self.base_dir / "reasoning",
            self.base_dir / "conversation",
            self.base_dir / "calculations",
            self.base_dir / "reactions",
            self.base_dir / "spectroscopy",
            self.base_dir / "molecules",
            self.base_dir / "mechanisms",
            self.base_dir / "safety",
        ]:
            p.mkdir(parents=True, exist_ok=True)

    def run_pipeline(
        self,
        random_seed: int = 42,
        train_ratio: float = 0.70,
        val_ratio: float = 0.15,
        test_ratio: float = 0.15,
    ) -> Dict[str, Any]:
        """Execute full data pipeline: generate, validate, deduplicate, balance, split, and record manifest."""
        random.seed(random_seed)

        # 1. Generate & Import
        raw_examples = generate_all_instruction_examples()
        imported_file = self.imported_dir / "raw_instructions.jsonl"
        with open(imported_file, "w", encoding="utf-8") as f:
            for ex in raw_examples:
                f.write(json.dumps(ex.to_dict()) + "\n")
        logger.info("Imported %d instruction examples into %s", len(raw_examples), imported_file)

        # 2. Validation & Quality Filter
        validated: List[ChemistryInstructionExample] = []
        rejected: List[Dict[str, Any]] = []

        for ex in raw_examples:
            is_valid, errors = ex.validate()
            if is_valid:
                validated.append(ex)
            else:
                rejected.append({"example": ex.to_dict(), "errors": errors})

        val_file = self.validated_dir / "validated_instructions.jsonl"
        with open(val_file, "w", encoding="utf-8") as f:
            for ex in validated:
                f.write(json.dumps(ex.to_dict()) + "\n")

        rej_file = self.rejected_dir / "rejected_instructions.jsonl"
        with open(rej_file, "w", encoding="utf-8") as f:
            for r in rejected:
                f.write(json.dumps(r) + "\n")

        logger.info("Validation complete: %d valid, %d rejected", len(validated), len(rejected))

        # 3. Deduplication
        seen_hashes = set()
        deduped: List[ChemistryInstructionExample] = []
        for ex in validated:
            h = ex.compute_hash()
            if h not in seen_hashes:
                seen_hashes.add(h)
                deduped.append(ex)

        dedup_file = self.deduplicated_dir / "deduplicated_instructions.jsonl"
        with open(dedup_file, "w", encoding="utf-8") as f:
            for ex in deduped:
                f.write(json.dumps(ex.to_dict()) + "\n")

        # 4. Categorical Organization
        for ex in deduped:
            target_sub = "instruction"
            if ex.reasoning_type in ("step_by_step_numerical", "mechanistic", "deductive"):
                target_sub = "reasoning"
            elif ex.domain == "conversation" or ex.reasoning_type == "conversational":
                target_sub = "conversation"
            elif ex.domain == "calculations":
                target_sub = "calculations"
            elif ex.domain == "organic_chemistry" and ex.subdomain == "substitution_mechanisms":
                target_sub = "mechanisms"
            elif ex.domain in ("reactions", "general_chemistry") and ex.reaction:
                target_sub = "reactions"
            elif ex.domain == "spectroscopy":
                target_sub = "spectroscopy"
            elif ex.domain == "molecules":
                target_sub = "molecules"
            elif ex.domain == "laboratory_safety":
                target_sub = "safety"

            sub_file = self.base_dir / target_sub / f"{target_sub}_examples.jsonl"
            with open(sub_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(ex.to_dict()) + "\n")

        # 5. Quality & Distribution Statistics
        domain_counts = Counter(ex.domain for ex in deduped)
        diff_counts = Counter(ex.difficulty for ex in deduped)
        reason_counts = Counter(ex.reasoning_type for ex in deduped)
        answer_counts = Counter(ex.answer_type for ex in deduped)

        quality_report = {
            "total_raw": len(raw_examples),
            "validated_count": len(validated),
            "rejected_count": len(rejected),
            "deduplicated_count": len(deduped),
            "validation_pass_rate": len(validated) / len(raw_examples) if raw_examples else 0.0,
            "domain_distribution": dict(domain_counts),
            "difficulty_distribution": dict(diff_counts),
            "reasoning_distribution": dict(reason_counts),
            "answer_type_distribution": dict(answer_counts),
        }

        with open(self.statistics_dir / "instruction_quality_report.json", "w", encoding="utf-8") as f:
            json.dump(quality_report, f, indent=2)

        # 6. Train / Validation / Test Splitting (Strict Leakage Prevention)
        shuffled = list(deduped)
        random.shuffle(shuffled)

        n_total = len(shuffled)
        n_train = int(n_total * train_ratio)
        n_val = int(n_total * val_ratio)
        if n_val == 0 and n_total >= 3:
            n_val = 1
        n_test = n_total - n_train - n_val

        train_set = shuffled[:n_train]
        val_set = shuffled[n_train : n_train + n_val]
        test_set = shuffled[n_train + n_val :]

        # Verify zero hash leakage
        train_hashes = {ex.compute_hash() for ex in train_set}
        val_hashes = {ex.compute_hash() for ex in val_set}
        test_hashes = {ex.compute_hash() for ex in test_set}

        assert not (train_hashes & val_hashes), "Leakage detected between train and val!"
        assert not (train_hashes & test_hashes), "Leakage detected between train and test!"
        assert not (val_hashes & test_hashes), "Leakage detected between val and test!"

        # Write split files
        train_file = self.base_dir / "instruction_train.jsonl"
        val_split_file = self.base_dir / "instruction_val.jsonl"
        test_split_file = self.base_dir / "instruction_test.jsonl"

        with open(train_file, "w", encoding="utf-8") as f:
            for ex in train_set:
                f.write(json.dumps(ex.to_dict()) + "\n")

        with open(val_split_file, "w", encoding="utf-8") as f:
            for ex in val_set:
                f.write(json.dumps(ex.to_dict()) + "\n")

        with open(test_split_file, "w", encoding="utf-8") as f:
            for ex in test_set:
                f.write(json.dumps(ex.to_dict()) + "\n")

        # 7. Manifest
        manifest = {
            "version": "1.0.0",
            "timestamp": "2026-10-01T18:15:00Z",
            "total_examples": n_total,
            "splits": {
                "train": {"count": len(train_set), "path": str(train_file)},
                "validation": {"count": len(val_set), "path": str(val_split_file)},
                "test": {"count": len(test_set), "path": str(test_split_file)},
            },
            "hashes": {
                "train_sha256": hashlib.sha256(train_file.read_bytes()).hexdigest(),
                "val_sha256": hashlib.sha256(val_split_file.read_bytes()).hexdigest(),
                "test_sha256": hashlib.sha256(test_split_file.read_bytes()).hexdigest(),
            },
            "statistics": quality_report,
        }

        manifest_file = self.manifests_dir / "instruction_manifest.json"
        with open(manifest_file, "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2)

        logger.info(
            "Instruction dataset pipeline completed: %d train, %d val, %d test",
            len(train_set),
            len(val_set),
            len(test_set),
        )
        return manifest
