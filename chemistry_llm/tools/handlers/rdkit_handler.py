"""RDKit Chemistry Laboratory Tool Handler."""

import time
from typing import Any, Dict

from chemistry_llm.tools.schema import ToolResult

RDKIT_IMPORT_ERROR = None
try:
    from rdkit import Chem
    from rdkit.Chem import Descriptors, rdMolDescriptors, Lipinski
    HAS_RDKIT = True
except Exception as e:
    HAS_RDKIT = False
    RDKIT_IMPORT_ERROR = str(e)



def handle_rdkit(operation: str, arguments: Dict[str, Any]) -> ToolResult:
    """Execute verified RDKit cheminformatics operations."""
    start_time = time.time()
    op = operation.lower().strip()

    if not HAS_RDKIT:
        return ToolResult(
            success=False,
            tool="rdkit",
            operation=op,
            errors=[f"RDKit C++ kernel is not installed or failed to load: {RDKIT_IMPORT_ERROR}"],
            execution_time_ms=(time.time() - start_time) * 1000,
        )

    smiles = arguments.get("smiles", "").strip()

    if op in ("validate_smiles", "check_smiles"):
        if not smiles:
            return ToolResult(
                success=False,
                tool="rdkit",
                operation=op,
                errors=["Argument 'smiles' is required and cannot be empty."],
                execution_time_ms=(time.time() - start_time) * 1000,
            )
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return ToolResult(
                success=False,
                tool="rdkit",
                operation=op,
                result={"is_valid": False, "smiles": smiles},
                errors=[f"Invalid SMILES string: '{smiles}'. Unable to parse chemical structure."],
                execution_time_ms=(time.time() - start_time) * 1000,
            )
        canon = Chem.MolToSmiles(mol, canonical=True)
        return ToolResult(
            success=True,
            tool="rdkit",
            operation=op,
            result={
                "is_valid": True,
                "input_smiles": smiles,
                "canonical_smiles": canon,
                "num_atoms": mol.GetNumAtoms(),
                "num_heavy_atoms": mol.GetNumHeavyAtoms(),
                "num_bonds": mol.GetNumBonds(),
            },
            execution_time_ms=(time.time() - start_time) * 1000,
        )

    elif op in ("calculate_molecular_properties", "properties", "descriptors"):
        if not smiles:
            return ToolResult(
                success=False,
                tool="rdkit",
                operation=op,
                errors=["Argument 'smiles' is required."],
                execution_time_ms=(time.time() - start_time) * 1000,
            )
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return ToolResult(
                success=False,
                tool="rdkit",
                operation=op,
                errors=[f"Invalid SMILES string: '{smiles}'"],
                execution_time_ms=(time.time() - start_time) * 1000,
            )

        mol_h = Chem.AddHs(mol)
        mw = round(Descriptors.MolWt(mol), 4)
        exact_mw = round(Descriptors.ExactMolWt(mol), 4)
        formula = rdMolDescriptors.CalcMolFormula(mol)
        logp = round(Descriptors.MolLogP(mol), 2)
        tpsa = round(Descriptors.TPSA(mol), 2)
        hbd = rdMolDescriptors.CalcNumHBD(mol)
        hba = rdMolDescriptors.CalcNumHBA(mol)
        rotatable = Descriptors.NumRotatableBonds(mol)
        rings = rdMolDescriptors.CalcNumRings(mol)
        aromatic_rings = rdMolDescriptors.CalcNumAromaticRings(mol)
        lipinski_pass = mw <= 500 and logp <= 5.0 and hbd <= 5 and hba <= 10

        return ToolResult(
            success=True,
            tool="rdkit",
            operation=op,
            result={
                "smiles": Chem.MolToSmiles(mol, canonical=True),
                "formula": formula,
                "molecular_weight": mw,
                "exact_molecular_weight": exact_mw,
                "logP": logp,
                "tpsa": tpsa,
                "hbd": hbd,
                "hba": hba,
                "rotatable_bonds": rotatable,
                "total_rings": rings,
                "aromatic_rings": aromatic_rings,
                "lipinski_rule_of_five_compliant": lipinski_pass,
            },
            execution_time_ms=(time.time() - start_time) * 1000,
        )

    elif op in ("canonicalize_smiles", "canonicalize"):
        if not smiles:
            return ToolResult(
                success=False,
                tool="rdkit",
                operation=op,
                errors=["Missing 'smiles' argument."],
                execution_time_ms=(time.time() - start_time) * 1000,
            )
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return ToolResult(
                success=False,
                tool="rdkit",
                operation=op,
                errors=[f"Invalid SMILES string: '{smiles}'"],
                execution_time_ms=(time.time() - start_time) * 1000,
            )
        return ToolResult(
            success=True,
            tool="rdkit",
            operation=op,
            result={"canonical_smiles": Chem.MolToSmiles(mol, canonical=True)},
            execution_time_ms=(time.time() - start_time) * 1000,
        )

    return ToolResult(
        success=False,
        tool="rdkit",
        operation=op,
        errors=[f"Unsupported RDKit operation: '{op}'"],
        execution_time_ms=(time.time() - start_time) * 1000,
    )
