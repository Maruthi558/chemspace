"""ChemDraw 2D/3D Molecular Canvas Tool Handler."""

import time
from typing import Any, Dict

from chemistry_llm.tools.schema import ToolResult

try:
    from rdkit import Chem
    from rdkit.Chem import rdDepictor
    HAS_RDKIT = True
except Exception:
    HAS_RDKIT = False

try:
    from rdkit.Chem import AllChem
    HAS_ALLCHEM = True
except Exception:
    HAS_ALLCHEM = False


def handle_chemdraw(operation: str, arguments: Dict[str, Any]) -> ToolResult:
    """Execute verified ChemDraw molecular sketching & conformation operations."""
    start_time = time.time()
    op = operation.lower().strip()

    smiles = arguments.get("smiles", "").strip()
    if not smiles:
        return ToolResult(
            success=False,
            tool="chemdraw",
            operation=op,
            errors=["Argument 'smiles' is required."],
            execution_time_ms=(time.time() - start_time) * 1000,
        )

    if not HAS_RDKIT:
        return ToolResult(
            success=False,
            tool="chemdraw",
            operation=op,
            errors=["RDKit is required for ChemDraw backend processing."],
            execution_time_ms=(time.time() - start_time) * 1000,
        )

    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        return ToolResult(
            success=False,
            tool="chemdraw",
            operation=op,
            errors=[f"Cannot parse SMILES '{smiles}' for ChemDraw visualization."],
            execution_time_ms=(time.time() - start_time) * 1000,
        )

    if op in ("parse_molecule", "sketch_molecule", "draw"):
        # Generate 2D coordinates for ChemDraw canvas using robust rdDepictor
        rdDepictor.Compute2DCoords(mol)
        conf = mol.GetConformer()

        atoms = [
            {"id": i + 1, "element": a.GetSymbol(), "x": round(conf.GetAtomPosition(i).x, 3), "y": round(conf.GetAtomPosition(i).y, 3)}
            for i, a in enumerate(mol.GetAtoms())
        ]
        bonds = [
            {"from": b.GetBeginAtomIdx() + 1, "to": b.GetEndAtomIdx() + 1, "order": int(b.GetBondTypeAsDouble())}
            for b in mol.GetBonds()
        ]
        return ToolResult(
            success=True,
            tool="chemdraw",
            operation=op,
            result={
                "smiles": Chem.MolToSmiles(mol, canonical=True),
                "canvas_status": "ready_to_render",
                "atom_count": len(atoms),
                "bond_count": len(bonds),
                "atoms": atoms,
                "bonds": bonds,
            },
            execution_time_ms=(time.time() - start_time) * 1000,
        )

    elif op in ("generate_3d_conformer", "3d"):
        mol_h = Chem.AddHs(mol)
        has_3d = False
        if HAS_ALLCHEM:
            try:
                success = AllChem.EmbedMolecule(mol_h, randomSeed=42)
                if success == 0:
                    AllChem.MMFFOptimizeMolecule(mol_h)
                    has_3d = True
            except Exception:
                has_3d = False

        if not has_3d:
            rdDepictor.Compute2DCoords(mol_h)

        conf_3d = mol_h.GetConformer()
        atoms_3d = [
            {
                "id": i + 1,
                "element": a.GetSymbol(),
                "x": round(conf_3d.GetAtomPosition(i).x, 3),
                "y": round(conf_3d.GetAtomPosition(i).y, 3),
                "z": round(conf_3d.GetAtomPosition(i).z if has_3d else 0.0, 3),
            }
            for i, a in enumerate(mol_h.GetAtoms())
        ]
        return ToolResult(
            success=True,
            tool="chemdraw",
            operation=op,
            result={
                "smiles": smiles,
                "conformer_type": "3D_MMFF94_optimized" if has_3d else "2D_planar_conformer",
                "atom_count": len(atoms_3d),
                "coordinates": atoms_3d,
            },
            execution_time_ms=(time.time() - start_time) * 1000,
        )

    return ToolResult(
        success=False,
        tool="chemdraw",
        operation=op,
        errors=[f"Unsupported ChemDraw operation: '{op}'"],
        execution_time_ms=(time.time() - start_time) * 1000,
    )
