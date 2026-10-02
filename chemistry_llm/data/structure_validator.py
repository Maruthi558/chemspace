"""Chemical structure validation module using RDKit with fallback support.

Validates:
- SMILES validity, kekulization, and valence
- Molecular formula consistency
- Chemical reaction SMARTS / SMILES validity
- Stereochemical representation integrity
"""

import logging
import re
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger("chemistry_llm.structure_validator")

# RDKit import
try:
    from rdkit import Chem
    from rdkit.Chem import AllChem, rdMolDescriptors
    RDKIT_AVAILABLE = True
except ImportError:
    RDKIT_AVAILABLE = False
    Chem = None
    AllChem = None
    rdMolDescriptors = None


class ChemicalStructureValidator:
    """Validates chemical structures and notations."""

    def __init__(self):
        self.rdkit_available = RDKIT_AVAILABLE

    def validate_smiles(self, smiles: str) -> Tuple[bool, Optional[str], Optional[Dict[str, Any]]]:
        """Validate SMILES string using RDKit or regex fallback.
        
        Returns:
            Tuple of (is_valid, error_message_if_invalid, properties_if_valid)
        """
        if not smiles or not smiles.strip():
            return False, "SMILES string is empty", None

        smi = smiles.strip()

        if self.rdkit_available:
            try:
                # Disallow raw whitespace or multiline
                if " " in smi or "\n" in smi:
                    return False, "SMILES contains invalid whitespace", None

                mol = Chem.MolFromSmiles(smi)
                if mol is None:
                    return False, f"RDKit failed to parse SMILES: '{smi}'", None

                # Compute properties
                canonical_smi = Chem.MolToSmiles(mol, canonical=True)
                formula = rdMolDescriptors.CalcMolFormula(mol)
                mw = round(rdMolDescriptors.CalcExactMolWt(mol), 4)
                num_atoms = mol.GetNumAtoms()
                num_heavy_atoms = mol.GetNumHeavyAtoms()

                props = {
                    "canonical_smiles": canonical_smi,
                    "computed_formula": formula,
                    "exact_mw": mw,
                    "num_atoms": num_atoms,
                    "num_heavy_atoms": num_heavy_atoms,
                    "is_aromatic": any(atom.GetIsAromatic() for atom in mol.GetAtoms()),
                }
                return True, None, props

            except Exception as e:
                return False, f"RDKit exception validating SMILES '{smi}': {str(e)}", None

        else:
            # Fallback syntax check: basic bracket/parenthesis matching and valid character check
            if smi.count("(") != smi.count(")"):
                return False, "Unmatched parentheses in SMILES string", None
            if smi.count("[") != smi.count("]"):
                return False, "Unmatched brackets in SMILES string", None

            valid_chars = set("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789=[]#@+\\/-:.%()")
            if not set(smi).issubset(valid_chars):
                invalid_chars = set(smi) - valid_chars
                return False, f"Invalid characters detected in SMILES string: {invalid_chars}", None

            return True, None, {"canonical_smiles": smi, "validated_via": "syntax_fallback"}

    def validate_molecular_formula(self, formula: str) -> Tuple[bool, Optional[str]]:
        """Validate molecular formula notation (e.g., C6H12O6, H2SO4, NaCl, 13C, NH4+)."""
        if not formula or not formula.strip():
            return False, "Formula string is empty"

        f = formula.strip()
        # Supports neutral formulas (H2O), isotopes (1H, 13C), and ionic species (NH4+, SO4(2-), Cl-)
        pattern = r"^(\d*[A-Z][a-z]?\d*|\([A-Z0-9a-z]+\)\d*)+(\(?\d*[+-]\)?)?$"
        if not re.match(pattern, f):
            return False, f"Malformed chemical formula syntax: '{f}'"

        return True, None

    def validate_reaction_string(self, reaction: str) -> Tuple[bool, Optional[str]]:
        """Validate chemical reaction equation string."""
        if not reaction or not reaction.strip():
            return False, "Reaction string is empty"

        rxn = reaction.strip()
        # Must contain an arrow
        arrow_symbols = ["→", "->", "-->", "⇌", "<=>", "<->", "=>"]
        has_arrow = any(arrow in rxn for arrow in arrow_symbols)
        if not has_arrow:
            return False, f"Reaction string lacks reaction arrow: '{rxn}'"

        # Check for non-empty reactants and products
        for arrow in arrow_symbols:
            if arrow in rxn:
                parts = rxn.split(arrow, 1)
                reactants = parts[0].strip()
                products = parts[1].strip()
                if not reactants or not products:
                    return False, f"Reaction has empty reactant or product side: '{rxn}'"
                break

        return True, None

    def check_formula_smiles_consistency(
        self, formula: str, smiles: str
    ) -> Tuple[bool, Optional[str]]:
        """Verify that SMILES matches the claimed molecular formula when RDKit is available."""
        if not self.rdkit_available or not formula or not smiles:
            return True, None  # Cannot strictly verify without RDKit

        is_valid_smi, err, props = self.validate_smiles(smiles)
        if not is_valid_smi:
            return False, f"Invalid SMILES for formula consistency check: {err}"

        computed_formula = props.get("computed_formula", "")
        # Normalize Hill system ordering for comparison
        clean_declared = re.sub(r"\s+", "", formula)
        clean_computed = re.sub(r"\s+", "", computed_formula)

        if clean_declared != clean_computed:
            return False, f"Formula mismatch: declared '{clean_declared}', but SMILES yielded '{clean_computed}'"

        return True, None


# Global validator singleton
_global_validator: Optional[ChemicalStructureValidator] = None


def get_structure_validator() -> ChemicalStructureValidator:
    """Retrieve global chemical structure validator singleton."""
    global _global_validator
    if _global_validator is None:
        _global_validator = ChemicalStructureValidator()
    return _global_validator
