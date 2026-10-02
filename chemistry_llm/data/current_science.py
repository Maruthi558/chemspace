"""Live and current science tracking module.

Isolates recent scientific discoveries, preprints, and updates from the
static pretraining corpus.

All current science records are stored under:
chemistry_llm/data/current_science/

Tracks:
- information
- source
- publication_date
- retrieval_date
- source_url
- verification_status
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
from datetime import datetime, timezone
from pydantic import BaseModel, Field


class CurrentScienceEntry(BaseModel):
    """Structured record for contemporary chemistry research and updates."""
    id: str
    headline: str
    information: str
    domain: str
    subdomain: Optional[str] = None
    source: str
    source_url: str
    publication_date: str
    retrieval_date: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    verification_status: str = "pending_peer_review"  # peer_reviewed | preprint | preliminary | verified
    doi: Optional[str] = None
    chemical_entities: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)


class CurrentScienceManager:
    """Manages the isolated current science repository."""

    def __init__(self, base_dir: Optional[Union[str, Path]] = None):
        self.base_dir = Path(base_dir) if base_dir else Path("chemistry_llm/data/current_science")
        self.base_dir.mkdir(parents=True, exist_ok=True)
        self.catalog_file = self.base_dir / "current_science_catalog.json"
        self._ensure_catalog()

    def _ensure_catalog(self):
        if not self.catalog_file.exists():
            with open(self.catalog_file, "w", encoding="utf-8") as f:
                json.dump({"entries": [], "last_updated": datetime.now(timezone.utc).isoformat()}, f, indent=2)

    def add_entry(self, entry: CurrentScienceEntry) -> Path:
        """Add and persist a current science entry."""
        with open(self.catalog_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        # Update or append
        existing_idx = next((i for i, e in enumerate(data["entries"]) if e["id"] == entry.id), None)
        if existing_idx is not None:
            data["entries"][existing_idx] = entry.model_dump()
        else:
            data["entries"].append(entry.model_dump())

        data["last_updated"] = datetime.now(timezone.utc).isoformat()

        with open(self.catalog_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        # Also write standalone record
        entry_file = self.base_dir / f"{entry.id}.json"
        with open(entry_file, "w", encoding="utf-8") as f:
            json.dump(entry.model_dump(), f, indent=2, ensure_ascii=False)

        return entry_file

    def list_entries(self) -> List[Dict[str, Any]]:
        """List all current science updates."""
        if not self.catalog_file.exists():
            return []
        with open(self.catalog_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data.get("entries", [])
