"""Spectroscopy Analysis Tool Handler."""

import time
from typing import Any, Dict

from chemistry_llm.tools.schema import ToolResult

try:
    from rdkit import Chem
    from rdkit.Chem import Descriptors
    HAS_RDKIT = True
except ImportError:
    HAS_RDKIT = False


def handle_spectroscopy(operation: str, arguments: Dict[str, Any]) -> ToolResult:
    """Execute verified spectroscopy analysis and predictive feature extraction."""
    start_time = time.time()
    op = operation.lower().strip()

    smiles = arguments.get("smiles", "").strip()
    if not smiles:
        return ToolResult(
            success=False,
            tool="spectroscopy",
            operation=op,
            errors=["Argument 'smiles' is required."],
            execution_time_ms=(time.time() - start_time) * 1000,
        )

    if not HAS_RDKIT:
        return ToolResult(
            success=False,
            tool="spectroscopy",
            operation=op,
            errors=["RDKit is required for spectroscopy analysis."],
            execution_time_ms=(time.time() - start_time) * 1000,
        )

    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        return ToolResult(
            success=False,
            tool="spectroscopy",
            operation=op,
            errors=[f"Invalid SMILES string: '{smiles}'"],
            execution_time_ms=(time.time() - start_time) * 1000,
        )

    mw = round(Descriptors.MolWt(mol), 2)

    # Detect functional groups for spectroscopic interpretation
    has_oh = any(atom.GetSymbol() == "O" and atom.GetTotalNumHs() > 0 for atom in mol.GetAtoms())
    has_carbonyl = any(
        atom.GetSymbol() == "C" and any(b.GetBondTypeAsDouble() == 2.0 and b.GetOtherAtom(atom).GetSymbol() == "O" for b in atom.GetBonds())
        for atom in mol.GetAtoms()
    )
    has_aromatic = any(atom.GetIsAromatic() for atom in mol.GetAtoms())

    if op in ("predict_spectra", "analyze_spectrum", "predict"):
        ir_bands = [{"range": "2850 - 2960 cm⁻¹", "assignment": "sp³ C-H stretching"}]
        if has_oh:
            ir_bands.append({"range": "3200 - 3600 cm⁻¹ (broad)", "assignment": "O-H stretching (H-bonded)"})
        if has_carbonyl:
            ir_bands.append({"range": "1700 - 1730 cm⁻¹ (sharp)", "assignment": "C=O Carbonyl stretching"})
        if has_aromatic:
            ir_bands.append({"range": "3000 - 3100 cm⁻¹", "assignment": "sp² aromatic C-H stretching"})
            ir_bands.append({"range": "1450 - 1600 cm⁻¹", "assignment": "Aromatic C=C ring stretching"})

        nmr_signals = []
        if has_aromatic:
            nmr_signals.append({"shift_ppm": "7.0 - 7.5", "multiplicity": "Multiplet", "assignment": "Aromatic protons"})
        if has_oh:
            nmr_signals.append({"shift_ppm": "2.0 - 5.0", "multiplicity": "Broad Singlet", "assignment": "Hydroxyl O-H proton"})
        nmr_signals.append({"shift_ppm": "0.9 - 1.5", "multiplicity": "Triplet / Multiplet", "assignment": "Aliphatic protons"})

        return ToolResult(
            success=True,
            tool="spectroscopy",
            operation=op,
            result={
                "smiles": smiles,
                "data_nature": "predicted_simulation",
                "molecular_weight": mw,
                "mass_spec": {
                    "molecular_ion_mz": round(mw),
                    "base_peak_mz": round(mw * 0.65),
                },
                "infrared": {
                    "key_absorption_bands": ir_bands,
                },
                "nmr_1H": {
                    "predicted_signals": nmr_signals,
                },
                "uv_vis": {
                    "lambda_max_nm": 254 if has_aromatic else 210,
                },
            },
            warnings=["Results are computational predictions. Actual experimental spectra depend on sample purity, solvent, and temperature."],
            execution_time_ms=(time.time() - start_time) * 1000,
        )

    elif op in ("lookup_ir_bands", "ir_bands"):
        bands = []
        if has_oh:
            bands.append({"band": "O-H stretch", "wavenumber": "3200 - 3600 cm⁻¹ (broad)"})
        if has_carbonyl:
            bands.append({"band": "C=O stretch", "wavenumber": "1700 - 1730 cm⁻¹ (sharp)"})
        if has_aromatic:
            bands.append({"band": "Aromatic C-H stretch", "wavenumber": "3000 - 3100 cm⁻¹"})
        return ToolResult(
            success=True,
            tool="spectroscopy",
            operation=op,
            result={"smiles": smiles, "bands": bands},
            execution_time_ms=(time.time() - start_time) * 1000,
        )

    return ToolResult(
        success=False,
        tool="spectroscopy",
        operation=op,
        errors=[f"Unsupported Spectroscopy operation: '{op}'"],
        execution_time_ms=(time.time() - start_time) * 1000,
    )
