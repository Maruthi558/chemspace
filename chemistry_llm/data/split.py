"""ChemNova Dataset Splitting Infrastructure.

Splits verified and normalized chemistry records into:
- Training dataset (default: 80%)
- Validation dataset (default: 10%)
- Test dataset (default: 10%)

Features:
- Deterministic, reproducible partition using configurable random seed.
- Content-hash grouping preventing prompt/concept leakage across splits.
- Zero cross-split contamination guarantee.

Usage:
    python -m chemistry_llm.data.split --input <jsonl_file> --seed 42
"""

import argparse
import json
import logging
from pathlib import Path
import random
from typing import Any, Dict, List, Optional, Tuple, Union

from chemistry_llm.data.schema.record import ChemNovaRecord

logger = logging.getLogger("chemistry_llm.data.split")


class DatasetSplitter:
    """Reproducible dataset partitioner with contamination prevention."""

    def __init__(
        self,
        train_ratio: float = 0.80,
        val_ratio: float = 0.10,
        test_ratio: float = 0.10,
        seed: int = 42,
    ):
        total = train_ratio + val_ratio + test_ratio
        assert abs(total - 1.0) < 1e-4, f"Split ratios must sum to 1.0 (got {total})"
        self.train_ratio = train_ratio
        self.val_ratio = val_ratio
        self.test_ratio = test_ratio
        self.seed = seed

    def split_records(
        self,
        records: List[ChemNovaRecord],
    ) -> Tuple[List[ChemNovaRecord], List[ChemNovaRecord], List[ChemNovaRecord], Dict[str, Any]]:
        """Partition records list into (train, val, test) with no concept leakage.
        
        Returns:
            Tuple of (train_records, val_records, test_records, split_metadata)
        """
        if not records:
            return [], [], [], {"total": 0, "train": 0, "val": 0, "test": 0}

        # Group records by content hash to prevent near-duplicate leakage
        hash_to_records: Dict[str, List[ChemNovaRecord]] = {}
        for rec in records:
            h = rec.get_content_hash()
            if h not in hash_to_records:
                hash_to_records[h] = []
            hash_to_records[h].append(rec)

        # Deterministic shuffle of unique groups
        group_keys = sorted(list(hash_to_records.keys()))
        rng = random.Random(self.seed)
        rng.shuffle(group_keys)

        n_groups = len(group_keys)
        n_train_groups = int(n_groups * self.train_ratio)
        n_val_groups = int(n_groups * self.val_ratio)

        train_keys = set(group_keys[:n_train_groups])
        val_keys = set(group_keys[n_train_groups : n_train_groups + n_val_groups])
        test_keys = set(group_keys[n_train_groups + n_val_groups :])

        train_records: List[ChemNovaRecord] = []
        val_records: List[ChemNovaRecord] = []
        test_records: List[ChemNovaRecord] = []

        for h, rec_group in hash_to_records.items():
            if h in train_keys:
                train_records.extend(rec_group)
            elif h in val_keys:
                val_records.extend(rec_group)
            else:
                test_records.extend(rec_group)

        # Verification of no cross-split leakage
        train_hashes = {r.get_content_hash() for r in train_records}
        val_hashes = {r.get_content_hash() for r in val_records}
        test_hashes = {r.get_content_hash() for r in test_records}

        assert len(train_hashes.intersection(val_hashes)) == 0, "Data leakage detected between train and val!"
        assert len(train_hashes.intersection(test_hashes)) == 0, "Data leakage detected between train and test!"
        assert len(val_hashes.intersection(test_hashes)) == 0, "Data leakage detected between val and test!"

        total_recs = len(records)
        metadata = {
            "seed": self.seed,
            "total_records": total_recs,
            "unique_content_groups": n_groups,
            "train_count": len(train_records),
            "train_pct": round(len(train_records) / total_recs * 100.0, 1),
            "val_count": len(val_records),
            "val_pct": round(len(val_records) / total_recs * 100.0, 1),
            "test_count": len(test_records),
            "test_pct": round(len(test_records) / total_recs * 100.0, 1),
            "leakage_check_passed": True,
        }

        return train_records, val_records, test_records, metadata

    def split_file(
        self,
        input_file: Union[str, Path],
        train_output: Optional[Union[str, Path]] = None,
        val_output: Optional[Union[str, Path]] = None,
        test_output: Optional[Union[str, Path]] = None,
    ) -> Dict[str, Any]:
        """Split a JSONL dataset file into training, validation, and test files."""
        in_p = Path(input_file)
        if not in_p.exists():
            raise FileNotFoundError(f"Dataset file not found: {in_p}")

        stem = in_p.stem.replace("_cleaned", "").replace("_normalized", "").replace("_validated", "")

        tr_p = Path(train_output) if train_output else Path(f"chemistry_llm/data/training/{stem}_train.jsonl")
        vl_p = Path(val_output) if val_output else Path(f"chemistry_llm/data/validation/{stem}_val.jsonl")
        ts_p = Path(test_output) if test_output else Path(f"chemistry_llm/data/test/{stem}_test.jsonl")

        for p in [tr_p, vl_p, ts_p]:
            p.parent.mkdir(parents=True, exist_ok=True)

        records: List[ChemNovaRecord] = []
        with open(in_p, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    records.append(ChemNovaRecord.from_jsonl_line(line))

        train_recs, val_recs, test_recs, meta = self.split_records(records)

        with open(tr_p, "w", encoding="utf-8") as f:
            for r in train_recs:
                f.write(r.to_jsonl_line() + "\n")

        with open(vl_p, "w", encoding="utf-8") as f:
            for r in val_recs:
                f.write(r.to_jsonl_line() + "\n")

        with open(ts_p, "w", encoding="utf-8") as f:
            for r in test_recs:
                f.write(r.to_jsonl_line() + "\n")

        meta["train_file"] = str(tr_p)
        meta["val_file"] = str(vl_p)
        meta["test_file"] = str(ts_p)

        logger.info(
            "Split complete: %d train (%.1f%%), %d val (%.1f%%), %d test (%.1f%%)",
            meta["train_count"], meta["train_pct"],
            meta["val_count"], meta["val_pct"],
            meta["test_count"], meta["test_pct"],
        )
        return meta


def main():
    parser = argparse.ArgumentParser(description="ChemNova Dataset Train/Val/Test Splitter CLI")
    parser.add_argument("--input", "-i", required=True, help="Input JSONL dataset file")
    parser.add_argument("--train-ratio", type=float, default=0.80, help="Train set ratio (default: 0.8)")
    parser.add_argument("--val-ratio", type=float, default=0.10, help="Val set ratio (default: 0.1)")
    parser.add_argument("--test-ratio", type=float, default=0.10, help="Test set ratio (default: 0.1)")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")

    args = parser.parse_args()
    splitter = DatasetSplitter(
        train_ratio=args.train_ratio,
        val_ratio=args.val_ratio,
        test_ratio=args.test_ratio,
        seed=args.seed,
    )
    meta = splitter.split_file(args.input)

    print("=" * 60)
    print("      CHEMNOVA TRAIN / VAL / TEST SPLIT REPORT")
    print("=" * 60)
    print(f"Total Records:         {meta['total_records']}")
    print(f"Random Seed:           {meta['seed']}")
    print(f"Zero-Leakage Check:    {'PASSED' if meta['leakage_check_passed'] else 'FAILED'}")
    print("-" * 60)
    print(f"Train Records:         {meta['train_count']} ({meta['train_pct']}%) -> {meta['train_file']}")
    print(f"Validation Records:    {meta['val_count']} ({meta['val_pct']}%) -> {meta['val_file']}")
    print(f"Test Records:          {meta['test_count']} ({meta['test_pct']}%) -> {meta['test_file']}")
    print("=" * 60)


if __name__ == "__main__":
    main()
