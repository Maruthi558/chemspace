"""ChemNova End-to-End Data Quality Pipeline.

Orchestrates the scientific dataset lifecycle:
RAW
 ↓
IMPORT (DataIngestor: multi-format parsing -> data/imported/)
 ↓
VALIDATION (DataValidator: schema verification -> valid to data/validated/, invalid to data/rejected/)
 ↓
DEDUPLICATION (DuplicateDetector: ID, QA, and SMILES dedup -> data/cleaned/)
 ↓
NORMALIZATION (DataNormalizer: units, formulas, unicode, reaction notation -> data/normalized/)
 ↓
QUALITY CHECK (ProvenanceTracker: license & provenance verification)
 ↓
PROCESSED (data/processed/ ready for approval)
 ↓
TRAIN / VALIDATION / TEST (DatasetSplitter: reproducible zero-leakage split)

Usage:
    python -m chemistry_llm.data.pipeline --input <file_or_dir> [--split]
"""

import argparse
import logging
from pathlib import Path
from typing import Any, Dict, Optional, Union

from chemistry_llm.data.ingest import DataIngestor
from chemistry_llm.data.validate import DataValidator
from chemistry_llm.data.deduplicate import DuplicateDetector
from chemistry_llm.data.normalize import DataNormalizer
from chemistry_llm.data.provenance import ProvenanceTracker, DatasetManifest
from chemistry_llm.data.split import DatasetSplitter
from chemistry_llm.data.registry import DatasetRegistry, DatasetEntry
from chemistry_llm.data.schema.types import DatasetStatus

logger = logging.getLogger("chemistry_llm.data.pipeline")


class DataQualityPipeline:
    """End-to-end dataset processing and quality assurance coordinator."""

    def __init__(
        self,
        base_dir: Union[str, Path] = "chemistry_llm/data",
        registry_file: Optional[Union[str, Path]] = None,
    ):
        self.base_dir = Path(base_dir)
        self.ingestor = DataIngestor()
        self.validator = DataValidator()
        self.deduplicator = DuplicateDetector()
        self.normalizer = DataNormalizer()
        self.provenance_tracker = ProvenanceTracker()
        self.splitter = DatasetSplitter()
        self.registry = DatasetRegistry(
            registry_file or (self.base_dir / "dataset_registry.json")
        )

    def run(
        self,
        input_path: Union[str, Path],
        dataset_id: Optional[str] = None,
        dataset_name: Optional[str] = None,
        source: str = "manual_import",
        license_str: str = "OpenAccess",
        split_data: bool = False,
        approve_for_training: bool = False,
    ) -> Dict[str, Any]:
        """Execute full data quality pipeline on raw input file or directory."""
        in_p = Path(input_path)
        if not in_p.exists():
            raise FileNotFoundError(f"Input path not found: {in_p}")

        stem = in_p.stem
        d_id = dataset_id or f"ds_{stem}"
        d_name = dataset_name or stem.replace("_", " ").title()

        logger.info("Starting DataQualityPipeline for dataset '%s' (ID: %s)", d_name, d_id)

        # Stage 1: INGESTION -> data/imported/
        imported_file = self.base_dir / "imported" / f"{stem}_imported.jsonl"
        if in_p.is_file():
            self.ingestor.ingest_file(in_p, output_file=imported_file)
        else:
            self.ingestor.ingest_directory(in_p, output_file=imported_file)

        # Stage 2: VALIDATION -> data/validated/ & data/rejected/
        val_file = self.base_dir / "validated" / f"{stem}_validated.jsonl"
        rej_file = self.base_dir / "rejected" / f"{stem}_rejected.jsonl"
        val_rep = self.validator.validate_file(
            imported_file, validated_file=val_file, rejected_file=rej_file
        )

        # Stage 3: DEDUPLICATION -> data/cleaned/
        clean_file = self.base_dir / "cleaned" / f"{stem}_cleaned.jsonl"
        dup_log_file = self.base_dir / "metadata" / f"{stem}_duplicates.json"
        dedup_rep = self.deduplicator.deduplicate_file(
            val_file, output_file=clean_file, audit_log_file=dup_log_file
        )

        # Stage 4: NORMALIZATION -> data/normalized/
        norm_file = self.base_dir / "normalized" / f"{stem}_normalized.jsonl"
        norm_rep = self.normalizer.normalize_file(clean_file, output_file=norm_file)

        # Stage 5: PROVENANCE AUDIT & PROCESSED -> data/processed/
        proc_file = self.base_dir / "processed" / f"{stem}_processed.jsonl"
        proc_file.parent.mkdir(parents=True, exist_ok=True)

        # Copy normalized to processed
        import shutil
        shutil.copyfile(norm_file, proc_file)

        audit_rep = self.provenance_tracker.audit_dataset_file(proc_file)

        # Stage 6: REGISTRY
        final_status = DatasetStatus.APPROVED if approve_for_training else DatasetStatus.VALIDATED
        entry = DatasetEntry(
            dataset_id=d_id,
            dataset_name=d_name,
            source=source,
            license=license_str,
            record_count=val_rep["total_evaluated"],
            validated_count=norm_rep["records_normalized"],
            rejected_count=val_rep["rejected_count"],
            status=final_status,
            description=f"Ingested from {in_p.name} through ChemNova Data Quality Pipeline",
        )
        self.registry.register(entry)

        # Stage 7: SPLIT (Optional) -> training/, validation/, test/
        split_meta = {}
        if split_data:
            split_meta = self.splitter.split_file(proc_file)

        summary = {
            "dataset_id": d_id,
            "dataset_name": d_name,
            "total_ingested": val_rep["total_evaluated"],
            "validated_count": val_rep["valid_count"],
            "rejected_count": val_rep["rejected_count"],
            "duplicates_removed": dedup_rep["duplicate_records"],
            "final_processed_count": norm_rep["records_normalized"],
            "processed_file": str(proc_file),
            "status": final_status.value,
            "training_compliant": audit_rep["training_compliant"],
            "split_executed": split_data,
            "split_summary": split_meta,
        }

        logger.info("Pipeline completed successfully for %s", d_id)
        return summary


