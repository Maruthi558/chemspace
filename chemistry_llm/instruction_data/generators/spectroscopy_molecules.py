"""Spectroscopy & Molecular Representation Instruction Generator for Step 6."""

from typing import List
from chemistry_llm.instruction_data.schema import ChemistryInstructionExample


def generate_spectroscopy_molecule_instructions() -> List[ChemistryInstructionExample]:
    """Generate instruction examples covering IR, NMR, MS, and SMILES notation."""
    examples = [
        ChemistryInstructionExample(
            id="spec_001",
            instruction="What diagnostic absorption bands in an infrared (IR) spectrum indicate an aliphatic carboxylic acid?",
            output=(
                "An aliphatic carboxylic acid (R-COOH) is characterized by two prominent diagnostic IR bands:\n\n"
                "1. O-H Stretching Band:\n"
                "- Wavenumber: Extremely broad, intense absorption spanning 2500 - 3300 cm⁻¹ (often centered around 3000 cm⁻¹), "
                "typically overlapping and obscuring the sp³ C-H stretching vibrations (~2850 - 2960 cm⁻¹).\n"
                "- Origin: Strong intermolecular hydrogen bonding in carboxylic acid dimers.\n\n"
                "2. Carbonyl C=O Stretching Band:\n"
                "- Wavenumber: Sharp, strong absorption at 1705 - 1725 cm⁻¹ (unconjugated) or 1680 - 1700 cm⁻¹ (conjugated).\n\n"
                "3. Additional Corroborating Bands:\n"
                "- C-O single bond stretch at ~1210 - 1320 cm⁻¹.\n"
                "- O-H out-of-plane bending broad band near 910 - 950 cm⁻¹."
            ),
            domain="spectroscopy",
            subdomain="infrared_spectroscopy",
            difficulty="undergraduate",
            reasoning_type="deductive",
            answer_type="explanation",
            chemical_entities=["carboxylic_acid"],
            verified=True,
            confidence="high",
        ),
        ChemistryInstructionExample(
            id="spec_002",
            instruction="Predict the 1H NMR spectrum of pure ethanol (CH3CH2OH), including chemical shifts, integration, and multiplicity.",
            output=(
                "The 1H NMR spectrum of pure ethanol (CH3-CH2-OH) exhibits three distinct proton environments:\n\n"
                "1. Methyl Protons (-CH3):\n"
                "- Chemical Shift: δ ~1.2 ppm\n"
                "- Integration: 3H\n"
                "- Multiplicity: Triplet (split by the 2 adjacent methylene protons, N+1 = 2+1 = 3, J ~7 Hz)\n\n"
                "2. Methylene Protons (-CH2-):\n"
                "- Chemical Shift: δ ~3.7 ppm (deshielded by electronegative oxygen)\n"
                "- Integration: 2H\n"
                "- Multiplicity: Quartet (split by the 3 adjacent methyl protons, N+1 = 3+1 = 4, J ~7 Hz) in standard solvents where OH exchange is rapid\n\n"
                "3. Hydroxyl Proton (-OH):\n"
                "- Chemical Shift: δ ~2.0 - 5.0 ppm (broad singlet, variable with concentration, solvent, and temperature due to chemical exchange)\n"
                "- Integration: 1H"
            ),
            domain="spectroscopy",
            subdomain="nmr_spectroscopy",
            difficulty="undergraduate",
            reasoning_type="deductive",
            answer_type="explanation",
            chemical_entities=["ethanol"],
            formula="C2H6O",
            smiles="CCO",
            verified=True,
            confidence="high",
        ),
        ChemistryInstructionExample(
            id="spec_003",
            instruction="What is the canonical SMILES representation for ethanol, acetone, and benzene?",
            output=(
                "The canonical SMILES representations for these common molecules are:\n\n"
                "1. Ethanol: `CCO` (or `OCC`)\n"
                "- Formula: C2H6O\n"
                "- Structure: Ethyl alcohol with a primary hydroxyl group.\n\n"
                "2. Acetone: `CC(=O)C`\n"
                "- Formula: C3H6O\n"
                "- Structure: Propan-2-one with a central carbonyl group.\n\n"
                "3. Benzene: `c1ccccc1` (or `C1=CC=CC=C1`)\n"
                "- Formula: C6H6\n"
                "- Structure: Aromatic 6-membered planar carbocyclic ring denoted by lowercase aromatic symbols."
            ),
            domain="molecules",
            subdomain="smiles_representation",
            difficulty="introductory",
            reasoning_type="direct_recall",
            answer_type="smiles",
            chemical_entities=["ethanol", "acetone", "benzene"],
            formula="C2H6O, C3H6O, C6H6",
            smiles="CCO",
            verified=True,
            confidence="high",
        ),
        ChemistryInstructionExample(
            id="spec_004",
            instruction="What is the SMILES representation and molecular formula of aspirin (acetylsalicylic acid)?",
            output=(
                "Aspirin (acetylsalicylic acid):\n\n"
                "- Molecular Formula: C9H8O4\n"
                "- Canonical SMILES: `CC(=O)Oc1ccccc1C(=O)O`\n"
                "- Key Structural Features: A benzene ring substituted with an ortho-carboxylic acid group (-COOH) "
                "and an acetoxy group (-OCOCH3), prepared by esterification of salicylic acid with acetic anhydride."
            ),
            domain="molecules",
            subdomain="smiles_representation",
            difficulty="undergraduate",
            reasoning_type="direct_recall",
            answer_type="smiles",
            chemical_entities=["aspirin", "acetylsalicylic_acid"],
            formula="C9H8O4",
            smiles="CC(=O)Oc1ccccc1C(=O)O",
            verified=True,
            confidence="high",
        ),
    ]
    return examples
