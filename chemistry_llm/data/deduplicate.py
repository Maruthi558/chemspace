"""ChemNova Duplicate Detection and Deduplication System.

Identifies and records:
- Duplicate record IDs
- Identical questions
- Identical answers
- Duplicate question-answer pairs
- Duplicate molecular records (identical SMILES or molecular formulas)
- Duplicate chemical reactions

Does NOT delete duplicates silently. Records what was detected, why it was flagged,
and links each duplicate to its first-seen original record.

Usage:
    python -m chemistry_llm.data.deduplicate --input <jsonl_file>
"""

import argparse
import json
import logging
import re
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple, Union

from chemistry_llm.data.schema.record import ChemNovaRecord

logger = logging.getLogger("chemistry_llm.data.deduplicate")


def normalize_text_for_match(text: Optional[str]) -> str:
    """Normalize text for invariant comparison (lowercased, whitespace-collapsed, stripped)."""
    if not text:
        return ""
    # Collapse multiple whitespaces and lower
    t = re.sub(r"\s+", " ", text.strip().lower())
    # Strip basic outer quotes or question marks for matching
    return t.strip("?\"'., ")


def normalize_smiles_for_match(smiles: Optional[str]) -> str:
    """Normalize SMILES string without altering case-sensitive chemical semantics."""
    if not smiles:
        return ""
    return smiles.strip()


class DuplicateRecordEntry:
    """Audit entry documenting an identified duplicate record."""

    def __init__(
        self,
        duplicate_id: str,
        original_id: str,
        reason: str,
        duplicate_field: str,
        sample_value: str,
    ):
        self.duplicate_id = duplicate_id
        self.original_id = original_id
        self.reason = reason
        self.duplicate_field = duplicate_field
        self.sample_value = sample_value[:120]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "duplicate_id": self.duplicate_id,
            "original_id": self.original_id,
            "reason": self.reason,
            "field": self.duplicate_field,
            "sample_value": self.sample_value,
        }


