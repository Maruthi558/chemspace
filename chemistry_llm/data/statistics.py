"""ChemNova Dataset Statistics Analysis Tool.

Computes comprehensive statistics across chemistry dataset repositories:
- Total, valid, rejected, and duplicate record counts
- Distribution across scientific domains
- Distribution across 30 dataset types
- Distribution across sources and providers
- Distribution by license status
- Train / Validation / Test split counts
- Average, maximum, and minimum text sequence lengths

Usage:
    python -m chemistry_llm.data.statistics [--input <path>]
"""

import argparse
import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from chemistry_llm.data.schema.record import ChemNovaRecord
from chemistry_llm.data.provenance import ProvenanceTracker

logger = logging.getLogger("chemistry_llm.data.statistics")


def analyze_records(records: List[ChemNovaRecord]) -> Dict[str, Any]:
    """Compute rich statistical metrics from a list of ChemNovaRecords."""
    if not records:
        return {
            "total_records": 0,
            "average_text_length": 0.0,
            "maximum_text_length": 0,
            "minimum_text_length": 0,
            "records_by_domain": {},
            "records_by_dataset_type": {},
            "records_by_source": {},
            "records_by_license_status": {},
            "records_by_difficulty": {},
        }

    tracker = ProvenanceTracker()
    by_domain: Dict[str, int] = {}
    by_type: Dict[str, int] = {}
    by_source: Dict[str, int] = {}
    by_license: Dict[str, int] = {}
    by_difficulty: Dict[str, int] = {"introductory": 0, "intermediate": 0, "advanced": 0}

    text_lengths: List[int] = []

    for r in records:
        # Domain
        d = r.domain or "unknown_domain"
        by_domain[d] = by_domain.get(d, 0) + 1

        # Type
        t = r.type or "unknown_type"
        by_type[t] = by_type.get(t, 0) + 1

        # Source
        s = r.source or "unknown_source"
        by_source[s] = by_source.get(s, 0) + 1

        # License
        lic_st = tracker.classify_license(r.license).value
        by_license[lic_st] = by_license.get(lic_st, 0) + 1

        # Content length
        txt = r.get_training_text()
        length = len(txt)
        text_lengths.append(length)

        # Scientific difficulty heuristic based on reasoning depth & formulas
        if r.reasoning or (r.reaction and r.conditions) or (length > 600):
            by_difficulty["advanced"] += 1
        elif r.explanation or length > 250 or r.formula:
            by_difficulty["intermediate"] += 1
        else:
            by_difficulty["introductory"] += 1

    avg_len = sum(text_lengths) / len(text_lengths) if text_lengths else 0.0
    max_len = max(text_lengths) if text_lengths else 0
    min_len = min(text_lengths) if text_lengths else 0

    return {
        "total_records": len(records),
        "average_text_length": round(avg_len, 1),
        "maximum_text_length": max_len,
        "minimum_text_length": min_len,
        "records_by_domain": dict(sorted(by_domain.items(), key=lambda x: x[1], reverse=True)),
        "records_by_dataset_type": dict(sorted(by_type.items(), key=lambda x: x[1], reverse=True)),
        "records_by_source": dict(sorted(by_source.items(), key=lambda x: x[1], reverse=True)),
        "records_by_license_status": by_license,
        "records_by_difficulty": by_difficulty,
    }


def compute_dataset_statistics(
    input_path: Union[str, Path] = "chemistry_llm/data",
    output_file: Optional[Union[str, Path]] = None,
) -> Dict[str, Any]:
    """Analyze records across a specific file or the entire chemistry_llm/data directory."""
    path = Path(input_path)
    records: List[ChemNovaRecord] = []

    # Counts for file states
    rejected_count = 0
    duplicate_count = 0
    train_count = 0
    val_count = 0
    test_count = 0

    if path.is_file():
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    records.append(ChemNovaRecord.from_jsonl_line(line))
    else:
        # Directory scan
        for f in path.rglob("*.jsonl"):
            # Check rejected
            if "rejected" in f.parts:
                with open(f, "r", encoding="utf-8") as rej_file:
                    rejected_count += sum(1 for line in rej_file if line.strip())
                continue

            # Read regular records
            with open(f, "r", encoding="utf-8") as jsonl_file:
                for line in jsonl_file:
                    if line.strip():
                        try:
                            rec = ChemNovaRecord.from_jsonl_line(line)
                            records.append(rec)
                            if "training" in f.parts:
                                train_count += 1
                            elif "validation" in f.parts:
                                val_count += 1
                            elif "test" in f.parts:
                                test_count += 1
                        except Exception:
                            pass

        # Scan duplicate metadata logs
        for dup_log in path.rglob("*_duplicates.json"):
            try:
                with open(dup_log, "r", encoding="utf-8") as df:
                    dup_data = json.load(df)
                    duplicate_count += len(dup_data.get("duplicates", []))
            except Exception:
                pass

    core_stats = analyze_records(records)

    report = {
        "evaluated_target": str(path),
        "total_records": core_stats["total_records"],
        "valid_records": core_stats["total_records"],
        "rejected_records": rejected_count,
        "duplicate_records": duplicate_count,
        "train_count": train_count,
        "validation_count": val_count,
        "test_count": test_count,
        "average_text_length": core_stats["average_text_length"],
        "maximum_text_length": core_stats["maximum_text_length"],
        "minimum_text_length": core_stats["minimum_text_length"],
        "records_by_domain": core_stats["records_by_domain"],
        "records_by_dataset_type": core_stats["records_by_dataset_type"],
        "records_by_source": core_stats["records_by_source"],
        "records_by_license_status": core_stats["records_by_license_status"],
        "records_by_difficulty": core_stats["records_by_difficulty"],
    }

    if output_file:
        out_p = Path(output_file)
        out_p.parent.mkdir(parents=True, exist_ok=True)
        with open(out_p, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

    return report


def main():
    parser = argparse.ArgumentParser(description="ChemNova Dataset Statistics Tool")
    parser.add_argument("--input", "-i", default="chemistry_llm/data", help="File or directory path to analyze")
    parser.add_argument("--output", "-o", default="chemistry_llm/data/statistics/dataset_statistics.json", help="Output summary JSON")

    args = parser.parse_args()
    rep = compute_dataset_statistics(args.input, output_file=args.output)

    print("=" * 65)
    print("           CHEMNOVA DATASET INFRASTRUCTURE STATISTICS")
    print("=" * 65)
    print(f"Target:                {rep['evaluated_target']}")
    print(f"Total Records:         {rep['total_records']}")
    print(f"Valid Records:         {rep['valid_records']}")
    print(f"Rejected Records:      {rep['rejected_records']}")
    print(f"Duplicate Records:     {rep['duplicate_records']}")
    print("-" * 65)
    print(f"Train / Val / Test:    {rep['train_count']} / {rep['validation_count']} / {rep['test_count']}")
    print(f"Average Text Length:   {rep['average_text_length']} chars (Max: {rep['maximum_text_length']}, Min: {rep['minimum_text_length']})")
    print("-" * 65)
    print("Domains:")
    for dom, cnt in list(rep["records_by_domain"].items())[:6]:
        print(f"  • {dom:<25} {cnt}")
    print("-" * 65)
    print("Dataset Types:")
    for typ, cnt in list(rep["records_by_dataset_type"].items())[:6]:
        print(f"  • {typ:<25} {cnt}")
    print("-" * 65)
    print("License Status:")
    for lic, cnt in rep["records_by_license_status"].items():
        print(f"  • {lic:<25} {cnt}")
    print("=" * 65)


if __name__ == "__main__":
    main()
