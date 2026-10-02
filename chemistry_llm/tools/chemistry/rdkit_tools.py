"""RDKit Physicochemical Descriptor Tool.

STEP 1 NOTICE:
Provides a clean interface for deterministic molecular calculations.
Invoked intentionally by the reasoning / tool router layer, not automatically executed.
"""

from typing import Any, Dict, Optional

try:
    from rdkit import Chem
    from rdkit.Chem import Descriptors, Lipinski
    RDKIT_AVAILABLE = True
except Exception:
    RDKIT_AVAILABLE = False


def calculate_rdkit_descriptors(smiles: str) -> Dict[str, Any]:
    """Calculate standard physicochemical descriptors for a valid SMILES string.

    Returns:
        Dictionary with formula, mw, logp, tpsa, hbd, hba, and Lipinski compliance.
    """
    clean_smiles = (smiles or "").strip()
    if not clean_smiles:
        return {"success": False, "error": "Empty SMILES input"}

    if not RDKIT_AVAILABLE:
        return {
            "success": False,
            "error": "RDKit is not installed in the current environment",
            "smiles": clean_smiles,
        }

    try:
        mol = Chem.MolFromSmiles(clean_smiles)
        if mol is None:
            return {
                "success": False,
                "error": f"Invalid SMILES syntax: '{clean_smiles}' could not be parsed.",
                "smiles": clean_smiles,
            }

        mw = float(Descriptors.MolWt(mol))
        logp = float(Descriptors.MolLogP(mol))
        tpsa = float(Descriptors.TPSA(mol))
        hbd = int(Lipinski.NumHDonors(mol))
        hba = int(Lipinski.NumHAcceptors(mol))
        rot_bonds = int(Lipinski.NumRotatableBonds(mol))
        formula = Chem.CalcMolFormula(mol)
        lipinski_pass = bool(mw <= 500 and logp <= 5.0 and hbd <= 5 and hba <= 10)

        return {
            "success": True,
            "smiles": clean_smiles,
            "canonical_smiles": Chem.MolToSmiles(mol, canonical=True),
            "formula": formula,
            "molecular_weight": round(mw, 3),
            "logp": round(logp, 2),
            "tpsa": round(tpsa, 2),
            "hbd": hbd,
            "hba": hba,
            "rotatable_bonds": rot_bonds,
            "lipinski_rule_of_5": lipinski_pass,
            "heavy_atom_count": mol.GetNumHeavyAtoms(),
        }
    except Exception as e:
        return {"success": False, "error": str(e), "smiles": clean_smiles}
