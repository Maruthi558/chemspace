"""Numerical Chemistry & Stoichiometric Calculations Instruction Generator for Step 6."""

from typing import List
from chemistry_llm.instruction_data.schema import ChemistryInstructionExample


def generate_calculation_instructions() -> List[ChemistryInstructionExample]:
    """Generate high-quality worked numerical chemistry calculation examples."""
    examples = [
        ChemistryInstructionExample(
            id="calc_001",
            instruction="How many moles of water (H2O) are present in 18.015 g of pure water?",
            output=(
                "<SOLUTION_STEPS>\n"
                "Step 1: Identify given information and target quantity:\n"
                "- Mass of sample, m = 18.015 g\n"
                "- Substance: Water (H2O)\n"
                "- Target: Amount of substance, n (in moles)\n\n"
                "Step 2: Determine the molar mass (M) of H2O:\n"
                "- M(H) = 1.008 g/mol * 2 = 2.016 g/mol\n"
                "- M(O) = 15.999 g/mol * 1 = 15.999 g/mol\n"
                "- M(H2O) = 2.016 + 15.999 = 18.015 g/mol\n\n"
                "Step 3: Select appropriate equation relating mass, molar mass, and moles:\n"
                "n = m / M\n\n"
                "Step 4: Substitute known values and calculate:\n"
                "n = 18.015 g / 18.015 g/mol = 1.000 mol\n\n"
                "Step 5: Check units:\n"
                "g / (g/mol) = mol (consistent)\n"
                "</SOLUTION_STEPS>\n"
                "<FINAL_ANSWER>\n"
                "There is exactly 1.000 mole of water present in 18.015 g of H2O.\n"
                "</FINAL_ANSWER>"
            ),
            domain="calculations",
            subdomain="moles_and_molar_mass",
            difficulty="introductory",
            reasoning_type="step_by_step_numerical",
            answer_type="numerical",
            chemical_entities=["H2O"],
            formula="H2O",
            smiles="O",
            verified=True,
            confidence="high",
        ),
        ChemistryInstructionExample(
            id="calc_002",
            instruction="What volume of 12.0 M concentrated hydrochloric acid (HCl) is required to prepare 500.0 mL of a 0.500 M HCl solution?",
            output=(
                "<SOLUTION_STEPS>\n"
                "Step 1: Identify known values and target:\n"
                "- Initial concentration, M1 = 12.0 M (mol/L)\n"
                "- Target concentration, M2 = 0.500 M (mol/L)\n"
                "- Target volume, V2 = 500.0 mL = 0.500 L\n"
                "- Unknown: Initial concentrated volume required, V1\n\n"
                "Step 2: Choose the dilution equation:\n"
                "M1 * V1 = M2 * V2\n\n"
                "Step 3: Rearrange to solve for V1:\n"
                "V1 = (M2 * V2) / M1\n\n"
                "Step 4: Substitute numerical values:\n"
                "V1 = (0.500 M * 500.0 mL) / 12.0 M\n"
                "V1 = 250.0 / 12.0 mL = 20.83 mL\n\n"
                "Step 5: Verify significant figures and safety:\n"
                "Rounding to 3 significant figures: V1 = 20.8 mL.\n"
                "Safety Note: Always add acid to water slowly with stirring to dissipate heat.\n"
                "</SOLUTION_STEPS>\n"
                "<FINAL_ANSWER>\n"
                "20.8 mL of 12.0 M HCl is required (diluted to a total volume of 500.0 mL with water).\n"
                "</FINAL_ANSWER>"
            ),
            domain="calculations",
            subdomain="solutions_dilution",
            difficulty="introductory",
            reasoning_type="step_by_step_numerical",
            answer_type="numerical",
            chemical_entities=["HCl", "H2O"],
            formula="HCl",
            verified=True,
            confidence="high",
        ),
        ChemistryInstructionExample(
            id="calc_003",
            instruction="Calculate the pH of a 0.050 M aqueous solution of hydrochloric acid (HCl) at 25 °C.",
            output=(
                "<SOLUTION_STEPS>\n"
                "Step 1: Identify the nature of the solute:\n"
                "HCl is a strong monoprotic acid that dissociates completely in water:\n"
                "HCl(aq) + H2O(l) -> H3O+(aq) + Cl-(aq)\n\n"
                "Step 2: Determine hydronium ion concentration [H3O+]:\n"
                "Since dissociation is 100%:\n"
                "[H3O+] = [HCl] = 0.050 M = 5.0 * 10^-2 M\n\n"
                "Step 3: Apply the pH equation:\n"
                "pH = -log10[H3O+]\n\n"
                "Step 4: Calculate the numerical value:\n"
                "pH = -log10(0.050)\n"
                "pH = -(log10(5.0) + log10(10^-2))\n"
                "pH = -(0.699 - 2.000) = -(-1.301) = 1.30\n\n"
                "Step 5: Check result:\n"
                "A 0.05 M strong acid should be strongly acidic (pH between 1 and 2), which matches 1.30.\n"
                "</SOLUTION_STEPS>\n"
                "<FINAL_ANSWER>\n"
                "The pH of the 0.050 M HCl solution is 1.30.\n"
                "</FINAL_ANSWER>"
            ),
            domain="calculations",
            subdomain="acid_base_pH",
            difficulty="introductory",
            reasoning_type="step_by_step_numerical",
            answer_type="numerical",
            chemical_entities=["HCl", "H3O+", "Cl-"],
            formula="HCl",
            verified=True,
            confidence="high",
        ),
        ChemistryInstructionExample(
            id="calc_004",
            instruction="Calculate standard Gibbs free energy change (ΔG°) at 298 K for a reaction with ΔH° = -92.2 kJ/mol and ΔS° = -198.7 J/(mol·K). Is the reaction spontaneous at this temperature?",
            output=(
                "<SOLUTION_STEPS>\n"
                "Step 1: Identify given thermodynamic parameters:\n"
                "- Temperature, T = 298 K\n"
                "- Enthalpy change, ΔH° = -92.2 kJ/mol = -92,200 J/mol\n"
                "- Entropy change, ΔS° = -198.7 J/(mol·K)\n\n"
                "Step 2: State the Gibbs-Helmholtz equation:\n"
                "ΔG° = ΔH° - (T * ΔS°)\n\n"
                "Step 3: Convert units to ensure consistency (working in kJ/mol):\n"
                "T * ΔS° = 298 K * (-0.1987 kJ/(mol·K)) = -59.21 kJ/mol\n\n"
                "Step 4: Compute ΔG°:\n"
                "ΔG° = -92.2 kJ/mol - (-59.21 kJ/mol)\n"
                "ΔG° = -92.2 + 59.21 = -32.99 kJ/mol ≈ -33.0 kJ/mol\n\n"
                "Step 5: Assess spontaneity criteria:\n"
                "- If ΔG° < 0, the reaction is spontaneous under standard conditions at temperature T.\n"
                "- Since ΔG° = -33.0 kJ/mol (< 0), the reaction is spontaneous at 298 K.\n"
                "</SOLUTION_STEPS>\n"
                "<FINAL_ANSWER>\n"
                "ΔG° = -33.0 kJ/mol. The reaction is spontaneous under standard conditions at 298 K.\n"
                "</FINAL_ANSWER>"
            ),
            domain="calculations",
            subdomain="thermodynamics",
            difficulty="undergraduate",
            reasoning_type="step_by_step_numerical",
            answer_type="numerical",
            verified=True,
            confidence="high",
        ),
    ]
    return examples
