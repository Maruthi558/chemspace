"""Fundamentals & General Chemistry Instruction Generators for ChemNova-LLM Step 6."""

from typing import List
from chemistry_llm.instruction_data.schema import ChemistryInstructionExample


def generate_fundamentals_instructions() -> List[ChemistryInstructionExample]:
    """Generate high-quality instruction examples covering chemistry fundamentals."""
    examples = [
        ChemistryInstructionExample(
            id="fund_001",
            instruction="What is a covalent bond?",
            output=(
                "A covalent bond is a chemical bond formed by the mutual sharing of one or more pairs of "
                "electrons between two atoms, typically nonmetals with similar electronegativities. "
                "By sharing valence electrons, both atoms attain a stable, lower-energy electron configuration, "
                "often satisfying the octet rule (such as in H2O, CH4, or Cl2)."
            ),
            domain="fundamentals",
            subdomain="chemical_bonding",
            difficulty="introductory",
            reasoning_type="direct_recall",
            answer_type="explanation",
            chemical_entities=["H2O", "CH4", "Cl2"],
            verified=True,
            confidence="high",
        ),
        ChemistryInstructionExample(
            id="fund_002",
            instruction="Why is water a polar molecule?",
            output=(
                "Water (H2O) is polar due to two key factors:\n"
                "1. Electronegativity Difference: Oxygen (electronegativity ~3.44) is significantly more "
                "electronegative than hydrogen (~2.20), pulling electron density toward itself and creating "
                "polar covalent O-H bonds with partial negative (δ-) charge on oxygen and partial positive (δ+) on hydrogens.\n"
                "2. Bent Molecular Geometry: Oxygen has two bonding pairs and two lone pairs of electrons, producing "
                "a bent geometry (bond angle ~104.5°) according to VSEPR theory. Because the molecule is not linear, "
                "the individual bond dipole moments do not cancel, resulting in a net molecular dipole moment of ~1.85 D."
            ),
            domain="fundamentals",
            subdomain="polarity_geometry",
            difficulty="introductory",
            reasoning_type="deductive",
            answer_type="explanation",
            chemical_entities=["H2O"],
            formula="H2O",
            smiles="O",
            verified=True,
            confidence="high",
        ),
        ChemistryInstructionExample(
            id="fund_003",
            instruction="Explain the periodic trend of first ionization energy across a period and down a group.",
            output=(
                "First ionization energy (the energy required to remove the most loosely held valence electron from a gaseous atom) displays the following periodic trends:\n\n"
                "- Across a Period (Left to Right): Ionization energy generally increases. As effective nuclear charge (Zeff) increases with negligible increase in shielding, valence electrons are held more tightly closer to the nucleus.\n"
                "- Down a Group (Top to Bottom): Ionization energy decreases. Additional principal electron shells increase the atomic radius and electron shielding, placing valence electrons farther from the nucleus where they experience weaker electrostatic attraction.\n\n"
                "Exceptions occur at subshell boundaries, such as between Group 2 and 13 (e.g., Be to B) due to p-orbital shielding, and Groups 15 and 16 (e.g., N to O) due to electron-electron repulsion in paired p-orbitals."
            ),
            domain="fundamentals",
            subdomain="periodic_trends",
            difficulty="undergraduate",
            reasoning_type="deductive",
            answer_type="explanation",
            chemical_entities=["Be", "B", "N", "O"],
            verified=True,
            confidence="high",
        ),
        ChemistryInstructionExample(
            id="fund_004",
            instruction="What is the electron configuration of neutral iron (Fe, Z = 26)?",
            output=(
                "The electron configuration of neutral iron (Fe, atomic number 26) is:\n\n"
                "Full configuration: 1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶\n"
                "Noble gas shorthand: [Ar] 4s² 3d⁶ (or [Ar] 3d⁶ 4s²)\n\n"
                "Iron possesses 26 electrons: 18 match the argon core, 2 occupy the 4s subshell, and 6 occupy the five 3d orbitals (yielding 4 unpaired electrons according to Hund's rule)."
            ),
            domain="fundamentals",
            subdomain="electron_configuration",
            difficulty="introductory",
            reasoning_type="direct_recall",
            answer_type="explanation",
            chemical_entities=["Fe", "Ar"],
            verified=True,
            confidence="high",
        ),
        ChemistryInstructionExample(
            id="fund_005",
            instruction="Compare intermolecular hydrogen bonding with London dispersion forces.",
            output=(
                "Hydrogen bonding and London dispersion forces are both non-covalent intermolecular attractions, but differ substantially in origin, strength, and specificity:\n\n"
                "1. Hydrogen Bonding: A strong dipole-dipole attraction occurring specifically when hydrogen is covalently bonded to a highly electronegative atom (N, O, or F) and interacts with a lone pair on a neighboring N, O, or F atom. Typical bond energies range from 10 to 40 kJ/mol.\n"
                "2. London Dispersion Forces (LDF): Universal, transient attractions present between all atoms and molecules, caused by momentary fluctuations in electron distribution creating instantaneous and induced dipoles. Typical energies are much weaker (0.5 to 5 kJ/mol), though they scale with molecular surface area and polarizability."
            ),
            domain="fundamentals",
            subdomain="intermolecular_forces",
            difficulty="undergraduate",
            reasoning_type="comparative",
            answer_type="explanation",
            verified=True,
            confidence="high",
        ),
    ]
    return examples


