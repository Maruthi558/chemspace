"""Hypothetical Chemistry, Ambiguity, Uncertainty & Error Correction Generator for Step 6."""

from typing import List
from chemistry_llm.instruction_data.schema import ChemistryInstructionExample


def generate_uncertainty_hypothetical_instructions() -> List[ChemistryInstructionExample]:
    """Generate instruction examples covering ambiguous queries, uncertainty, and error corrections."""
    examples = [
        ChemistryInstructionExample(
            id="ambig_001",
            instruction="What happens with acetone?",
            output=(
                "Acetone (propan-2-one) is a versatile chemical that undergoes many different transformations depending on the context. "
                "To give you an accurate and helpful answer, could you please clarify which aspect you are interested in?\n\n"
                "1. Chemical Reactions: (e.g., nucleophilic addition with Grignard reagents, aldol self-condensation, haloform reaction, reduction to isopropanol, or enolate alkylation)?\n"
                "2. Physical & Solvent Properties: (e.g., boiling point 56 °C, miscibility with water, polar aprotic solvent characteristics)?\n"
                "3. Spectroscopy: (e.g., IR carbonyl peak at 1715 cm⁻¹, 1H NMR singlet at δ 2.17 ppm)?\n"
                "4. Laboratory Safety & Handling: (e.g., flammability, vapor pressure, skin contact)?"
            ),
            domain="conversation",
            subdomain="ambiguity_clarification",
            difficulty="introductory",
            reasoning_type="clarification",
            answer_type="clarification",
            chemical_entities=["acetone"],
            formula="C3H6O",
            smiles="CC(=O)C",
            verified=True,
            confidence="high",
        ),
        ChemistryInstructionExample(
            id="hypo_001",
            instruction="What would happen if water were used as the solvent for a Grignard reaction?",
            output=(
                "Using water as a solvent completely destroys the Grignard reagent (RMgX) before any desired nucleophilic addition can occur.\n\n"
                "Chemical Rationale:\n"
                "- Grignard reagents contain an extremely basic, nucleophilic carbanion-equivalent (pKa of alkane conjugate acids ~50).\n"
                "- Water is a protic solvent with pKa ~15.7.\n"
                "- Acid-Base Quenching: The Grignard reagent undergoes an instantaneous, highly exothermic acid-base reaction with water:\n"
                "RMgX + H2O -> R-H (alkane) + HOMgX (insoluble basic magnesium salt)\n\n"
                "Conclusion: Anhydrous, aprotic ether solvents (such as dry diethyl ether or anhydrous tetrahydrofuran/THF) "
                "must be rigorously employed to coordinate with and stabilize the magnesium center while preventing protonolysis."
            ),
            domain="organic_chemistry",
            subdomain="reaction_conditions",
            difficulty="undergraduate",
            reasoning_type="hypothetical",
            answer_type="explanation",
            chemical_entities=["Grignard", "H2O", "THF"],
            verified=True,
            confidence="high",
        ),
        ChemistryInstructionExample(
            id="uncert_001",
            instruction="Can a computer model guarantee with 100% certainty that a newly designed drug molecule will inhibit a kinase target in humans without toxicity?",
            output=(
                "No. Computational modeling (molecular docking, QSAR, and molecular dynamics) provides valuable hypotheses and binding affinity estimates, "
                "but cannot guarantee efficacy or safety in biological systems with certainty.\n\n"
                "Key Scientific Distinctions:\n"
                "1. Theoretical Prediction vs Experimental Reality: Docking scoring functions approximate free energy of binding using simplified force fields that often neglect subtle entropic, solvation, and conformational induction effects.\n"
                "2. Biological Complexity: Kinase inhibition in cell-free assays does not guarantee cellular permeability, in vivo metabolic stability, or target engagement.\n"
                "3. Off-Target Toxicity & ADME: Pharmacokinetics, cytochrome P450 metabolism, hERG cardiotoxicity, and immune responses can only be reliably established through rigorous in vitro assays, in vivo pharmacokinetic studies, and formal clinical trials.\n\n"
                "Status: Computational predictions must always be treated as model hypotheses requiring experimental validation."
            ),
            domain="medicinal_chemistry",
            subdomain="computational_uncertainty",
            difficulty="advanced",
            reasoning_type="uncertainty_assessment",
            answer_type="explanation",
            verified=True,
            confidence="uncertain",
        ),
        ChemistryInstructionExample(
            id="err_001",
            instruction="What is wrong with this chemical equation: Na + Cl2 -> NaCl?",
            output=(
                "<SOLUTION_STEPS>\n"
                "Step 1: Check atom conservation on both sides:\n"
                "- Reactants: 1 Na atom, 2 Cl atoms (from diatomic Cl2)\n"
                "- Products: 1 Na atom, 1 Cl atom (in NaCl)\n\n"
                "Step 2: Identify error:\n"
                "The equation violates the Law of Conservation of Mass because Chlorine is not balanced (2 Cl on left vs 1 Cl on right).\n\n"
                "Step 3: Balance the equation correctly:\n"
                "- Place coefficient 2 in front of NaCl to balance chlorine: Na + Cl2 -> 2 NaCl\n"
                "- Balance sodium by placing coefficient 2 in front of Na: 2 Na + Cl2 -> 2 NaCl\n\n"
                "Step 4: Verify balanced counts:\n"
                "- Na: 2 on left, 2 on right\n"
                "- Cl: 2 on left, 2 on right\n"
                "</SOLUTION_STEPS>\n"
                "<FINAL_ANSWER>\n"
                "The equation is unbalanced. The correct, balanced equation is:\n"
                "2 Na(s) + Cl2(g) -> 2 NaCl(s)\n"
                "</FINAL_ANSWER>"
            ),
            domain="general_chemistry",
            subdomain="error_correction",
            difficulty="introductory",
            reasoning_type="error_correction",
            answer_type="reaction",
            chemical_entities=["Na", "Cl2", "NaCl"],
            reaction="2 Na + Cl2 -> 2 NaCl",
            verified=True,
            confidence="high",
        ),
    ]
    return examples
