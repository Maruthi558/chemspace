"""Scientific conflict detection and logging module.

Detects and documents conflicting scientific values across sources:
- Conflicting thermodynamic values (e.g. melting point, boiling point)
- Differing pKa values or electronegativities
- Incompatible reaction conditions or outcomes
- Discrepancies between experimental databases (e.g. PubChem vs NIST)

Maintains provenance and avoids silent deletion by saving conflicts to
chemistry_corpus/conflicts/
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
from datetime import datetime, timezone
from pydantic import BaseModel, Field

from chemistry_llm.data.schema.record import ChemNovaRecord


class ScientificConflictRecord(BaseModel):
    """Structured record of a detected scientific contradiction or value discrepancy."""
    conflict_id: str
    entity_name: str
    property_name: str
    source_a: str
    value_a: Any
    source_b: str
    value_b: Any
    discrepancy_description: str
    detected_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    resolution_status: str = "documented_unresolved"  # documented_unresolved | resolved_by_consensus | experimental_variance


class ConflictDetector:
    """Detects and logs discrepancies among scientific records."""

    def __init__(self, output_dir: Optional[Union[str, Path]] = None):
        self.output_dir = Path(output_dir) if output_dir else Path("chemistry_llm/data/chemistry_corpus/conflicts")
        self.conflicts: List[ScientificConflictRecord] = []

    def check_property_conflicts(
        self,
        entity_name: str,
        property_name: str,
        value_a: Any,
        source_a: str,
        value_b: Any,
        source_b: str,
        tolerance: float = 0.05,
    ) -> Optional[ScientificConflictRecord]:
        """Compare numerical or categorical property values from two sources."""
        if source_a == source_b or value_a is None or value_b is None:
            return None

        is_conflict = False
        desc = ""

        # Numerical comparison
        if isinstance(value_a, (int, float)) and isinstance(value_b, (int, float)):
            avg = (abs(value_a) + abs(value_b)) / 2.0
            diff = abs(value_a - value_b)
            rel_diff = diff / avg if avg > 0 else 0.0
            if rel_diff > tolerance:
                is_conflict = True
                desc = (
                    f"Numerical discrepancy for '{property_name}' of '{entity_name}': "
                    f"{value_a} ({source_a}) vs {value_b} ({source_b}) (relative diff: {rel_diff:.1%})"
                )
        else:
            # String / categorical comparison
            str_a = str(value_a).strip().lower()
            str_b = str(value_b).strip().lower()
            if str_a != str_b:
                is_conflict = True
                desc = (
                    f"Categorical mismatch for '{property_name}' of '{entity_name}': "
                    f"'{value_a}' ({source_a}) vs '{value_b}' ({source_b})"
                )

        if is_conflict:
            conflict_rec = ScientificConflictRecord(
                conflict_id=f"conf_{abs(hash(f'{entity_name}_{property_name}_{source_a}_{source_b}')) % 10000000:07d}",
                entity_name=entity_name,
                property_name=property_name,
                source_a=source_a,
                value_a=value_a,
                source_b=source_b,
                value_b=value_b,
                discrepancy_description=desc,
            )
            self.conflicts.append(conflict_rec)
            return conflict_rec

        return None

    def export_conflicts(self, filepath: Optional[Union[str, Path]] = None) -> Path:
        """Export all detected conflicts into a structured JSON file."""
        self.output_dir.mkdir(parents=True, exist_ok=True)
        out_p = Path(filepath) if filepath else self.output_dir / "scientific_conflicts_manifest.json"

        data = {
            "total_conflicts_detected": len(self.conflicts),
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "conflicts": [c.model_dump() for c in self.conflicts],
        }

        with open(out_p, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        return out_p
