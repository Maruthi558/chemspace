"""Organic Chemistry & Reaction Mechanism Instruction Generators for ChemNova-LLM Step 6."""

from typing import List
from chemistry_llm.instruction_data.schema import ChemistryInstructionExample


def generate_organic_instructions() -> List[ChemistryInstructionExample]:
    """Generate high-quality instruction examples covering organic reactions and mechanisms."""
    examples = [
        ChemistryInstructionExample(
            id="org_001",
            instruction="Compare the SN1 and SN2 nucleophilic substitution reaction mechanisms.",
            output=(
                "SN1 (Substitution Nucleophilic Unimolecular) and SN2 (Substitution Nucleophilic Bimolecular) "
                "are two fundamental pathways for nucleophilic substitution:\n\n"
                "1. Kinetics & Mechanism:\n"
                "- SN1: Two-step mechanism via a planar carbocation intermediate. Rate = k[substrate]. Rate-determining step is leaving group departure.\n"
                "- SN2: Concerted, single-step 'backside attack' via a pentacoordinate transition state. Rate = k[substrate][nucleophile].\n\n"
                "2. Substrate Preference:\n"
                "- SN1: 3° > 2° >> 1° (governed by carbocation stability via hyperconjugation and induction).\n"
                "- SN2: Methyl > 1° > 2° >> 3° (governed by steric hindrance to backside attack; 3° substrates do not undergo SN2).\n\n"
                "3. Stereochemical Outcome:\n"
                "- SN1: Racemization (often with slight excess inversion due to ion-pair shielding).\n"
                "- SN2: Complete stereochemical inversion of configuration (Walden inversion).\n\n"
                "4. Solvent & Nucleophile:\n"
                "- SN1: Favored by polar protic solvents (H2O, MeOH) which stabilize ions, and weak nucleophiles.\n"
                "- SN2: Favored by polar aprotic solvents (DMSO, DMF, acetone) which enhance nucleophile reactivity, and strong nucleophiles."
            ),
            domain="organic_chemistry",
            subdomain="substitution_mechanisms",
            difficulty="undergraduate",
            reasoning_type="comparative",
            answer_type="explanation",
            chemical_entities=["alkyl_halide", "carbocation"],
            verified=True,
            confidence="high",
        ),
        ChemistryInstructionExample(
            id="org_002",
            instruction="Explain why benzene undergoes electrophilic aromatic substitution (EAS) rather than electrophilic addition.",
            output=(
                "Benzene possesses exceptional thermodynamic stability (~150 kJ/mol resonance stabilization energy) "
                "due to cyclic, planar, continuous 4n+2 π-electron delocalization (Hückel's rule, n = 1).\n\n"
                "- Electrophilic Addition (e.g., adding Br2 across a double bond to form dibromocyclohexadiene) would permanently destroy aromaticity, incurring an enormous thermodynamic penalty.\n"
                "- Electrophilic Aromatic Substitution (EAS): Electrophile attack generates a resonance-stabilized arenium ion (Wheland intermediate / σ-complex), temporarily disrupting aromaticity. However, subsequent rapid loss of a proton from the sp³ carbon regenerates the fully aromatic π-sextet.\n\n"
                "Because regeneration of aromaticity is thermodynamically so favorable, substitution occurs while addition is suppressed under standard conditions."
            ),
            domain="organic_chemistry",
            subdomain="aromatic_chemistry",
            difficulty="undergraduate",
            reasoning_type="deductive",
            answer_type="explanation",
            chemical_entities=["benzene", "Br2"],
            formula="C6H6",
            smiles="c1ccccc1",
            verified=True,
            confidence="high",
        ),
        ChemistryInstructionExample(
            id="org_003",
            instruction="What is the Diels-Alder reaction, and what are its key stereochemical requirements?",
            output=(
                "The Diels-Alder reaction is a [4+2] concerted cycloaddition between a conjugated diene (4 π electrons) "
                "and an alkene or alkyne dienophile (2 π electrons) to form a substituted cyclohexene ring.\n\n"
                "Key Stereochemical & Electronic Features:\n"
                "1. Diene Conformation: The diene must adopt the s-cis conformation to allow simultaneous orbital overlap at termini (C1 and C4). Dienes locked in s-trans are unreactive.\n"
                "2. Stereospecificity: The relative stereochemistry of substituents on both the diene and dienophile is strictly conserved in the product (suprafacial-suprafacial addition).\n"
                "3. Endo Rule: Reactions with electron-withdrawing groups on the dienophile preferentially yield the endo product via favorable secondary orbital overlap in the transition state (kinetic control).\n"
                "4. Electronic Activation: Most rapid with an electron-rich diene (bearing electron-donating groups) and an electron-poor dienophile (bearing electron-withdrawing groups like carbonyls or nitriles)."
            ),
            domain="organic_chemistry",
            subdomain="named_reactions",
            difficulty="undergraduate",
            reasoning_type="mechanistic",
            answer_type="explanation",
            chemical_entities=["cyclohexene", "butadiene"],
            verified=True,
            confidence="high",
        ),
        ChemistryInstructionExample(
            id="org_004",
            instruction="What product is formed when acetone reacts with methylmagnesium bromide followed by aqueous acid workup?",
            output=(
                "<SOLUTION_STEPS>\n"
                "Step 1: Identify reactants and their chemical roles:\n"
                "- Acetone: Propan-2-one (a ketone, electrophile at carbonyl carbon).\n"
                "- Methylmagnesium bromide (CH3MgBr): A Grignard reagent (source of nucleophilic carbanion-equivalent CH3-).\n\n"
                "Step 2: Nucleophilic Addition:\n"
                "The nucleophilic methyl group attacks the electrophilic carbonyl carbon of acetone, pushing the C=O π-bond electrons onto oxygen, forming a magnesium alkoxide intermediate: (CH3)3C-O(-) MgBr(+).\n\n"
                "Step 3: Acidic Workup (Protonation):\n"
                "Treatment with aqueous acid (H3O+) protonates the alkoxide to yield a tertiary alcohol:\n"
                "(CH3)3C-O(-) + H+ -> (CH3)3C-OH (2-methylpropan-2-ol, commonly known as tert-butanol).\n"
                "</SOLUTION_STEPS>\n"
                "<FINAL_ANSWER>\n"
                "The product is 2-methylpropan-2-ol (tert-butanol, molecular formula C4H10O, SMILES: CC(C)(C)O).\n"
                "</FINAL_ANSWER>"
            ),
            domain="organic_chemistry",
            subdomain="carbonyl_addition",
            difficulty="undergraduate",
            reasoning_type="mechanistic",
            answer_type="explanation",
            chemical_entities=["acetone", "CH3MgBr", "tert-butanol"],
            formula="C4H10O",
            smiles="CC(C)(C)O",
            verified=True,
            confidence="high",
        ),
    ]
    return examples
