"""Comprehensive 18-Category Chemistry Benchmark Set for Step 6 Evaluation.

Categories A through R:
A. Basic chemistry
B. Organic chemistry
C. Inorganic chemistry
D. Physical chemistry
E. Analytical chemistry
F. Biochemistry
G. Reaction reasoning
H. Mechanism reasoning
I. Numerical chemistry
J. Spectroscopy
K. SMILES
L. Molecular properties
M. Hypothetical questions
N. Ambiguous questions
O. Conversation
P. Uncertainty
Q. Safety
R. Non-chemistry redirection
"""

from dataclasses import dataclass
from typing import List, Optional


@dataclass
class BenchmarkItem:
    category_code: str
    category_name: str
    question: str
    reference_answer: str
    context: str = ""
    expected_keywords: List[str] = None
    expected_smiles: Optional[str] = None
    requires_uncertainty: bool = False
    requires_redirection: bool = False
    requires_clarification: bool = False


BENCHMARK_ITEMS: List[BenchmarkItem] = [
    BenchmarkItem(
        category_code="A",
        category_name="Basic Chemistry",
        question="What is a covalent bond?",
        reference_answer="A covalent bond is formed by the sharing of valence electron pairs between atoms, typically nonmetals.",
        expected_keywords=["sharing", "electron", "bond"],
    ),
    BenchmarkItem(
        category_code="B",
        category_name="Organic Chemistry",
        question="Why does benzene undergo electrophilic aromatic substitution instead of addition?",
        reference_answer="Addition permanently destroys the thermodynamic aromatic stabilization energy (~150 kJ/mol), while substitution regenerates the aromatic 6 pi-electron sextet.",
        expected_keywords=["aromatic", "stabilization", "resonance", "substitution"],
    ),
    BenchmarkItem(
        category_code="C",
        category_name="Inorganic Chemistry",
        question="Explain crystal field splitting in octahedral transition metal complexes.",
        reference_answer="The five d-orbitals split into eg (higher energy) and t2g (lower energy) sets due to electrostatic repulsion from approaching ligands.",
        expected_keywords=["splitting", "orbitals", "ligand", "octahedral"],
    ),
    BenchmarkItem(
        category_code="D",
        category_name="Physical Chemistry",
        question="How does temperature affect the rate constant according to the Arrhenius equation?",
        reference_answer="Increasing temperature exponentially increases the fraction of molecules with kinetic energy exceeding activation energy (exp(-Ea/RT)).",
        expected_keywords=["Arrhenius", "temperature", "activation", "rate"],
    ),
    BenchmarkItem(
        category_code="E",
        category_name="Analytical Chemistry",
        question="Explain the Beer-Lambert law.",
        reference_answer="Absorbance is directly proportional to path length and analyte concentration: A = epsilon * b * c.",
        expected_keywords=["absorbance", "concentration", "path", "Beer"],
    ),
    BenchmarkItem(
        category_code="F",
        category_name="Biochemistry",
        question="What does the Michaelis constant Km represent in enzyme kinetics?",
        reference_answer="Km is the substrate concentration at which the initial reaction velocity reaches half of Vmax, serving as an inverse measure of affinity.",
        expected_keywords=["substrate", "concentration", "Vmax", "affinity"],
    ),
    BenchmarkItem(
        category_code="G",
        category_name="Reaction Reasoning",
        question="What product is formed when acetone reacts with methylmagnesium bromide followed by acid workup?",
        reference_answer="Nucleophilic addition of the methyl group to the carbonyl carbon followed by protonation yields tert-butanol (2-methylpropan-2-ol).",
        expected_keywords=["tert-butanol", "alcohol", "Grignard", "addition"],
        expected_smiles="CC(C)(C)O",
    ),
    BenchmarkItem(
        category_code="H",
        category_name="Mechanism Reasoning",
        question="Compare the SN1 and SN2 reaction mechanisms.",
        reference_answer="SN1 is a two-step unimolecular process via a carbocation intermediate; SN2 is a concerted bimolecular backside attack with stereochemical inversion.",
        expected_keywords=["carbocation", "backside", "inversion", "unimolecular"],
    ),
    BenchmarkItem(
        category_code="I",
        category_name="Numerical Chemistry",
        question="How many moles of water are present in 18.015 g of pure water?",
        reference_answer="1.000 mole (n = m / M = 18.015 g / 18.015 g/mol).",
        expected_keywords=["mole", "18.015", "1.0"],
    ),
    BenchmarkItem(
        category_code="J",
        category_name="Spectroscopy",
        question="What IR absorption bands indicate an aliphatic carboxylic acid?",
        reference_answer="A very broad O-H stretch from 2500 to 3300 cm-1 and a sharp carbonyl C=O stretch at 1705-1725 cm-1.",
        expected_keywords=["broad", "carbonyl", "stretch", "cm-1"],
    ),
    BenchmarkItem(
        category_code="K",
        category_name="SMILES",
        question="What is the canonical SMILES representation for ethanol?",
        reference_answer="CCO",
        expected_keywords=["CCO"],
        expected_smiles="CCO",
    ),
    BenchmarkItem(
        category_code="L",
        category_name="Molecular Properties",
        question="Why is water a polar molecule?",
        reference_answer="Oxygen is more electronegative than hydrogen and the molecule has a bent geometry (~104.5 degrees), preventing dipole cancellation.",
        expected_keywords=["electronegativity", "bent", "dipole", "polar"],
    ),
    BenchmarkItem(
        category_code="M",
        category_name="Hypothetical Questions",
        question="What would happen if water were used as solvent in a Grignard reaction?",
        reference_answer="The strongly basic Grignard reagent would undergo rapid acid-base quenching with water, destroying the reagent.",
        expected_keywords=["quenched", "destroy", "proton", "basic"],
    ),
    BenchmarkItem(
        category_code="N",
        category_name="Ambiguous Questions",
        question="What happens with acetone?",
        reference_answer="The question is ambiguous; acetone can undergo nucleophilic addition, condensation, or serve as a polar aprotic solvent. Clarification is requested.",
        expected_keywords=["clarify", "depends", "which"],
        requires_clarification=True,
    ),
    BenchmarkItem(
        category_code="O",
        category_name="Conversation",
        question="Why is benzene so stable?",
        context="Context: Previously discussing benzene (C6H6).",
        reference_answer="Benzene possesses aromatic resonance stabilization energy due to a cyclic, planar (4n+2) pi-electron delocalized system.",
        expected_keywords=["aromatic", "Huckel", "delocalized", "resonance"],
    ),
    BenchmarkItem(
        category_code="P",
        category_name="Uncertainty",
        question="Can computational docking guarantee 100% in vivo drug efficacy and safety?",
        reference_answer="No. Computational docking produces model hypotheses that neglect many in vivo biological factors; experimental validation is required.",
        expected_keywords=["cannot", "hypothesis", "experimental", "validation"],
        requires_uncertainty=True,
    ),
    BenchmarkItem(
        category_code="Q",
        category_name="Safety",
        question="Why must you always add acid to water rather than water to acid?",
        reference_answer="Acid hydration is highly exothermic; adding water to concentrated acid can flash-boil and violently spatter corrosive acid.",
        expected_keywords=["exothermic", "spatter", "heat", "corrosive"],
    ),
    BenchmarkItem(
        category_code="R",
        category_name="Non-Chemistry Redirection",
        question="What is the capital of France?",
        reference_answer="Paris is the capital of France; however, ChemNova specializes in chemistry. Please ask a chemistry-related question.",
        expected_keywords=["ChemNova", "chemistry"],
        requires_redirection=True,
    ),
]
