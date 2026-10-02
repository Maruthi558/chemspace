"""Chemistry question, answer, and variations corpus generator.

Generates structured records covering:
- Multi-level Q&A (beginner to graduate / research level)
- Natural language question variations mapping to shared concept IDs
- Hypothetical chemistry problems ("What would happen if...")
- Common mistakes and laboratory troubleshooting
"""

from typing import List, Dict, Any
from chemistry_llm.data.schema.types import DatasetType, ChemistryDomain
from chemistry_llm.data.schema.record import ChemNovaRecord

QA_DATA = [
    # 1. Natural Variation Group: Molar Mass of Water
    {
        "concept_id": "concept_mw_water",
        "domain": ChemistryDomain.GENERAL_CHEMISTRY,
        "subdomain": "stoichiometry",
        "answer": "The molar mass of water (H2O) is 18.015 g/mol (molecular weight 18.015 u), calculated from two hydrogen atoms (2 × 1.008 g/mol) and one oxygen atom (15.999 g/mol).",
        "reasoning": "Molar mass = 2 * M(H) + 1 * M(O) = 2 * 1.008 g/mol + 15.999 g/mol = 18.015 g/mol.",
        "variations": [
            ("qa_var_water_mw_1", "What is the molecular weight of water?"),
            ("qa_var_water_mw_2", "What is H2O's molar mass?"),
            ("qa_var_water_mw_3", "How much does one mole of water weigh in grams?"),
            ("qa_var_water_mw_4", "Calculate the molar mass of H2O."),
            ("qa_var_water_mw_5", "What is the molecular mass of an H2O molecule?"),
        ]
    },
    # 2. Natural Variation Group: Avogadro's Number
    {
        "concept_id": "concept_avogadro_constant",
        "domain": ChemistryDomain.GENERAL_CHEMISTRY,
        "subdomain": "fundamental_constants",
        "answer": "Avogadro's constant (N_A) is defined as exactly 6.02214076 × 10²³ reciprocal moles (mol⁻¹), representing the number of constituent particles per mole of substance in the SI system.",
        "reasoning": "Under the 2019 redefinition of SI base units, the mole is defined by fixing the numerical value of Avogadro's constant to exactly 6.02214076 × 10²³.",
        "variations": [
            ("qa_var_avo_1", "What is Avogadro's number?"),
            ("qa_var_avo_2", "How many atoms or molecules are in one mole?"),
            ("qa_var_avo_3", "What is the exact numerical value and units of Avogadro's constant?"),
            ("qa_var_avo_4", "Define Avogadro's constant N_A in modern SI units."),
        ]
    },
    # 3. Hypothetical Chemistry: Le Chatelier & Temperature
    {
        "concept_id": "hypo_exothermic_temp_increase",
        "domain": ChemistryDomain.PHYSICAL_CHEMISTRY,
        "subdomain": "chemical_equilibrium",
        "answer": "For an exothermic equilibrium reaction (such as the Haber synthesis N2 + 3H2 ⇌ 2NH3, Delta H < 0), increasing the temperature shifts the equilibrium toward the reactants (to the left), decreasing the equilibrium constant K_eq and reducing ammonia yield.",
        "reasoning": "LOGICAL DEDUCTION & UNCERTAINTY:\n"
        "- Known chemical principle: In an exothermic process, heat is released (a product of the forward reaction).\n"
        "- Le Chatelier's Principle predicts that adding thermal energy shifts the system in the endothermic direction to absorb excess heat.\n"
        "- Quantitative basis: The van 't Hoff equation d(ln K)/dT = Delta H° / (RT^2) dictates that when Delta H° is negative, the slope is negative, meaning K_eq strictly decreases as T increases.\n"
        "- Practical trade-off (Kinetics vs Thermodynamics): While lower temperatures increase equilibrium yield, reaction rate becomes impractically slow, requiring an intermediate compromise temperature (e.g. 450 °C) with an active iron catalyst.",
        "variations": [
            ("hypo_temp_haber_1", "What would happen if the reaction temperature is increased during ammonia synthesis at equilibrium?"),
            ("hypo_temp_haber_2", "Suppose I increase the temperature of an exothermic equilibrium reaction. How does the product yield change and why?"),
        ]
    },
    # 4. Troubleshooting / Common Mistakes: Electronegativity vs Electron Affinity
    {
        "concept_id": "common_mistake_en_vs_ea",
        "domain": ChemistryDomain.GENERAL_CHEMISTRY,
        "subdomain": "common_mistakes",
        "answer": "A common mistake is confusing electronegativity with electron affinity. Electron affinity is a measurable thermodynamic quantity (energy released when an electron is added to an isolated gaseous atom, in kJ/mol), whereas electronegativity is a dimensionless relative index of an atom's ability to attract bonding electrons within a covalent chemical bond.",
        "reasoning": "- Electron Affinity: Physical reaction X(g) + e- → X-(g), quantified experimentally in kJ/mol or eV. Chlorine has the highest electron affinity (-349 kJ/mol).\n"
        "- Electronegativity: Property of an atom bonded in a molecule (Pauling, Mulliken, or Allred-Rochow scale). Fluorine has the highest Pauling electronegativity (3.98), not Chlorine.\n"
        "- Diagnostic check: You cannot measure the 'electronegativity' of an isolated free atom in a vacuum, only its electron affinity and ionization energy.",
        "variations": [
            ("trouble_en_ea_1", "What is the difference between electronegativity and electron affinity, and why do students often confuse them?"),
            ("trouble_en_ea_2", "Why does Chlorine have a higher electron affinity than Fluorine, but Fluorine has a higher electronegativity?"),
        ]
    },
    # 5. Natural Variation Group: Definition of pH
    {
        "concept_id": "concept_ph_definition",
        "domain": ChemistryDomain.GENERAL_CHEMISTRY,
        "subdomain": "acids_bases",
        "answer": "pH is defined quantitatively as the negative logarithm (base 10) of the hydronium ion activity (or concentration in dilute solution): pH = -log10[H3O+]. In pure water at 25 °C, [H3O+] = 1.0 × 10⁻⁷ M, yielding a neutral pH of 7.00.",
        "reasoning": "Formulated by Søren Sørensen (1909), 'pH' stands for 'power of hydrogen' (potentia hydrogenii). Because the autoionization product of water is Kw = [H3O+][OH-] = 1.0 × 10⁻¹⁴ at 25 °C, pH + pOH = 14.00.",
        "variations": [
            ("qa_var_ph_1", "What is the mathematical definition of pH?"),
            ("qa_var_ph_2", "How is pH defined and calculated from hydrogen ion concentration?"),
            ("qa_var_ph_3", "Define pH in chemistry."),
            ("qa_var_ph_4", "What does pH measure and how is it related to [H3O+]?"),
            ("qa_var_ph_5", "State the formula used to calculate pH from hydronium molarity."),
        ]
    },
    # 6. Multi-Level Question: Beginner (Physical vs Chemical Change)
    {
        "concept_id": "beginner_chem_vs_phys_change",
        "domain": ChemistryDomain.GENERAL_CHEMISTRY,
        "subdomain": "fundamentals",
        "answer": "A physical change alters the physical form or state of a substance without breaking or forming chemical bonds or changing its chemical identity (e.g., ice melting, water boiling). A chemical change involves the breaking and forming of chemical bonds, converting reactants into new chemical substances with distinct chemical compositions (e.g., iron rusting, methane combustion).",
        "reasoning": "- Physical changes are typically reversible by simple physical methods (temperature, pressure) because molecular structure is preserved (H2O(s) → H2O(l)).\n"
        "- Chemical changes alter chemical formulas and are accompanied by enthalpy changes, gas evolution, color transitions, or precipitate formation (CH4 + 2O2 → CO2 + 2H2O).",
        "variations": [
            ("qa_lvl_beg_change_1", "What is the fundamental difference between a physical change and a chemical change?"),
            ("qa_lvl_beg_change_2", "How do you distinguish between a physical property change and a chemical reaction?"),
        ]
    },
    # 7. Multi-Level Question: Intermediate (Catalyst Function)
    {
        "concept_id": "intermed_catalyst_mechanism",
        "domain": ChemistryDomain.PHYSICAL_CHEMISTRY,
        "subdomain": "catalysis",
        "answer": "A catalyst increases the rate of a chemical reaction by providing an alternative reaction pathway with a lower activation energy (Ea). A catalyst accelerates both forward and reverse reaction rates equally without altering the equilibrium constant (K_eq) or thermodynamic Gibbs free energy change (Delta G°), and is regenerated chemically unchanged at the end of the catalytic cycle.",
        "reasoning": "1. Kinetic effect: According to the Arrhenius equation k = A * exp(-Ea / RT), lowering Ea exponentially increases rate constant k.\n"
        "2. Thermodynamic invariance: Catalysts do not change initial reactant states or final product states; therefore Delta H°, Delta S°, and Delta G° remain identical.\n"
        "3. Equilibrium: Forward rate v_f = k_f[R] and reverse rate v_r = k_r[P]. Since k_f and k_r increase by the same factor, K_eq = k_f / k_r is unchanged.",
        "variations": [
            ("qa_lvl_int_cat_1", "How does a catalyst increase reaction rate without altering the chemical equilibrium?"),
            ("qa_lvl_int_cat_2", "Explain the effect of a catalyst on activation energy, reaction rate, and equilibrium constant."),
        ]
    },
    # 8. Multi-Level Question: Advanced (Cyclooctatetraene Antiaromaticity Avoidance)
    {
        "concept_id": "advanced_cot_antiaromaticity",
        "domain": ChemistryDomain.ORGANIC_CHEMISTRY,
        "subdomain": "aromatic_chemistry",
        "answer": "Planar 1,3,5,7-cyclooctatetraene (COT) would possess 8 pi electrons, satisfying the Hückel 4n antiaromaticity rule (n=2), which is thermodynamically destabilizing. To avoid antiaromatic destabilization, COT adopts a non-planar 'tub' conformation (D2d symmetry) where adjacent C=C double bonds are perpendicular, preventing continuous cyclic pi overlap and behaving as a non-aromatic, reactive polyene.",
        "reasoning": "1. Hückel's Rule requires planarity and continuous cyclic overlap of p-orbitals.\n"
        "2. For an 8 pi-electron monocyclic planar polygon, Frost circle analysis shows two unpaired electrons in non-bonding degenerate molecular orbitals (diradical triplet ground state), creating antiaromatic instability.\n"
        "3. Flexible 8-membered carbon ring easily puckers into a tub conformation with alternating 1.34 Å double bonds and 1.46 Å single bonds, avoiding antiaromaticity at the cost of slight angle strain.\n"
        "4. In contrast, two-electron reduction of COT with potassium metal forms the planar, aromatic cyclooctatetraenide dianion (COT2-, 10 pi electrons, 4n+2 with n=2).",
        "variations": [
            ("qa_lvl_adv_cot_1", "Why is cyclooctatetraene non-planar and non-aromatic rather than planar and antiaromatic?"),
            ("qa_lvl_adv_cot_2", "Explain how cyclooctatetraene avoids antiaromaticity by conformational adaptation."),
        ]
    },
    # 9. Multi-Level Question: University / Graduate (Curtin-Hammett Principle)
    {
        "concept_id": "univ_curtin_hammett_principle",
        "domain": ChemistryDomain.ORGANIC_CHEMISTRY,
        "subdomain": "physical_organic",
        "answer": "The Curtin-Hammett principle states that for a reaction of two rapidly interconverting conformational isomers (conformers A and B) that lead irreversibly to different products (P_A and P_B), the product distribution depends exclusively on the free energy difference between their respective transition states (Delta Delta G_double_dagger), and is independent of the ground-state equilibrium ratio of the conformers.",
        "reasoning": "1. Requirement: Rate of conformational interconversion between A and B (k_inter) must be significantly faster than the rates of product formation (k_A, k_B).\n"
        "2. Mathematical derivation: Product ratio [P_A] / [P_B] = (k_A / k_B) * (1 / K_eq) = exp(-(Delta G_double_dagger_A - Delta G_double_dagger_B) / RT).\n"
        "3. Crucial takeaway: Even if conformer A constitutes 99% of the ground-state population, if the transition state from minor conformer B is lower in absolute energy (Delta G_double_dagger_B < Delta G_double_dagger_A), product P_B will dominate.\n"
        "4. Common misconception: Predicting product distribution simply from ground-state conformer populations violates the Curtin-Hammett principle.",
        "variations": [
            ("qa_lvl_grad_curtin_1", "Explain the Curtin-Hammett principle and its implications for product distribution in conformational isomers."),
            ("qa_lvl_grad_curtin_2", "Why is the ground-state ratio of conformers insufficient to predict product ratios under Curtin-Hammett kinetics?"),
        ]
    },
    # 10. Hypothetical Chemistry: Solvent Replacement in SN2
    {
        "concept_id": "hypo_solvent_change_sn2",
        "domain": ChemistryDomain.ORGANIC_CHEMISTRY,
        "subdomain": "hypothetical_chemistry",
        "answer": "If the polar aprotic solvent DMSO is replaced with polar protic water in an SN2 reaction (e.g. bromobutane + NaCN), the reaction rate will decrease drastically by several orders of magnitude (often 10^4 to 10^6 times slower). In water, strong hydrogen bonding donates into the cyanide lone pairs, forming a tight solvation shell that dramatically stabilizes the ground-state nucleophile and raises the activation energy for backside attack.",
        "reasoning": "LOGICAL DEDUCTION & PREDICTION:\n"
        "- Known principle: SN2 reaction rate = k[Substrate][Nucleophile]. Rate constant k depends inversely on activation free energy Delta G_double_dagger.\n"
        "- Solvent effects on nucleophiles: In protic solvents (H2O, MeOH), small electronegative anions (F-, CN-, Cl-) form strong hydrogen bonds, lowering their ground-state free energy (enthalpic solvation sink).\n"
        "- In polar aprotic solvents (DMSO, DMF, acetone), positive ends of solvent dipoles are sterically shielded while negative oxygens solvate metal cations (Na+), leaving anions 'naked', unencumbered, and highly nucleophilic.\n"
        "- Side reaction uncertainty: Replacing DMSO with water introduces competing hydroxide (OH-) from water autoionization or cyanide hydrolysis (CN- + H2O ⇌ HCN + OH-), leading to competing alcohol byproduct formation.",
        "variations": [
            ("hypo_sn2_solvent_1", "What would happen if the polar aprotic solvent is replaced with water in an SN2 substitution?"),
            ("hypo_sn2_solvent_2", "Suppose I perform an SN2 reaction in water instead of DMSO. How does the rate change and what side reactions occur?"),
        ]
    },
    # 11. Hypothetical Chemistry: Oxygen Replaced by Sulfur in Water
    {
        "concept_id": "hypo_water_h2o_vs_h2s",
        "domain": ChemistryDomain.INORGANIC_CHEMISTRY,
        "subdomain": "hypothetical_chemistry",
        "answer": "If oxygen in water (H2O) is replaced by sulfur to form hydrogen sulfide (H2S), hydrogen bonding essentially vanishes. Despite having a higher molecular weight (34.08 vs 18.02 g/mol), H2S is a foul-smelling gas at room temperature (boiling point -60 °C vs +100 °C for H2O), has a much smaller bond angle (92.1° vs 104.5°), and is significantly more acidic (pKa 7.0 vs 15.7 for H2O).",
        "reasoning": "LOGICAL DEDUCTION & SCIENTIFIC COMPARISON:\n"
        "- Electronegativity: Oxygen has Pauling EN = 3.44 (highly electronegative, small 2p orbital), producing strong localized dipole moments and intense intermolecular hydrogen bonding.\n"
        "- Sulfur has Pauling EN = 2.58 (close to hydrogen's 2.20), and its larger 3p orbital is diffused, preventing effective hydrogen bonding.\n"
        "- Bond Angle: In H2O, 2s and 2p orbitals hybridize into sp3 (ideal 109.5°, compressed to 104.5° by lone pairs). In H2S, sulfur bonding orbitals have nearly pure 3p character with minimal s-p hybridization, yielding bond angles close to 90° (92.1°).\n"
        "- Acidity: S-H bond (363 kJ/mol) is much weaker than O-H bond (467 kJ/mol), and the larger sulfur radius better stabilizes negative charge in HS-, making H2S ~10^8 times more acidic than water.",
        "variations": [
            ("hypo_h2o_vs_h2s_1", "What would happen to the physical and chemical properties if oxygen in water is replaced by sulfur?"),
            ("hypo_h2o_vs_h2s_2", "Why is H2O a liquid at room temperature while H2S is a gas, despite sulfur being heavier?"),
        ]
    },
    # 12. Troubleshooting: TLC Spot Tailing
    {
        "concept_id": "trouble_tlc_streaking_tailing",
        "domain": ChemistryDomain.ANALYTICAL_CHEMISTRY,
        "subdomain": "troubleshooting",
        "answer": "Thin-layer chromatography (TLC) spot streaking or tailing occurs when a polar compound strongly interacts with acidic silanol (Si-OH) sites on the silica gel plate, or when the sample is overloaded. For carboxylic acids, adding 1% acetic acid to the mobile phase suppresses tailing by protonating silanol groups and keeping the acid unionized. For basic amines, adding 1% triethylamine (TEA) or ammonium hydroxide prevents tailing by neutralizing acidic silica sites.",
        "reasoning": "TROUBLESHOOTING LOGIC:\n"
        "1. Symptom: Eluted spot appears as an elongated streak rather than a sharp, discrete spot.\n"
        "2. Underlying causes:\n"
        "   - Cause A (Sample overloading): Exceeding the linear adsorption isotherm capacity of the adsorbent.\n"
        "   - Cause B (Acid-base ionization equilibrium): Carboxylic acids or amines exist as partial ions that migrate at different rates than neutral molecules.\n"
        "   - Cause C (Silanol hydrogen bonding): Bare silanol groups on silica act as strong hydrogen-bond donors.\n"
        "3. Remedy Protocol:\n"
        "   - Dilute the sample 5-10 fold.\n"
        "   - Add 0.5-1% AcOH for acidic analytes (e.g. Hexanes/EtOAc/AcOH 70:30:1).\n"
        "   - Add 0.5-1% Et3N for basic amines (e.g. DCM/MeOH/Et3N 90:10:1).",
        "variations": [
            ("trouble_tlc_tail_1", "Why do carboxylic acid or amine spots streak/tail on silica TLC plates, and how do you fix it?"),
            ("trouble_tlc_tail_2", "How do you troubleshoot and eliminate tailing in thin-layer chromatography?"),
        ]
    },
]


def generate_qa_records() -> List[ChemNovaRecord]:
    """Generate structured records for questions, answers, and variations."""
    records = []
    source = "ChemNova Educational Chemistry Corpus & IUPAC Compendium"
    license_str = "CC0"

    for item in QA_DATA:
        cid = item["concept_id"]
        dom = item["domain"]
        sub = item["subdomain"]
        ans = item["answer"]
        rsn = item["reasoning"]

        all_vars = [q_text for _, q_text in item["variations"]]
        for var_id, question_text in item["variations"]:
            rec = ChemNovaRecord(
                id=var_id,
                type=DatasetType.CHEMISTRY_QA if "hypo" not in var_id else DatasetType.HYPOTHETICAL_CHEMISTRY_QUESTIONS,
                domain=dom,
                subdomain=sub,
                question=question_text,
                answer=ans,
                reasoning=rsn,
                context=f"Concept Identifier: {cid}\nDomain: {dom.value} ({sub})",
                provenance={
                    "concept_id": cid,
                    "all_variations": all_vars,
                    "source_type": "chemnova_educational",
                },
                source=source,
                source_url="https://chemnova.ai/corpus",
                license=license_str,
                confidence=1.0,
                verified=True,
            )
            records.append(rec)

    return records