def generate_general_chemistry_instructions() -> List[ChemistryInstructionExample]:
    """Generate high-quality instruction examples covering general chemistry principles."""
    examples = [
        ChemistryInstructionExample(
            id="gen_001",
            instruction="Balance the chemical equation for the combustion of propane: C3H8 + O2 -> CO2 + H2O",
            output=(
                "<SOLUTION_STEPS>\n"
                "Step 1: Identify atom counts on both sides:\n"
                "- Reactants: C = 3, H = 8, O = 2\n"
                "- Products: C = 1, H = 2, O = 3\n\n"
                "Step 2: Balance Carbon atoms first by placing coefficient 3 before CO2:\n"
                "C3H8 + O2 -> 3 CO2 + H2O\n\n"
                "Step 3: Balance Hydrogen atoms by placing coefficient 4 before H2O (4 * 2 = 8 H):\n"
                "C3H8 + O2 -> 3 CO2 + 4 H2O\n\n"
                "Step 4: Count total oxygen atoms on product side:\n"
                "(3 * 2 from CO2) + (4 * 1 from H2O) = 6 + 4 = 10 O atoms\n\n"
                "Step 5: Balance Oxygen on reactant side by placing coefficient 5 before O2 (5 * 2 = 10 O):\n"
                "C3H8 + 5 O2 -> 3 CO2 + 4 H2O\n"
                "</SOLUTION_STEPS>\n"
                "<FINAL_ANSWER>\n"
                "C3H8 + 5 O2 -> 3 CO2 + 4 H2O\n"
                "</FINAL_ANSWER>"
            ),
            domain="general_chemistry",
            subdomain="stoichiometry",
            difficulty="introductory",
            reasoning_type="step_by_step_numerical",
            answer_type="reaction",
            chemical_entities=["C3H8", "O2", "CO2", "H2O"],
            reaction="C3H8 + 5 O2 -> 3 CO2 + 4 H2O",
            verified=True,
            confidence="high",
        ),
        ChemistryInstructionExample(
            id="gen_002",
            instruction="What is Le Chatelier's principle, and how does an increase in pressure affect the synthesis of ammonia (N2 + 3 H2 <=> 2 NH3)?",
            output=(
                "Le Chatelier's principle states that if a dynamic equilibrium system is subjected to a disturbance "
                "(such as a change in concentration, temperature, or pressure/volume), the system shifts its equilibrium position "
                "in a direction that counteracts the applied stress.\n\n"
                "For the Haber-Bosch ammonia synthesis reaction:\n"
                "N2(g) + 3 H2(g) <=> 2 NH3(g) (ΔH < 0, exothermic)\n\n"
                "- Reactant gas moles: 1 mol N2 + 3 mol H2 = 4 moles of gas\n"
                "- Product gas moles: 2 moles of NH3\n\n"
                "When pressure is increased (or volume decreased), the system responds by shifting toward the side with fewer gas moles "
                "to alleviate pressure. Therefore, increasing pressure shifts equilibrium to the right (forward direction), favoring the yield of ammonia (NH3)."
            ),
            domain="general_chemistry",
            subdomain="equilibrium",
            difficulty="undergraduate",
            reasoning_type="deductive",
            answer_type="explanation",
            chemical_entities=["N2", "H2", "NH3"],
            reaction="N2 + 3 H2 <=> 2 NH3",
            verified=True,
            confidence="high",
        ),
        ChemistryInstructionExample(
            id="gen_003",
            instruction="Explain the difference between a Bronsted-Lowry acid/base and a Lewis acid/base.",
            output=(
                "The Bronsted-Lowry and Lewis definitions describe acid-base behavior at different levels of generality:\n\n"
                "1. Bronsted-Lowry Definition (Proton Transfer):\n"
                "- Acid: A proton (H+) donor (e.g., HCl donating H+ to water).\n"
                "- Base: A proton (H+) acceptor (e.g., NH3 accepting H+ to form NH4+).\n\n"
                "2. Lewis Definition (Electron-Pair Transfer):\n"
                "- Acid: An electron-pair acceptor (e.g., BF3 or AlCl3 with an incomplete octet or vacant orbital).\n"
                "- Base: An electron-pair donor (e.g., NH3 donating a lone pair to form a coordinate covalent adduct BF3:NH3).\n\n"
                "All Bronsted-Lowry acids and bases are Lewis acids/bases, but the Lewis model encompasses reactions that do not involve any hydrogen ions."
            ),
            domain="general_chemistry",
            subdomain="acids_bases",
            difficulty="undergraduate",
            reasoning_type="comparative",
            answer_type="explanation",
            chemical_entities=["HCl", "NH3", "BF3", "AlCl3"],
            verified=True,
            confidence="high",
        ),
    ]
    return examples
