"""Deterministic chemistry calculations and laboratory tool integrations."""

import re
from typing import Dict, Optional, Tuple

# Atomic weights table (standard IUPAC values in g/mol)
ATOMIC_WEIGHTS: Dict[str, float] = {
    "H": 1.008, "He": 4.0026, "Li": 6.94, "Be": 9.0122, "B": 10.81,
    "C": 12.011, "N": 14.007, "O": 15.999, "F": 18.998, "Ne": 20.180,
    "Na": 22.990, "Mg": 24.305, "Al": 26.982, "Si": 28.085, "P": 30.974,
    "S": 32.06, "Cl": 35.45, "Ar": 39.948, "K": 39.098, "Ca": 40.078,
    "Sc": 44.956, "Ti": 47.867, "V": 50.942, "Cr": 51.996, "Mn": 54.938,
    "Fe": 55.845, "Co": 58.933, "Ni": 58.693, "Cu": 63.546, "Zn": 65.38,
    "Ga": 69.723, "Ge": 72.630, "As": 74.922, "Se": 78.971, "Br": 79.904,
    "Kr": 83.798, "Rb": 85.468, "Sr": 87.62, "Ag": 107.868, "I": 126.904,
    "Ba": 137.327, "Pt": 195.084, "Au": 196.967, "Hg": 200.592, "Pb": 207.2,
    "U": 238.029,
}

# Common named molecules lookup
KNOWN_MOLECULES: Dict[str, Dict] = {
    "water": {"formula": "H2O", "smiles": "O", "mw": 18.015, "name": "Water"},
    "glucose": {"formula": "C6H12O6", "smiles": "OC[C@H]1OC(O)[C@H](O)[C@@H](O)[C@@H]1O", "mw": 180.156, "name": "D-Glucose"},
    "aspirin": {"formula": "C9H8O4", "smiles": "CC(=O)Oc1ccccc1C(=O)O", "mw": 180.158, "name": "Acetylsalicylic acid (Aspirin)"},
    "benzene": {"formula": "C6H6", "smiles": "c1ccccc1", "mw": 78.114, "name": "Benzene"},
    "ethanol": {"formula": "C2H6O", "smiles": "CCO", "mw": 46.069, "name": "Ethanol"},
    "methane": {"formula": "CH4", "smiles": "C", "mw": 16.043, "name": "Methane"},
    "carbon dioxide": {"formula": "CO2", "smiles": "O=C=O", "mw": 44.009, "name": "Carbon Dioxide"},
    "sodium chloride": {"formula": "NaCl", "smiles": "[Na+].[Cl-]", "mw": 58.44, "name": "Sodium Chloride"},
    "hydrochloric acid": {"formula": "HCl", "smiles": "Cl", "mw": 36.46, "name": "Hydrochloric Acid"},
    "ammonia": {"formula": "NH3", "smiles": "N", "mw": 17.031, "name": "Ammonia"},
    "sulfuric acid": {"formula": "H2SO4", "smiles": "OS(=O)(=O)O", "mw": 98.079, "name": "Sulfuric Acid"},
    "caffeine": {"formula": "C8H10N4O2", "smiles": "Cn1cnc2c1c(=O)n(c(=O)n2C)C", "mw": 194.19, "name": "Caffeine"},
}


class ChemistryTools:
    """Local deterministic calculation and laboratory tool assistants."""

    @staticmethod
    def parse_formula_weight(formula: str) -> Optional[float]:
        """Compute molecular weight from a chemical formula string."""
        pattern = r"([A-Z][a-z]*)(\d*)"
        matches = re.findall(pattern, formula)
        if not matches:
            return None

        total_weight = 0.0
        reconstructed = ""
        for elem, count_str in matches:
            if elem not in ATOMIC_WEIGHTS:
                return None
            count = int(count_str) if count_str else 1
            total_weight += ATOMIC_WEIGHTS[elem] * count
            reconstructed += f"{elem}{count if count > 1 else ''}"

        return round(total_weight, 3)

    @classmethod
    def calculate_molecular_weight(cls, query: str) -> Optional[str]:
        """Parse query and calculate molecular weight/molar mass."""
        q = query.lower()

        # Check known common molecules
        for name, data in KNOWN_MOLECULES.items():
            if name in q or data["formula"].lower() in q.split():
                return (
                    f"The molecular weight (molar mass) of {data['name']} ({data['formula']}) "
                    f"is approximately **{data['mw']} g/mol**.\n\n"
                    f"- **Molecular Formula**: {data['formula']}\n"
                    f"- **Molar Mass**: {data['mw']} g/mol"
                )

        # Check raw formula in query
        words = re.findall(r"\b[A-Z][a-z0-9]*\b", query)
        for w in words:
            mw = cls.parse_formula_weight(w)
            if mw is not None:
                return (
                    f"The calculated molecular weight of **{w}** is **{mw} g/mol**."
                )

        return None

    @classmethod
    def get_formula_response(cls, query: str) -> Optional[str]:
        """Return the chemical/molecular formula of a requested compound."""
        q = query.lower()
        for name, data in KNOWN_MOLECULES.items():
            if name in q:
                return (
                    f"The molecular formula of **{data['name']}** is **{data['formula']}**.\n\n"
                    f"- **Molecular Weight**: {data['mw']} g/mol\n"
                    f"- **SMILES**: `{data['smiles']}`"
                )
        return None

    @classmethod
    def handle_tool_request(cls, query: str) -> Optional[str]:
        """Provide guidance for ChemNova interactive laboratory tools."""
        q = query.lower()

        # Check if user wants to draw a molecule
        for name, data in KNOWN_MOLECULES.items():
            if name in q or data["formula"].lower() in q.split():
                return (
                    f"To visualize or edit **{data['name']}** ({data['formula']}), you can use ChemNova's integrated **ChemDraw** tool.\n\n"
                    f"- **Structure SMILES**: `{data['smiles']}`\n"
                    f"- **Molecular Weight**: {data['mw']} g/mol\n\n"
                    f"You can open the **ChemDraw** tab from the top navigation to sketch, render 2D/3D structures, and perform RDKit analysis."
                )

        if "draw" in q or "sketch" in q:
            return (
                "You can sketch chemical structures using ChemNova's integrated **ChemDraw** tool. "
                "Click on **ChemDraw** in the navigation bar to start drawing, import SMILES, or export molecular files."
            )

        if "spectroscopy" in q or "spectrum" in q or "nmr" in q or "ir" in q:
            return (
                "ChemNova includes a full **Spectroscopy Lab** supporting NMR, IR, UV-Vis, and Mass Spectrometry visualization. "
                "Navigate to the **Spectroscopy** section to view and analyze spectra."
            )

        if "reaction" in q or "predict" in q or "ibm" in q:
            return (
                "ChemNova features an **IBM RXN & Reaction Prediction** laboratory for retrosynthesis and forward reaction planning. "
                "Open the Reaction tool from the navigation menu to test chemical transformations."
            )

        return None
