"""ChemNova Dataset Registry System.

Maintains an authoritative registry of all chemistry datasets:
- Tracks dataset ID, version, provenance, and license
- Tracks validated, rejected, and total record counts
- Tracks lifecycle status: imported, validating, validated, approved, rejected, archived
- Prevents unapproved datasets from entering the training pipeline

Registry File:
    chemistry_llm/data/dataset_registry.json

Usage:
    python -m chemistry_llm.data.registry --list
"""

import argparse
from datetime import datetime, timezone
import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from chemistry_llm.data.schema.types import DatasetStatus
from chemistry_llm.data.schema.record import current_iso_time

logger = logging.getLogger("chemistry_llm.data.registry")

DEFAULT_REGISTRY_PATH = Path("chemistry_llm/data/dataset_registry.json")


class DatasetEntry:
    """Metadata record for a registered dataset."""

    def __init__(
        self,
        dataset_id: str,
        dataset_name: str,
        version: str = "1.0.0",
        source: str = "unknown",
        source_url: Optional[str] = None,
        license: str = "OpenAccess",
        record_count: int = 0,
        validated_count: int = 0,
        rejected_count: int = 0,
        date_added: Optional[str] = None,
        status: Union[DatasetStatus, str] = DatasetStatus.IMPORTED,
        description: str = "",
    ):
        self.dataset_id = dataset_id
        self.dataset_name = dataset_name
        self.version = version
        self.source = source
        self.source_url = source_url
        self.license = license
        self.record_count = record_count
        self.validated_count = validated_count
        self.rejected_count = rejected_count
        self.date_added = date_added or current_iso_time()
        self.status = DatasetStatus(status) if isinstance(status, str) else status
        self.description = description

    def to_dict(self) -> Dict[str, Any]:
        return {
            "dataset_id": self.dataset_id,
            "dataset_name": self.dataset_name,
            "version": self.version,
            "source": self.source,
            "source_url": self.source_url,
            "license": self.license,
            "record_count": self.record_count,
            "validated_count": self.validated_count,
            "rejected_count": self.rejected_count,
            "date_added": self.date_added,
            "status": self.status.value,
            "description": self.description,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "DatasetEntry":
        return cls(
            dataset_id=data["dataset_id"],
            dataset_name=data["dataset_name"],
            version=data.get("version", "1.0.0"),
            source=data.get("source", "unknown"),
            source_url=data.get("source_url"),
            license=data.get("license", "OpenAccess"),
            record_count=data.get("record_count", 0),
            validated_count=data.get("validated_count", 0),
            rejected_count=data.get("rejected_count", 0),
            date_added=data.get("date_added"),
            status=data.get("status", DatasetStatus.IMPORTED.value),
            description=data.get("description", ""),
        )


class DatasetRegistry:
    """Manages the dataset_registry.json index."""

    def __init__(self, registry_file: Union[str, Path] = DEFAULT_REGISTRY_PATH):
        self.registry_file = Path(registry_file)
        self.entries: Dict[str, DatasetEntry] = {}
        self.load()

    def load(self) -> None:
        """Load registry from JSON file or create initial index."""
        if self.registry_file.exists():
            try:
                with open(self.registry_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                datasets = data.get("datasets", {})
                self.entries = {
                    k: DatasetEntry.from_dict(v) for k, v in datasets.items()
                }
            except Exception as e:
                logger.error("Error reading registry file %s: %s", self.registry_file, e)
                self.entries = {}
        else:
            self.entries = {}
            self.save()

    def save(self) -> None:
        """Persist registry to JSON file."""
        self.registry_file.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "registry_version": "1.0.0",
            "last_updated": current_iso_time(),
            "dataset_count": len(self.entries),
            "datasets": {k: v.to_dict() for k, v in self.entries.items()},
        }
        with open(self.registry_file, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)

    def register(self, entry: Union[DatasetEntry, Dict[str, Any]]) -> DatasetEntry:
        """Register or update a dataset entry."""
        if isinstance(entry, dict):
            obj = DatasetEntry.from_dict(entry)
        else:
            obj = entry

        self.entries[obj.dataset_id] = obj
        self.save()
        logger.info("Registered dataset %s (%s)", obj.dataset_id, obj.status.value)
        return obj

    def get(self, dataset_id: str) -> Optional[DatasetEntry]:
        """Fetch dataset entry by ID."""
        return self.entries.get(dataset_id)

    def update_status(self, dataset_id: str, new_status: Union[DatasetStatus, str]) -> bool:
        """Update dataset status."""
        entry = self.get(dataset_id)
        if not entry:
            return False
        entry.status = DatasetStatus(new_status) if isinstance(new_status, str) else new_status
        self.save()
        return True

    def update_counts(
        self,
        dataset_id: str,
        record_count: Optional[int] = None,
        validated_count: Optional[int] = None,
        rejected_count: Optional[int] = None,
    ) -> bool:
        """Update dataset counts."""
        entry = self.get(dataset_id)
        if not entry:
            return False
        if record_count is not None:
            entry.record_count = record_count
        if validated_count is not None:
            entry.validated_count = validated_count
        if rejected_count is not None:
            entry.rejected_count = rejected_count
        self.save()
        return True

    def list_datasets(self, status: Optional[Union[DatasetStatus, str]] = None) -> List[DatasetEntry]:
        """List datasets with optional status filter."""
        items = list(self.entries.values())
        if status:
            target_status = DatasetStatus(status) if isinstance(status, str) else status
            items = [item for item in items if item.status == target_status]
        return sorted(items, key=lambda x: x.date_added, reverse=True)


def main():
    parser = argparse.ArgumentParser(description="ChemNova Dataset Registry CLI")
    parser.add_argument("--list", "-l", action="store_true", help="List all registered datasets")
    parser.add_argument("--status", choices=[s.value for s in DatasetStatus], help="Filter listing by status")
    parser.add_argument("--inspect", "-i", help="Inspect a specific dataset ID")
    parser.add_argument("--registry-file", default=str(DEFAULT_REGISTRY_PATH), help="Path to registry JSON file")

    args = parser.parse_args()
    reg = DatasetRegistry(args.registry_file)

    if args.inspect:
        entry = reg.get(args.inspect)
        if not entry:
            print(f"Dataset '{args.inspect}' not found.")
            return
        print(json.dumps(entry.to_dict(), indent=2))
        return

    datasets = reg.list_datasets(status=args.status)
    print("=" * 80)
    print("                     CHEMNOVA DATASET REGISTRY")
    print("=" * 80)
    print(f"{'ID':<18} {'Name':<22} {'Status':<12} {'Total':<8} {'Valid':<8} {'License':<10}")
    print("-" * 80)
    if not datasets:
        print("No datasets registered yet.")
    for d in datasets:
        print(f"{d.dataset_id:<18} {d.dataset_name[:20]:<22} {d.status.value:<12} {d.record_count:<8} {d.validated_count:<8} {d.license[:10]:<10}")
    print("=" * 80)


if __name__ == "__main__":
    main()
