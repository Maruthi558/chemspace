"""ChemNova Dataset Provenance and License Tracking System.

Maintains complete traceability for scientific datasets:
- Source attribution (name, URL, author/provider)
- License verification status (verified, unverified, restricted, unknown_license)
- Access dates and audit timestamps
- Transformation history across pipeline stages
- License compliance gating (prevents training on restricted or unvetted data)

Usage:
    python -m chemistry_llm.data.provenance --input <jsonl_file>
"""

import argparse
from datetime import datetime, timezone
import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple, Union

from chemistry_llm.data.schema.record import ChemNovaRecord, current_iso_time
from chemistry_llm.data.schema.types import LicenseStatus

logger = logging.getLogger("chemistry_llm.data.provenance")


class DatasetManifest:
    """Provenance and license manifest for an individual dataset."""

    def __init__(
        self,
        dataset_id: str,
        dataset_name: str,
        source_name: str,
        source_url: Optional[str] = None,
        author_provider: Optional[str] = None,
        license_type: str = "OpenAccess",
        license_status: LicenseStatus = LicenseStatus.VERIFIED,
        access_date: Optional[str] = None,
        description: Optional[str] = None,
        custom_metadata: Optional[Dict[str, Any]] = None,
    ):
        self.dataset_id = dataset_id
        self.dataset_name = dataset_name
        self.source_name = source_name
        self.source_url = source_url
        self.author_provider = author_provider
        self.license_type = license_type
        self.license_status = license_status
        self.access_date = access_date or current_iso_time()
        self.description = description or ""
        self.custom_metadata = custom_metadata or {}
        self.created_at = current_iso_time()
        self.updated_at = current_iso_time()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "dataset_id": self.dataset_id,
            "dataset_name": self.dataset_name,
            "source_name": self.source_name,
            "source_url": self.source_url,
            "author_provider": self.author_provider,
            "license_type": self.license_type,
            "license_status": self.license_status.value if isinstance(self.license_status, LicenseStatus) else self.license_status,
            "access_date": self.access_date,
            "description": self.description,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "custom_metadata": self.custom_metadata,
        }

    def save_json(self, file_path: Union[str, Path]) -> None:
        p = Path(file_path)
        p.parent.mkdir(parents=True, exist_ok=True)
        with open(p, "w", encoding="utf-8") as f:
            json.dump(self.to_dict(), f, indent=2, ensure_ascii=False)

    @classmethod
    def load_json(cls, file_path: Union[str, Path]) -> "DatasetManifest":
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        status_val = LicenseStatus(data.get("license_status", LicenseStatus.UNVERIFIED.value))
        return cls(
            dataset_id=data["dataset_id"],
            dataset_name=data["dataset_name"],
            source_name=data["source_name"],
            source_url=data.get("source_url"),
            author_provider=data.get("author_provider"),
            license_type=data.get("license_type", "OpenAccess"),
            license_status=status_val,
            access_date=data.get("access_date"),
            description=data.get("description"),
            custom_metadata=data.get("custom_metadata", {}),
        )


