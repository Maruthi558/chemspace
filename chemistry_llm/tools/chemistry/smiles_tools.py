"""SMILES Validation and Canonicalization Tool.

Provides deterministic validation without hallucination.
"""

from typing import Optional

try:
    from rdkit import Chem
    RDKIT_AVAILABLE = True
except Exception:
    RDKIT_AVAILABLE = False


def validate_smiles(smiles: str) -> bool:
    """Check if a SMILES string represents a chemically valid structure."""
    if not smiles or not isinstance(smiles, str):
        return False
    clean = smiles.strip()
    if not clean:
        return False

    if RDKIT_AVAILABLE:
        try:
            mol = Chem.MolFromSmiles(clean)
            return mol is not None
        except Exception:
            return False

    # Basic syntax balance heuristic if RDKit is absent
    open_paren = 0
    open_bracket = 0
    for char in clean:
        if char == "(":
            open_paren += 1
        elif char == ")":
            open_paren -= 1
        elif char == "[":
            open_bracket += 1
        elif char == "]":
            open_bracket -= 1
        if open_paren < 0 or open_bracket < 0:
            return False
    return open_paren == 0 and open_bracket == 0


def canonicalize_smiles(smiles: str) -> Optional[str]:
    """Convert an arbitrary valid SMILES into canonical SMILES representation."""
    if not smiles or not isinstance(smiles, str):
        return None
    clean = smiles.strip()

    if RDKIT_AVAILABLE:
        try:
            mol = Chem.MolFromSmiles(clean)
            if mol is not None:
                return Chem.MolToSmiles(mol, canonical=True)
        except Exception:
            return None
    return clean if validate_smiles(clean) else None