class DuplicateDetector:
    """Detects and logs duplicates across chemistry dataset records."""

    def __init__(
        self,
        dedup_mode: str = "qa_pair",  # "qa_pair" | "strict_question" | "full_record"
    ):
        self.dedup_mode = dedup_mode

    def process_records(
        self,
        records: List[ChemNovaRecord],
    ) -> Tuple[List[ChemNovaRecord], List[DuplicateRecordEntry], Dict[str, Any]]:
        """Deduplicate records list and produce an audit log.
        
        Returns:
            Tuple of (unique_records, duplicate_entries, summary_statistics)
        """
        unique_records: List[ChemNovaRecord] = []
        duplicate_entries: List[DuplicateRecordEntry] = []

        seen_ids: Dict[str, str] = {}
        seen_qa_pairs: Dict[str, str] = {}
        seen_questions: Dict[str, str] = {}
        seen_smiles: Dict[str, str] = {}
        seen_reactions: Dict[str, str] = {}
        seen_content_hashes: Dict[str, str] = {}

        breakdown: Dict[str, int] = {}

        for rec in records:
            rec_id = rec.id

            # 1. Duplicate ID Check
            if rec_id in seen_ids:
                dup = DuplicateRecordEntry(
                    duplicate_id=rec_id,
                    original_id=seen_ids[rec_id],
                    reason="duplicate_id",
                    duplicate_field="id",
                    sample_value=rec_id,
                )
                duplicate_entries.append(dup)
                breakdown["duplicate_id"] = breakdown.get("duplicate_id", 0) + 1
                continue
            seen_ids[rec_id] = rec_id

            # 2. Duplicate Question-Answer Pair
            norm_q = normalize_text_for_match(rec.question)
            norm_a = normalize_text_for_match(rec.answer)

            if norm_q and norm_a:
                qa_key = f"{norm_q}|||{norm_a}"
                if qa_key in seen_qa_pairs:
                    dup = DuplicateRecordEntry(
                        duplicate_id=rec_id,
                        original_id=seen_qa_pairs[qa_key],
                        reason="duplicate_qa_pair",
                        duplicate_field="question_and_answer",
                        sample_value=f"Q: {rec.question[:50]}... | A: {rec.answer[:50]}...",
                    )
                    duplicate_entries.append(dup)
                    breakdown["duplicate_qa_pair"] = breakdown.get("duplicate_qa_pair", 0) + 1
                    continue
                seen_qa_pairs[qa_key] = rec_id

            # 3. Strict Question Check (if mode is strict_question)
            if self.dedup_mode == "strict_question" and norm_q:
                if norm_q in seen_questions:
                    dup = DuplicateRecordEntry(
                        duplicate_id=rec_id,
                        original_id=seen_questions[norm_q],
                        reason="identical_question",
                        duplicate_field="question",
                        sample_value=rec.question or "",
                    )
                    duplicate_entries.append(dup)
                    breakdown["identical_question"] = breakdown.get("identical_question", 0) + 1
                    continue
                seen_questions[norm_q] = rec_id

            # 4. Chemical SMILES Check (for molecular records)
            if rec.smiles:
                norm_smi = normalize_smiles_for_match(rec.smiles)
                if norm_smi and norm_smi in seen_smiles and self.dedup_mode in ("full_record", "smiles", "chemical_record"):
                    dup = DuplicateRecordEntry(
                        duplicate_id=rec_id,
                        original_id=seen_smiles[norm_smi],
                        reason="duplicate_smiles",
                        duplicate_field="smiles",
                        sample_value=rec.smiles,
                    )
                    duplicate_entries.append(dup)
                    breakdown["duplicate_smiles"] = breakdown.get("duplicate_smiles", 0) + 1
                    continue
                seen_smiles[norm_smi] = rec_id

            # 5. Chemical Reaction Check
            if rec.reaction:
                norm_rxn = normalize_text_for_match(rec.reaction)
                if norm_rxn and norm_rxn in seen_reactions and self.dedup_mode in ("full_record", "reaction"):
                    dup = DuplicateRecordEntry(
                        duplicate_id=rec_id,
                        original_id=seen_reactions[norm_rxn],
                        reason="duplicate_reaction",
                        duplicate_field="reaction",
                        sample_value=rec.reaction,
                    )
                    duplicate_entries.append(dup)
                    breakdown["duplicate_reaction"] = breakdown.get("duplicate_reaction", 0) + 1
                    continue
                seen_reactions[norm_rxn] = rec_id

            # 6. Overall Content Hash Check (fingerprint fallback)
            c_hash = rec.get_content_hash()
            if c_hash in seen_content_hashes:
                dup = DuplicateRecordEntry(
                    duplicate_id=rec_id,
                    original_id=seen_content_hashes[c_hash],
                    reason="duplicate_content_hash",
                    duplicate_field="content_hash",
                    sample_value=c_hash,
                )
                duplicate_entries.append(dup)
                breakdown["duplicate_content_hash"] = breakdown.get("duplicate_content_hash", 0) + 1
                continue
            seen_content_hashes[c_hash] = rec_id

            unique_records.append(rec)

        summary = {
            "total_input_records": len(records),
            "unique_records": len(unique_records),
            "duplicate_records": len(duplicate_entries),
            "duplicate_breakdown": breakdown,
        }
        return unique_records, duplicate_entries, summary

    def deduplicate_file(
        self,
        input_file: Union[str, Path],
        output_file: Optional[Union[str, Path]] = None,
        audit_log_file: Optional[Union[str, Path]] = None,
    ) -> Dict[str, Any]:
        """Read JSONL file, deduplicate records, write clean output and audit log."""
        in_p = Path(input_file)
        if not in_p.exists():
            raise FileNotFoundError(f"Input file not found: {in_p}")

        stem = in_p.stem.replace("_imported", "").replace("_validated", "")
        out_p = Path(output_file) if output_file else Path(f"chemistry_llm/data/cleaned/{stem}_cleaned.jsonl")
        log_p = Path(audit_log_file) if audit_log_file else Path(f"chemistry_llm/data/metadata/{stem}_duplicates.json")

        out_p.parent.mkdir(parents=True, exist_ok=True)
        log_p.parent.mkdir(parents=True, exist_ok=True)

        records: List[ChemNovaRecord] = []
        with open(in_p, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    records.append(ChemNovaRecord.from_jsonl_line(line))

        unique_recs, dups, summary = self.process_records(records)

        # Write clean deduplicated records
        with open(out_p, "w", encoding="utf-8") as f:
            for rec in unique_recs:
                f.write(rec.to_jsonl_line() + "\n")

        # Write duplicate audit log
        audit_payload = {
            "source_file": str(in_p),
            "deduplication_mode": self.dedup_mode,
            "summary": summary,
            "duplicates": [d.to_dict() for d in dups],
        }
        with open(log_p, "w", encoding="utf-8") as f:
            json.dump(audit_payload, f, indent=2, ensure_ascii=False)

        summary["output_file"] = str(out_p)
        summary["audit_log_file"] = str(log_p)
        return summary


def main():
    parser = argparse.ArgumentParser(description="ChemNova Duplicate Detection CLI")
    parser.add_argument("--input", "-i", required=True, help="Input JSONL file to deduplicate")
    parser.add_argument("--output", "-o", default=None, help="Output deduplicated JSONL path")
    parser.add_argument("--log", "-l", default=None, help="Output audit log JSON path")
    parser.add_argument("--mode", "-m", default="qa_pair", choices=["qa_pair", "strict_question", "full_record"], help="Deduplication matching mode")

    args = parser.parse_args()
    detector = DuplicateDetector(dedup_mode=args.mode)
    summary = detector.deduplicate_file(args.input, output_file=args.output, audit_log_file=args.log)

    print("=" * 60)
    print("      CHEMNOVA DUPLICATE DETECTION REPORT")
    print("=" * 60)
    print(f"Total Input Records:   {summary['total_input_records']}")
    print(f"Unique Records:        {summary['unique_records']}")
    print(f"Duplicates Detected:   {summary['duplicate_records']}")
    print("-" * 60)
    print("Duplicate Breakdown:")
    for reason, count in summary["duplicate_breakdown"].items():
        print(f"  • {reason:<25} {count}")
    print("-" * 60)
    print(f"Clean Output JSONL:    {summary['output_file']}")
    print(f"Audit Log JSON:        {summary['audit_log_file']}")
    print("=" * 60)


if __name__ == "__main__":
    main()