class ProvenanceTracker:
    """Manages provenance auditing, license tagging, and training compliance."""

    KNOWN_OPEN_LICENSES = {
        "cc0", "public domain", "cc-by", "cc-by-4.0", "cc-by-3.0",
        "cc-by-sa", "mit", "apache-2.0", "bsd", "openaccess",
    }

    RESTRICTED_LICENSES = {
        "proprietary", "all rights reserved", "restricted", "commercial_only",
        "cc-by-nc", "cc-by-nc-nd", "cc-by-nc-sa", "non-commercial",
    }

    def classify_license(self, license_str: Optional[str]) -> LicenseStatus:
        """Classify license string into a standardized LicenseStatus."""
        if not license_str or not license_str.strip():
            return LicenseStatus.UNKNOWN_LICENSE

        clean = license_str.strip().lower()
        if clean in {"unknown", "unspecified", "none"}:
            return LicenseStatus.UNKNOWN_LICENSE

        for lic in self.RESTRICTED_LICENSES:
            if lic in clean:
                return LicenseStatus.RESTRICTED

        for lic in self.KNOWN_OPEN_LICENSES:
            if lic in clean:
                return LicenseStatus.VERIFIED

        return LicenseStatus.UNVERIFIED

    def audit_dataset_file(self, file_path: Union[str, Path]) -> Dict[str, Any]:
        """Audit all records in a JSONL dataset for license and provenance integrity."""
        in_p = Path(file_path)
        if not in_p.exists():
            raise FileNotFoundError(f"Dataset file not found: {in_p}")

        total_records = 0
        license_counts: Dict[str, int] = {}
        status_counts: Dict[str, int] = {
            LicenseStatus.VERIFIED.value: 0,
            LicenseStatus.UNVERIFIED.value: 0,
            LicenseStatus.RESTRICTED.value: 0,
            LicenseStatus.UNKNOWN_LICENSE.value: 0,
        }
        sources: Set[str] = set()
        missing_source_count = 0

        with open(in_p, "r", encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue
                total_records += 1
                rec = ChemNovaRecord.from_jsonl_line(line)

                # Track source
                if rec.source:
                    sources.add(rec.source)
                else:
                    missing_source_count += 1

                # Track license
                lic = rec.license or "unknown"
                license_counts[lic] = license_counts.get(lic, 0) + 1

                status = self.classify_license(lic)
                status_counts[status.value] += 1

        allowed_for_training = (status_counts[LicenseStatus.RESTRICTED.value] == 0) and (
            status_counts[LicenseStatus.UNKNOWN_LICENSE.value] == 0
        )

        return {
            "file": str(in_p),
            "total_records": total_records,
            "unique_sources": sorted(list(sources)),
            "missing_source_records": missing_source_count,
            "license_distribution": license_counts,
            "license_status_summary": status_counts,
            "training_compliant": allowed_for_training,
        }

    def filter_compliant_records(
        self,
        records: List[ChemNovaRecord],
        allow_unverified: bool = False,
    ) -> Tuple[List[ChemNovaRecord], List[ChemNovaRecord]]:
        """Filter records to only those safe and approved for training.
        
        Returns:
            Tuple of (compliant_records, quarantined_records)
        """
        allowed: List[ChemNovaRecord] = []
        quarantined: List[ChemNovaRecord] = []

        allowed_statuses = {LicenseStatus.VERIFIED}
        if allow_unverified:
            allowed_statuses.add(LicenseStatus.UNVERIFIED)

        for rec in records:
            st = self.classify_license(rec.license)
            if st in allowed_statuses and rec.source:
                allowed.append(rec)
            else:
                quarantined.append(rec)

        return allowed, quarantined


def main():
    parser = argparse.ArgumentParser(description="ChemNova Provenance & License Auditing CLI")
    parser.add_argument("--input", "-i", required=True, help="Input JSONL file to audit")
    args = parser.parse_args()

    tracker = ProvenanceTracker()
    audit = tracker.audit_dataset_file(args.input)

    print("=" * 60)
    print("      CHEMNOVA DATASET PROVENANCE & LICENSE AUDIT")
    print("=" * 60)
    print(f"Dataset File:          {audit['file']}")
    print(f"Total Records:         {audit['total_records']}")
    print(f"Unique Sources:        {len(audit['unique_sources'])} ({', '.join(audit['unique_sources'][:3])})")
    print(f"Training Compliant:    {'YES' if audit['training_compliant'] else 'NO (Contains restricted/unknown data)'}")
    print("-" * 60)
    print("License Status Breakdown:")
    for status, count in audit["license_status_summary"].items():
        print(f"  • {status:<20} {count}")
    print("=" * 60)


if __name__ == "__main__":
    main()
