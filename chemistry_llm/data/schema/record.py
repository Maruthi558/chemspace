"""Standard JSONL-based record schema for ChemNova chemistry datasets."""

from datetime import datetime, timezone
import hashlib
import json
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field

from .types import DatasetType, ChemistryDomain, LicenseStatus


def current_iso_time() -> str:
    """Return current UTC timestamp in ISO 8601 format."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


class ChemNovaRecord(BaseModel):
    """Standardized ChemNova Chemistry Data Record.
    
    Supports all standard chemistry dataset fields with optionality
    tailored to various scientific data types.
    """

    # 1. Identification & Classification
    id: str = Field(..., description="Unique alphanumeric identifier for record")
    type: str = Field(default=DatasetType.CHEMISTRY_QA.value, description="Dataset type (one of 30 supported types)")
    domain: str = Field(default=ChemistryDomain.GENERAL_CHEMISTRY.value, description="Primary chemistry domain")
    subdomain: Optional[str] = Field(default=None, description="Granular scientific subdomain")

    # 2. Text & Question/Answer Content
    question: Optional[str] = Field(default=None, description="Primary prompt, query, or topic header")
    answer: Optional[str] = Field(default=None, description="Primary scientific response, target, or definition")
    context: Optional[str] = Field(default=None, description="Background scientific context, passage, or problem statement")
    explanation: Optional[str] = Field(default=None, description="Scientific explanation or justification")
    reasoning: Optional[str] = Field(default=None, description="Step-by-step deductive derivation or mechanism explanation")

    # 3. Chemical Formulas & Reactions
    formula: Optional[str] = Field(default=None, description="Chemical formula (e.g. H2O, C6H12O6)")
    equation: Optional[str] = Field(default=None, description="Stoichiometric or thermodynamic equation")
    reaction: Optional[str] = Field(default=None, description="Reaction summary or SMILES reaction notation")
    reactants: Optional[List[str]] = Field(default=None, description="List of starting chemical species")
    reagents: Optional[List[str]] = Field(default=None, description="Catalysts, solvents, and reaction additives")
    products: Optional[List[str]] = Field(default=None, description="Resulting reaction product species")
    conditions: Optional[Union[Dict[str, Any], str]] = Field(default=None, description="Temperature, pressure, solvent conditions")

    # 4. Molecular & Structure Information
    molecule: Optional[str] = Field(default=None, description="Compound or molecule common/IUPAC name")
    smiles: Optional[str] = Field(default=None, description="Simplified Molecular-Input Line-Entry System string")
    inchi: Optional[str] = Field(default=None, description="IUPAC International Chemical Identifier")
    molecular_formula: Optional[str] = Field(default=None, description="Hill system molecular formula")

    # 5. Provenance & Licensing
    source: str = Field(..., description="Source repository, paper, book, or author")
    source_url: Optional[str] = Field(default=None, description="Direct URL or DOI link to original source")
    license: str = Field(default="OpenAccess", description="License identifier (e.g. CC-BY-4.0, CC0, MIT, PublicDomain)")
    provenance: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Metadata audit trail and ingestion context")

    # 6. Quality & Verification Metadata
    confidence: Optional[float] = Field(default=1.0, ge=0.0, le=1.0, description="Confidence score of accuracy")
    verified: bool = Field(default=False, description="Whether scientifically verified by human or deterministic tool")
    created_at: str = Field(default_factory=current_iso_time, description="ISO timestamp of record creation")
    updated_at: str = Field(default_factory=current_iso_time, description="ISO timestamp of last modification")

    # Raw preservation container
    raw_record: Optional[Dict[str, Any]] = Field(default=None, description="Original un-normalized source record")

    def to_dict(self) -> Dict[str, Any]:
        """Convert record to Python dictionary, omitting None values if desired."""
        return self.model_dump(exclude_none=True)

    def to_full_dict(self) -> Dict[str, Any]:
        """Convert record to full Python dictionary including explicit nulls."""
        return self.model_dump()

    def to_jsonl_line(self) -> str:
        """Serialize record into single-line JSON string without line breaks."""
        return json.dumps(self.to_dict(), ensure_ascii=False)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ChemNovaRecord":
        """Instantiate record from dictionary."""
        return cls(**data)

    @classmethod
    def from_jsonl_line(cls, line: str) -> "ChemNovaRecord":
        """Parse record from single-line JSON string."""
        data = json.loads(line.strip())
        return cls.from_dict(data)

    def get_content_hash(self) -> str:
        """Calculate deterministic SHA-256 fingerprint for deduplication."""
        components = []
        if self.question:
            components.append(self.question.strip().lower())
        if self.answer:
            components.append(self.answer.strip().lower())
        if self.smiles:
            components.append(self.smiles.strip())
        if self.reaction:
            components.append(self.reaction.strip())
        if self.formula:
            components.append(self.formula.strip())
        if not components:
            # Fallback to record ID and context
            components.append(self.id)
            if self.context:
                components.append(self.context.strip().lower())

        joined = "||".join(components)
        return hashlib.sha256(joined.encode("utf-8")).hexdigest()

    def get_license_status(self) -> LicenseStatus:
        """Derive license classification status."""
        lic = (self.license or "").strip().lower()
        if not lic or lic in {"unknown", "none", "unspecified"}:
            return LicenseStatus.UNKNOWN_LICENSE
        if any(term in lic for term in ["cc0", "public domain", "cc-by", "mit", "apache", "openaccess"]):
            return LicenseStatus.VERIFIED
        if any(term in lic for term in ["proprietary", "all rights reserved", "restricted", "nc", "non-commercial"]):
            return LicenseStatus.RESTRICTED
        return LicenseStatus.UNVERIFIED

    def get_training_text(self) -> str:
        """Format record into clean, unified scientific text for training/tokenization.
        
        Connects the dataset infrastructure directly to Step 1 tokenizer and model.
        """
        parts = []

        if self.context:
            parts.append(f"Context:\n{self.context.strip()}")

        if self.question:
            parts.append(f"Question: {self.question.strip()}")

        if self.reasoning:
            parts.append(f"Reasoning:\n{self.reasoning.strip()}")

        if self.reaction:
            parts.append(f"Reaction: {self.reaction.strip()}")

        if self.formula:
            parts.append(f"Formula: {self.formula.strip()}")

        if self.answer:
            parts.append(f"Answer: {self.answer.strip()}")

        if self.explanation and not self.reasoning:
            parts.append(f"Explanation: {self.explanation.strip()}")

        return "\n\n".join(parts)
