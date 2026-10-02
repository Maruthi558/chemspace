"""Instruction Dataset Schema & Validation for ChemNova-LLM Step 6.

Standardizes instruction, reasoning, question-answer, and multi-turn chemistry data.
Preserves scientific provenance, domain taxonomy, difficulty, chemical entities,
and verification flags.
"""

from dataclasses import asdict, dataclass, field
import hashlib
import json
import re
from typing import Any, Dict, List, Optional, Tuple

try:
    from rdkit import Chem
    HAS_RDKIT = True
except ImportError:
    HAS_RDKIT = False


VALID_DOMAINS = {
    "fundamentals",
    "general_chemistry",
    "organic_chemistry",
    "inorganic_chemistry",
    "physical_chemistry",
    "analytical_chemistry",
    "biochemistry",
    "medicinal_chemistry",
    "materials_chemistry",
    "environmental_chemistry",
    "industrial_chemistry",
    "nuclear_chemistry",
    "photochemistry",
    "computational_chemistry",
    "laboratory_safety",
    "spectroscopy",
    "molecules",
    "reactions",
    "calculations",
    "conversation",
    "identity",
}

VALID_DIFFICULTIES = {"introductory", "undergraduate", "graduate", "advanced", "research"}
VALID_REASONING_TYPES = {
    "direct_recall",
    "step_by_step_numerical",
    "mechanistic",
    "comparative",
    "deductive",
    "hypothetical",
    "clarification",
    "uncertainty_assessment",
    "safety_assessment",
    "conversational",
    "error_correction",
}


@dataclass
class ChemistryInstructionExample:
    """Standardized representation of a Chemistry Instruction Example."""

    id: str
    instruction: str
    output: str
    input: str = ""
    domain: str = "general_chemistry"
    subdomain: str = ""
    difficulty: str = "undergraduate"
    reasoning_type: str = "direct_recall"
    answer_type: str = "explanation"  # explanation, numerical, smiles, formula, reaction, clarification, redirection
    chemical_entities: List[str] = field(default_factory=list)
    formula: str = ""
    smiles: str = ""
    reaction: str = ""
    source: str = "chemnova_curated"
    source_url: str = ""
    license: str = "MIT"
    provenance: str = "internal_chemistry_corpus"
    verified: bool = True
    confidence: str = "high"  # high, medium, hypothesis, uncertain
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert dataclass to clean dictionary."""
        d = asdict(self)
        return {k: v for k, v in d.items() if v is not None}

    def compute_hash(self) -> str:
        """Compute unique deterministic SHA-256 hash of the instruction and output."""
        canonical = f"{self.instruction.strip().lower()}||{self.input.strip().lower()}||{self.output.strip().lower()}"
        return hashlib.sha256(canonical.encode("utf-8")).hexdigest()

    def validate(self) -> Tuple[bool, List[str]]:
        """Validate chemistry instruction example against quality rules."""
        errors: List[str] = []

        if not self.id or not isinstance(self.id, str):
            errors.append("Missing or invalid 'id'")

        if not self.instruction or not self.instruction.strip():
            errors.append("Empty 'instruction'")

        if not self.output or not self.output.strip():
            errors.append("Empty 'output'")

        if len(self.instruction.strip()) < 5:
            errors.append(f"Instruction too short ({len(self.instruction.strip())} chars)")

        if len(self.output.strip()) < 5:
            errors.append(f"Output too short ({len(self.output.strip())} chars)")

        if self.domain not in VALID_DOMAINS:
            errors.append(f"Invalid domain: '{self.domain}'")

        if self.difficulty not in VALID_DIFFICULTIES:
            errors.append(f"Invalid difficulty: '{self.difficulty}'")

        # Validate SMILES with RDKit if present
        if self.smiles and HAS_RDKIT:
            mol = Chem.MolFromSmiles(self.smiles)
            if mol is None:
                errors.append(f"Invalid SMILES string: '{self.smiles}'")

        # Validate chemical formula characters
        if self.formula:
            if not re.match(r"^[A-Za-z0-9\(\)\[\]\.\+\-\,\s]+$", self.formula):
                errors.append(f"Suspicious characters in formula: '{self.formula}'")

        # Balanced brackets/parentheses in output
        for open_char, close_char in [("(", ")"), ("[", "]"), ("{", "}")]:
            if self.output.count(open_char) != self.output.count(close_char):
                # Mild warning only if extreme mismatch
                diff = abs(self.output.count(open_char) - self.output.count(close_char))
                if diff > 2:
                    errors.append(f"Unbalanced '{open_char}{close_char}' in output (diff={diff})")

        return len(errors) == 0, errors


def example_from_dict(d: Dict[str, Any]) -> ChemistryInstructionExample:
    """Instantiate a ChemistryInstructionExample from dictionary."""
    valid_fields = ChemistryInstructionExample.__dataclass_fields__.keys()
    filtered = {k: v for k, v in d.items() if k in valid_fields}
    return ChemistryInstructionExample(**filtered)
