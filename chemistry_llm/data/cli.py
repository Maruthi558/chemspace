"""ChemNova Dataset Infrastructure Unified CLI.

Provides unified command-line interface for all Step 2 dataset operations:
- ingest: Convert JSON, JSONL, CSV, TXT, MD to ChemNova JSONL
- validate: Check records against schema rules & quarantine invalid items
- deduplicate: Identify and log duplicate IDs, QA pairs, and molecules
- normalize: Standardize units, formulas, arrows, and whitespace
- split: Partition into train, validation, and test splits
- statistics: Generate comprehensive dataset distribution reports
- registry: List, inspect, and update dataset registry status
- pipeline: Run full end-to-end data quality pipeline

Usage:
    python -m chemistry_llm.data.cli <subcommand> [options]
"""

import argparse
import sys
from pathlib import Path

from chemistry_llm.data.ingest import DataIngestor
from chemistry_llm.data.validate import DataValidator
from chemistry_llm.data.deduplicate import DuplicateDetector
from chemistry_llm.data.normalize import DataNormalizer
from chemistry_llm.data.split import DatasetSplitter
from chemistry_llm.data.statistics import compute_dataset_statistics
from chemistry_llm.data.registry import DatasetRegistry
from chemistry_llm.data.pipeline import DataQualityPipeline


def main():
    parser = argparse.ArgumentParser(
        prog="python -m chemistry_llm.data.cli",
        description="ChemNova Chemistry Dataset Infrastructure CLI",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    # 1. Ingest
    ingest_p = subparsers.add_parser("ingest", help="Ingest raw files into ChemNova format")
    ingest_p.add_argument("--input", "-i", required=True, help="Input file or directory")
    ingest_p.add_argument("--output", "-o", default=None, help="Output JSONL path")
    ingest_p.add_argument("--source", "-s", default="local_ingest", help="Source attribution")
    ingest_p.add_argument("--license", "-l", default="OpenAccess", help="License")

    # 2. Validate
    val_p = subparsers.add_parser("validate", help="Validate records and quarantine invalid ones")
    val_p.add_argument("--input", "-i", required=True, help="Input JSONL file")
    val_p.add_argument("--validated", "-v", default=None, help="Output valid file")
    val_p.add_argument("--rejected", "-r", default=None, help="Output rejected file")

    # 3. Deduplicate
    dedup_p = subparsers.add_parser("deduplicate", help="Detect duplicates and generate audit log")
    dedup_p.add_argument("--input", "-i", required=True, help="Input JSONL file")
    dedup_p.add_argument("--output", "-o", default=None, help="Output deduplicated JSONL path")
    dedup_p.add_argument("--log", "-l", default=None, help="Output audit log JSON path")
    dedup_p.add_argument("--mode", default="qa_pair", choices=["qa_pair", "strict_question", "full_record"])

    # 4. Normalize
    norm_p = subparsers.add_parser("normalize", help="Normalize units, Unicode, arrows, and formulas")
    norm_p.add_argument("--input", "-i", required=True, help="Input JSONL file")
    norm_p.add_argument("--output", "-o", default=None, help="Output normalized JSONL path")

    # 5. Split
    split_p = subparsers.add_parser("split", help="Split dataset into train, val, and test partitions")
    split_p.add_argument("--input", "-i", required=True, help="Input JSONL file")
    split_p.add_argument("--train-ratio", type=float, default=0.80)
    split_p.add_argument("--val-ratio", type=float, default=0.10)
    split_p.add_argument("--test-ratio", type=float, default=0.10)
    split_p.add_argument("--seed", type=int, default=42)

    # 6. Statistics
    stats_p = subparsers.add_parser("statistics", help="Generate dataset repository statistics")
    stats_p.add_argument("--input", "-i", default="chemistry_llm/data")
    stats_p.add_argument("--output", "-o", default=None)

    # 7. Registry
    reg_p = subparsers.add_parser("registry", help="Inspect and query dataset registry")
    reg_p.add_argument("--list", "-l", action="store_true")
    reg_p.add_argument("--inspect", help="Inspect a specific dataset ID")

    # 8. Pipeline
    pipe_p = subparsers.add_parser("pipeline", help="Run full end-to-end data quality pipeline")
    pipe_p.add_argument("--input", "-i", required=True, help="Input raw file or directory")
    pipe_p.add_argument("--id", default=None)
    pipe_p.add_argument("--name", default=None)
    pipe_p.add_argument("--split", action="store_true")
    pipe_p.add_argument("--approve", action="store_true")

    args = parser.parse_args()

    if args.command == "ingest":
        ingestor = DataIngestor(default_source=args.source, default_license=args.license)
        in_p = Path(args.input)
        if in_p.is_file():
            recs = ingestor.ingest_file(in_p, output_file=args.output)
        else:
            out_f = args.output or Path("chemistry_llm/data/imported") / f"{in_p.stem}_imported.jsonl"
            recs = ingestor.ingest_directory(in_p, output_file=out_f)
        print(f"Ingested {len(recs)} records.")

    elif args.command == "validate":
        validator = DataValidator()
        res = validator.validate_file(args.input, validated_file=args.validated, rejected_file=args.rejected)
        print(f"Validated: {res['valid_count']} valid, {res['rejected_count']} rejected ({res['validation_rate_pct']}%)")

    elif args.command == "deduplicate":
        detector = DuplicateDetector(dedup_mode=args.mode)
        res = detector.deduplicate_file(args.input, output_file=args.output, audit_log_file=args.log)
        print(f"Deduplicated: {res['unique_records']} unique, {res['duplicate_records']} duplicates identified.")

    elif args.command == "normalize":
        normalizer = DataNormalizer()
        res = normalizer.normalize_file(args.input, output_file=args.output)
        print(f"Normalized {res['records_normalized']} records.")

    elif args.command == "split":
        splitter = DatasetSplitter(
            train_ratio=args.train_ratio,
            val_ratio=args.val_ratio,
            test_ratio=args.test_ratio,
            seed=args.seed,
        )
        res = splitter.split_file(args.input)
        print(f"Split completed: Train={res['train_count']}, Val={res['val_count']}, Test={res['test_count']}")

    elif args.command == "statistics":
        res = compute_dataset_statistics(args.input, output_file=args.output)
        print(f"Total Records: {res['total_records']}, Valid: {res['valid_records']}, Avg Length: {res['average_text_length']}")

    elif args.command == "registry":
        reg = DatasetRegistry()
        if args.inspect:
            d = reg.get(args.inspect)
            print(d.to_dict() if d else f"Dataset '{args.inspect}' not found.")
        else:
            items = reg.list_datasets()
            for d in items:
                print(f"• {d.dataset_id:<15} {d.dataset_name:<20} {d.status.value:<10} count={d.record_count}")

    elif args.command == "pipeline":
        pipeline = DataQualityPipeline()
        res = pipeline.run(
            input_path=args.input,
            dataset_id=args.id,
            dataset_name=args.name,
            split_data=args.split,
            approve_for_training=args.approve,
        )
        print(f"Pipeline finished for {res['dataset_id']}: {res['final_processed_count']} clean records.")


if __name__ == "__main__":
    main()