def main():
    parser = argparse.ArgumentParser(description="ChemNova Data Quality Pipeline CLI")
    parser.add_argument("--input", "-i", required=True, help="Input raw file or directory")
    parser.add_argument("--id", default=None, help="Dataset unique ID")
    parser.add_argument("--name", default=None, help="Dataset descriptive name")
    parser.add_argument("--source", "-s", default="manual_import", help="Source attribution")
    parser.add_argument("--license", "-l", default="OpenAccess", help="License type")
    parser.add_argument("--split", action="store_true", help="Automatically partition into train/val/test splits")
    parser.add_argument("--approve", action="store_true", help="Explicitly approve dataset for future training")

    args = parser.parse_args()
    pipeline = DataQualityPipeline()
    res = pipeline.run(
        input_path=args.input,
        dataset_id=args.id,
        dataset_name=args.name,
        source=args.source,
        license_str=args.license,
        split_data=args.split,
        approve_for_training=args.approve,
    )

    print("=" * 65)
    print("      CHEMNOVA DATA QUALITY PIPELINE EXECUTION SUMMARY")
    print("=" * 65)
    print(f"Dataset ID:            {res['dataset_id']}")
    print(f"Total Ingested:        {res['total_ingested']}")
    print(f"Valid Records:         {res['validated_count']}")
    print(f"Rejected Records:      {res['rejected_count']}")
    print(f"Duplicates Removed:    {res['duplicates_removed']}")
    print(f"Final Clean Records:   {res['final_processed_count']}")
    print(f"Status in Registry:    {res['status'].upper()}")
    print(f"Processed File:        {res['processed_file']}")
    print("=" * 65)


if __name__ == "__main__":
    main()
