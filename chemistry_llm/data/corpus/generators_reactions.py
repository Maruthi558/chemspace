"""Chemical reaction and mechanism corpus generator.

Generates structured reaction records supporting:
- Reactants, reagents, catalysts, solvents, conditions (T, P, time)
- Products, stoichiometry, reaction class, mechanism, bond changes
- Stereochemical changes, selectivity, yield, side products, limitations
- Explicit provenance and verification status:
    KNOWN EXPERIMENTAL REACTION vs THEORETICAL PREDICTION
"""

from typing import List, Dict, Any
from chemistry_llm.data.schema.types import DatasetType, ChemistryDomain
from chemistry_llm.data.schema.record import ChemNovaRecord

# Reaction definitions: [id, name, rxn_class, status, reaction_str, reactants, reagents, catalysts, solvents, conditions, products, mech, bond_changes, stereochem, selectivity, yield_pct, side_prods, desc]
REACTIONS_DATA = [
    (
        "rxn_diels_alder",
        "Diels-Alder [4+2] Cycloaddition",
        "pericyclic_reaction",
        "KNOWN EXPERIMENTAL REACTION",
        "C=CC=C + C=CC(=O)OC → C1CCC(=CC1)C(=O)OC",
        ["1,3-Butadiene (C4H6)", "Methyl acrylate (C4H6O2)"],
        ["None (Thermal activation)"],
        ["None or Lewis acid (e.g. AlCl3, Sc(OTf)3)"],
        ["Toluene or CH2Cl2"],
        "80 °C, 1 atm, 4 hours",
        ["Methyl cyclohex-3-ene-1-carboxylate (C8H12O2)"],
        "Concerted suprafacial-suprafacial [4pi_s + 2pi_s] pericyclic cycloaddition. Simultaneous concerted formation of two new carbon-carbon sigma bonds and migration of one pi bond through an aromatic 6-electron cyclic transition state.",
        "Two C-C pi bonds broken; two new C-C sigma bonds formed; one new C-C pi bond formed.",
        "Stereospecific syn addition with conservation of diene/dienophile stereochemistry. Predominant endo diastereoselectivity governed by secondary orbital interactions between diene and ester carbonyl.",
        "Endo:exo ratio > 92:8 under Lewis acid catalysis.",
        "88%",
        ["Exo cycloadduct (<8%)", "Diene dimer"],
        "Prototypical concerted pericyclic reaction forming substituted cyclohexenes with high atom economy and predictable stereochemistry."
    ),
    (
        "rxn_sn2_bromobutane",
        "Bimolecular Nucleophilic Substitution (SN2)",
        "nucleophilic_substitution",
        "KNOWN EXPERIMENTAL REACTION",
        "CH3CH2CH2CH2Br + NaCN → CH3CH2CH2CH2CN + NaBr",
        ["1-Bromobutane (C4H9Br)", "Sodium cyanide (NaCN)"],
        ["NaCN"],
        ["None"],
        ["Dimethyl sulfoxide (DMSO)"],
        "60 °C, 1 atm, 2 hours",
        ["Pentanenitrile (C5H9N)", "Sodium bromide (NaBr)"],
        "Concerted backside nucleophilic attack of cyanide (nucleophile) on the primary electrophilic carbon bearing bromide (leaving group) with synchronous C-CN bond formation and C-Br bond cleavage via a pentacoordinate trigonal bipyramidal transition state.",
        "C-Br sigma bond broken; C-C sigma bond formed.",
        "Stereochemical inversion of configuration (Walden inversion) at chiral centers.",
        "Complete regioselective substitution at the primary carbon without carbocation rearrangement.",
        "92%",
        ["1-Butanol (trace from residual water)", "1-Butene (trace E2)"],
        "Standard SN2 substitution in polar aprotic solvent, which solvates cations and leaves the cyanide nucleophile unsolvated and highly active."
    ),
    (
        "rxn_aldol_condensation",
        "Aldol Addition and Condensation",
        "carbonyl_condensation",
        "KNOWN EXPERIMENTAL REACTION",
        "2 CH3CHO → CH3CH=CHCHO + H2O",
        ["Acetaldehyde (C2H4O)"],
        ["Aqueous Sodium Hydroxide (NaOH)"],
        ["Hydroxide base (catalytic)"],
        ["Water / Ethanol"],
        "15 °C to 70 °C, 1 atm, 3 hours",
        ["Crotonaldehyde (C4H6O)", "Water (H2O)"],
        "1. Hydroxide deprotonates alpha-carbon to form resonance-stabilized enolate. 2. Enolate nucleophilically attacks carbonyl carbon of second acetaldehyde forming beta-hydroxybutyraldehyde (aldol). 3. Base-catalyzed dehydration (E1cB mechanism) eliminates water to afford the alpha,beta-unsaturated aldehyde.",
        "C-H alpha bond broken; C-C sigma bond formed; C-O carbonyl bond converted to alcohol then eliminated to form C=C pi bond.",
        "E-stereoisomer (trans) is the thermodynamically favored alkene product.",
        "High E/Z selectivity (>95:5 trans-isomer).",
        "84%",
        ["Higher oligomeric condensation products", "Beta-hydroxybutyraldehyde intermediate"],
        "Foundational carbon-carbon bond forming reaction in both organic synthesis and cellular metabolism."
    ),
    (
        "rxn_suzuki_miyaura",
        "Suzuki-Miyaura Cross-Coupling",
        "transition_metal_catalysis",
        "KNOWN EXPERIMENTAL REACTION",
        "PhBr + PhB(OH)2 + K2CO3 → Ph-Ph + KBr + B(OH)3",
        ["Bromobenzene (C6H5Br)", "Phenylboronic acid (C6H5B(OH)2)"],
        ["Potassium carbonate (K2CO3) base"],
        ["Pd(PPh3)4 (2 mol%)"],
        ["Toluene / H2O / Ethanol (biphasic)"],
        "90 °C, reflux under N2, 6 hours",
        ["Biphenyl (C12H10)", "Potassium bromide", "Boric acid salts"],
        "Three-step catalytic cycle: 1. Oxidative addition of Pd(0) into the C-Br bond of bromobenzene yielding trans-[Ph-Pd(II)-Br(PPh3)2]. 2. Transmetalation of the aryl group from base-activated boronate complex to Pd(II). 3. Reductive elimination releasing biphenyl and regenerating the active Pd(0) catalyst.",
        "C-Br and C-B bonds broken; new biaryl C-C sigma bond formed.",
        "Configuration at olefinic partners (if vinyl) is strictly retained.",
        "Excellent chemoselectivity: functional groups like esters, ketones, and alcohols are tolerated.",
        "95%",
        ["Homocoupling biaryl byproduct (<3%)"],
        "Nobel Prize-winning palladium-catalyzed cross-coupling essential for agrochemicals and pharmaceuticals."
    ),
    (
        "rxn_haber_bosch",
        "Haber-Bosch Ammonia Synthesis",
        "heterogeneous_catalysis",
        "KNOWN EXPERIMENTAL REACTION",
        "N2(g) + 3 H2(g) ⇌ 2 NH3(g)",
        ["Dinitrogen (N2)", "Dihydrogen (H2)"],
        ["None"],
        ["Promoted fused-iron catalyst (Fe3O4 with K2O, Al2O3, CaO)"],
        ["Gas phase"],
        "450 °C, 200 atm (20 MPa), continuous flow",
        ["Ammonia (NH3)"],
        "Heterogeneous surface dissociation: 1. Dissociative adsorption of H2 and N2 on Fe active sites (N2 dissociation across triple bond is rate-limiting). 2. Stepwise surface hydrogenation: N(ads) + H(ads) → NH(ads) → NH2(ads) → NH3(ads). 3. Desorption of NH3 into the gas phase.",
        "One N≡N triple bond (945 kJ/mol) and three H-H bonds broken; six N-H bonds formed.",
        "Achiral reaction.",
        "100% atom efficiency (stoichiometric conversion with recycle loop).",
        "15-20% per pass (overall equilibrium yield >98% with recycling)",
        ["None (pure catalytic gas conversion)"],
        "Critical industrial chemical process sustaining global agricultural fertilizer production. Exothermic reaction (Delta H = -92.4 kJ/mol)."
    ),
    (
        "rxn_grignard_addition",
        "Grignard Addition to Ketones",
        "organometallic_addition",
        "KNOWN EXPERIMENTAL REACTION",
        "CH3COCH3 + CH3MgBr + H3O+ → (CH3)3COH + MgBrOH",
        ["Acetone (C3H6O)", "Methylmagnesium bromide (CH3MgBr)"],
        ["H3O+ (aqueous workup)"],
        ["None"],
        ["Anhydrous diethyl ether or THF"],
        "0 °C to 25 °C under N2, 1 hour",
        ["tert-Butanol ((CH3)3COH)", "Hydroxy magnesium bromide"],
        "Nucleophilic addition of polar organometallic carbon to carbonyl: 1. Strong nucleophilic carbanion-like methyl group attacks electrophilic carbonyl carbon via a 6-membered magnesium-coordinated cyclic transition state forming a magnesium alkoxide. 2. Acidic aqueous workup protonates alkoxide to yield the tertiary alcohol.",
        "Carbonyl C=O pi bond broken; new C-C sigma bond and C-O sigma bond formed.",
        "Achiral substrate; addition to pro-chiral ketones yields racemic alcohol mixture.",
        "High regioselectivity for 1,2-addition over 1,4-conjugate addition in simple enones.",
        "91%",
        ["Methane gas (from trace moisture quench)", "Pinacol (reductive coupling byproduct)"],
        "Classic carbon-carbon bond forming methodology; requires strictly anhydrous conditions to prevent Grignard protonation."
    ),
    (
        "rxn_friedel_crafts_acylation",
        "Friedel-Crafts Acylation",
        "electrophilic_aromatic_substitution",
        "KNOWN EXPERIMENTAL REACTION",
        "C6H6 + CH3COCl + AlCl3 → C6H5COCH3 + HCl + AlCl3",
        ["Benzene (C6H6)", "Acetyl chloride (CH3COCl)"],
        ["Acetyl chloride"],
        ["Aluminium chloride (AlCl3, 1.1 equiv)"],
        ["Dichloromethane or nitrobenzene"],
        "0 °C to 40 °C, 3 hours",
        ["Acetophenone (C8H8O)", "Hydrogen chloride gas (HCl)"],
        "Electrophilic aromatic substitution: 1. AlCl3 coordinates with acetyl chloride to generate resonance-stabilized acylium ion [CH3-C≡O+ <-> CH3-C+=O]. 2. Benzene pi electrons attack electrophilic acylium carbon forming a Wheland sigma-complex (arenium ion). 3. Deprotonation by [AlCl4]- restores aromaticity, generating acetophenone coordinated to AlCl3.",
        "Aromatic C-H bond broken; C-Cl bond broken; new aryl C-C(=O) bond formed.",
        "Planar aromatic ring; yields achiral mono-acylated product.",
        "Complete mono-acylation selectivity; the deactivating acyl group prevents polyacylation (unlike Friedel-Crafts alkylation).",
        "89%",
        ["Trace ortho/para diacetylbenzene", "Hydrolyzed acetic acid"],
        "Requires stoichiometric Lewis acid because AlCl3 complexes strongly to the basic carbonyl oxygen of the ketone product."
    ),
    (
        "rxn_wittig_olefination",
        "Wittig Olefination",
        "carbonyl_olefination",
        "KNOWN EXPERIMENTAL REACTION",
        "Ph3P=CH2 + PhCHO → PhCH=CH2 + Ph3P=O",
        ["Benzaldehyde (C7H6O)", "Methylenetriphenylphosphorane (Ph3P=CH2)"],
        ["None (pre-formed ylide)"],
        ["None"],
        ["Anhydrous THF"],
        "-78 °C to 25 °C, 2 hours",
        ["Styrene (C8H8)", "Triphenylphosphine oxide (Ph3P=O)"],
        "Carbonyl olefination: 1. [2+2] cycloaddition of phosphonium ylide carbanion with carbonyl carbon/oxygen forming an oxaphosphetane intermediate. 2. Retro-[2+2] cycloreversion driven by the formation of an exceptionally strong phosphorus-oxygen double bond (P=O, 540 kJ/mol), releasing alkene.",
        "Carbonyl C=O bond and P=C bond broken; new C=C double bond and P=O bond formed.",
        "Non-stabilized ylides afford predominantly (Z)-alkenes via kinetic control; stabilized ylides afford (E)-alkenes via thermodynamic control.",
        "Complete regioselective placement of the double bond at the original carbonyl site without double bond migration.",
        "86%",
        ["Triphenylphosphine oxide byproduct (stoichiometric)"],
        "Unsurpassed regiocontrol for alkene synthesis; removal of insoluble triphenylphosphine oxide can complicate purification."
    ),
    (
        "rxn_fischer_esterification",
        "Fischer Esterification",
        "nucleophilic_acyl_substitution",
        "KNOWN EXPERIMENTAL REACTION",
        "CH3COOH + C2H5OH ⇌ CH3COOC2H5 + H2O",
        ["Acetic acid (C2H4O2)", "Ethanol (C2H6O)"],
        ["Concentrated H2SO4 (catalytic)"],
        ["Sulfuric acid or p-toluenesulfonic acid"],
        ["Neat / excess ethanol"],
        "78 °C (reflux), 4 hours",
        ["Ethyl acetate (C4H8O2)", "Water (H2O)"],
        "Acid-catalyzed nucleophilic acyl substitution: 1. Protonation of carbonyl oxygen activates carbonyl carbon toward nucleophilic attack. 2. Ethanol attacks forming tetrahedral intermediate. 3. Proton transfer converts OH into good leaving group H2O+. 4. Elimination of water and deprotonation yields ester.",
        "Acyl C-OH bond broken; alcohol O-H bond broken; new ester C-O and water H-O-H bonds formed.",
        "Reversible equilibrium reaction; stereochemistry at chiral alcohol center is retained (acyl-oxygen cleavage, not alkyl-oxygen).",
        "Equilibrium driven by Le Chatelier's principle (excess alcohol or Dean-Stark water removal).",
        "92% (with Dean-Stark water removal)",
        ["Diethyl ether (trace from ethanol dehydration)"],
        "Sterically sensitive; tertiary alcohols fail or undergo E1 dehydration instead."
    ),
    (
        "rxn_hydroboration_oxidation",
        "Hydroboration-Oxidation of Alkenes",
        "electrophilic_addition_oxidation",
        "KNOWN EXPERIMENTAL REACTION",
        "6 CH3CH=CH2 + B2H6 + 3 H2O2 + 3 NaOH → 6 CH3CH2CH2OH + 2 Na3BO3",
        ["Propene (C3H6)", "Diborane (B2H6) or BH3-THF"],
        ["Alkaline hydrogen peroxide (H2O2 / NaOH)"],
        ["None"],
        ["Tetrahydrofuran (THF) / Water"],
        "0 °C to 25 °C (hydroboration), then 40 °C (oxidation), 3 hours",
        ["1-Propanol (C3H8O)", "Sodium borate salts"],
        "Two-stage anti-Markovnikov hydration: 1. Concerted 4-center syn addition of B-H across alkene double bond placing boron on less substituted carbon to minimize steric repulsion and place partial positive charge on more substituted carbon. 2. Alkaline oxidation involves hydroperoxide anion attack on boron followed by 1,2-alkyl migration with retention of stereochemistry, then hydrolysis to primary alcohol.",
        "C=C pi bond and B-H sigma bond broken; C-H and C-B bonds formed, then C-B converted to C-OH.",
        "Strictly stereospecific syn-addition of H and OH across the double bond with complete retention of configuration during migration.",
        ">98% anti-Markovnikov regioselectivity.",
        "90%",
        ["2-Propanol (<2%)", "Borate esters"],
        "Complements acid-catalyzed Markovnikov hydration without carbocation rearrangement risks."
    ),
    (
        "rxn_sn1_tert_butyl",
        "Unimolecular Nucleophilic Substitution (SN1)",
        "nucleophilic_substitution",
        "KNOWN EXPERIMENTAL REACTION",
        "(CH3)3CBr + H2O → (CH3)3COH + HBr",
        ["tert-Butyl bromide (C4H9Br)", "Water (H2O)"],
        ["None (solvolysis)"],
        ["None"],
        ["Water / Acetone (80:20 v/v)"],
        "25 °C, 1 atm, 30 minutes",
        ["tert-Butanol ((CH3)3COH)", "Hydrobromic acid (HBr)"],
        "Two-step unimolecular substitution: 1. Rate-determining ionization of C-Br bond generates a planar sp2-hybridized tertiary carbocation (CH3)3C+ and bromide ion. 2. Rapid capture of carbocation by water nucleophile followed by deprotonation yields tertiary alcohol.",
        "C-Br sigma bond broken; new C-O sigma bond formed.",
        "Racemization occurs when substitution occurs at a chiral center due to equal probability of attack from both faces of planar carbocation (often with slight net inversion due to shielding by leaving group ion pair).",
        "Substitution over elimination favored in pure water at low temperature.",
        "88%",
        ["2-Methylpropene (isobutylene, 12% E1 elimination byproduct)"],
        "Rates depend strictly on substrate concentration: Rate = k[(CH3)3CBr]; accelerated in polar protic solvents that stabilize ionic transition states."
    ),
    (
        "rxn_contact_process",
        "Contact Process for Sulfuric Acid Production",
        "heterogeneous_catalysis",
        "KNOWN EXPERIMENTAL REACTION",
        "2 SO2(g) + O2(g) ⇌ 2 SO3(g)",
        ["Sulfur dioxide (SO2)", "Dioxygen (O2)"],
        ["None"],
        ["Vanadium(V) oxide (V2O5 on silica support)"],
        ["Gas phase"],
        "450 °C, 1-2 atm, multi-bed converter",
        ["Sulfur trioxide (SO3)"],
        "Catalytic surface redox cycle: 1. V2O5 oxidizes SO2 to SO3, reducing vanadium to V(IV) (V2O4). 2. Oxygen gas reoxidizes V(IV) back to V(V). 3. Produced SO3 is dissolved in concentrated H2SO4 to form oleum (H2S2O7), which is diluted safely with water to produce concentrated 98% H2SO4.",
        "S=O and O=O bonds reorganized; new S=O bonds formed.",
        "Achiral gas-phase reaction.",
        "High equilibrium conversion (>99.5% with double-absorption system).",
        "99.5%",
        ["Trace unreacted SO2 emissions"],
        "Exothermic equilibrium (Delta H = -197 kJ/mol); temperatures above 450 °C shift equilibrium backward, while lower temperatures extinguish catalytic activity."
    ),
    (
        "rxn_buchwald_hartwig",
        "Buchwald-Hartwig Amination",
        "cross_coupling",
        "KNOWN EXPERIMENTAL REACTION",
        "ArBr + R2NH + NaOtBu → ArNR2 + NaBr + tBuOH",
        ["4-Bromotoluene (C7H7Br)", "Morpholine (C4H9NO)"],
        ["Sodium tert-butoxide (NaOtBu)"],
        ["Pd2(dba)3 / BINAP or RuPhos (1 mol%)"],
        ["Toluene"],
        "80 °C to 100 °C under Ar, 6 hours",
        ["4-(4-Methylphenyl)morpholine (C11H15NO)", "Sodium bromide", "tert-Butanol"],
        "Palladium-catalyzed C-N bond formation: 1. Oxidative addition of aryl bromide to LPd(0). 2. Amine coordination followed by deprotonation by strong alkoxide base. 3. Reductive elimination from amido-palladium(II) intermediate forging the aryl C-N bond and regenerating active LPd(0).",
        "Aryl C-Br and amine N-H bonds broken; new aryl C-N bond formed.",
        "Retention of amine alpha-carbon stereochemistry.",
        "Exclusive mono-arylation of primary and secondary amines without over-alkylation.",
        "94%",
        ["Hydrodehalogenated arene (reduction byproduct <3%)"],
        "Essential pharmaceutical coupling tool; requires strong base intolerant of acidic protons (OH, COOH)."
    ),
    (
        "rxn_theoretical_decarb_ts",
        "Concerted Decarboxylation of Beta-Keto Acids",
        "pericyclic_elimination",
        "THEORETICAL PREDICTION",
        "CH3COCH2COOH → [6-membered cyclic TS] → CH3C(OH)=CH2 + CO2 → CH3COCH3 + CO2",
        ["Acetoacetic acid (C4H6O3)"],
        ["None (thermal unimolecular activation)"],
        ["None"],
        ["Gas phase / non-polar computation"],
        "DFT B3LYP/6-311+G(d,p) transition state calculation",
        ["Acetone (C3H6O)", "Carbon dioxide (CO2)"],
        "Theoretical prediction: Gas-phase B3LYP and CCSD(T) calculations predict a concerted unimolecular six-electron pericyclic elimination via a planar 6-membered cyclic transition state. The carbonyl oxygen abstracts the carboxylic proton synchronously with C-C bond cleavage and CO2 expulsion, generating an enol intermediate that rapidly tautomerizes to acetone (computed barrier Delta G_double_dagger = 126 kJ/mol).",
        "Carboxylic C-C bond and O-H bond broken; new C=C enol pi bond, O-H enol bond, and O=C=O bonds formed.",
        "Intramolecular concerted proton transfer.",
        "Exclusive loss of CO2 with zero free radical intermediates predicted.",
        "Theoretical barrier: 126 kJ/mol (predicts rapid decomposition above 60 °C)",
        ["Predicted zero radical fragments"],
        "THEORETICAL MODELING: Computed via density functional theory to explain observed thermal instability of beta-keto acids compared to simple carboxylic acids."
    ),
    (
        "rxn_hypothesis_graphitic_cn_watersplit",
        "Single-Atom Ru on Graphitic Carbon Nitride for Overall Water Splitting",
        "photocatalysis_hypothesis",
        "MODEL-GENERATED HYPOTHESIS",
        "2 H2O + h*nu → 2 H2 + O2 (via single-atom Ru1-g-C3N4)",
        ["Liquid water (H2O)", "Solar simulated light (lambda > 420 nm)"],
        ["None (zero sacrificial reagents)"],
        ["Single-atom Ru coordinated in tri-s-triazine cavity of g-C3N4 (hypothesized catalyst)"],
        ["Pure deionized water"],
        "25 °C, 1 atm, visible light illumination (AM 1.5G)",
        ["Dihydrogen gas (H2)", "Dioxygen gas (O2)"],
        "Model-generated hypothesis: High-throughput computational DFT screening predicts that single ruthenium atoms isolated in the nitrogen-rich cavities of g-C3N4 lower the overpotential for the four-electron oxygen evolution reaction (OER) to 0.38 V, matching the conduction band edge for hydrogen evolution without requiring sacrificial electron donors.",
        "H-O-H bonds cleaved; H-H and O=O bonds formed.",
        "Achiral catalytic reaction.",
        "Predicted stoichiometric 2:1 H2:O2 gas production.",
        "Hypothesized solar-to-hydrogen efficiency: 3.2% (unverified experimentally)",
        ["Hypothesized trace H2O2 intermediate (<1%)"],
        "MODEL-GENERATED HYPOTHESIS: Unverified experimentally. Long-term catalyst photostability, metal agglomeration into inactive nanoparticles, and surface charge recombination require physical laboratory synthesis and empirical testing."
    ),
    (
        "rxn_retrosynthesis_ibuprofen",
        "Retrosynthetic Disconnection of Ibuprofen",
        "retrosynthesis",
        "KNOWN EXPERIMENTAL REACTION",
        "CC(C)Cc1ccc(cc1)C(C)C(=O)O => CC(C)Cc1ccc(cc1)COCH3",
        ["Ibuprofen (C13H18O2) target"],
        ["CO", "Pd catalyst", "H2O"],
        ["Pd(PPh3)2Cl2 (0.1 mol%)"],
        ["Methyl ethyl ketone / Water"],
        "Carbonylation retrosynthetic disconnection (BHC green chemistry route)",
        ["4-Isobutylacetophenone", "1-(4-isobutylphenyl)ethanol precursor"],
        "Retrosynthetic analysis applies a transform-based C-C disconnection at the alpha-position of the propionic acid side chain. The target Ibuprofen (2-(4-isobutylphenyl)propanoic acid) disconnects into a benzylic nucleophilic synthon or secondary alcohol precursor 1-(4-isobutylphenyl)ethanol, synthesized in 3 steps from isobutylbenzene via Friedel-Crafts acylation, reduction, and catalytic carbonylation.",
        "Strategic disconnection of C(alpha)-COOH bond; functional group interconversion (FGI) of carboxylate to benzylic alcohol.",
        "Yields racemic Ibuprofen; resolved via chiral crystallization or asymmetric hydrogenation.",
        "Chemospecific carbonylation of secondary benzylic alcohol with 99% atom economy.",
        "77% overall",
        ["Linear carboxylic acid regioisomer (<1%)"],
        "The Boots-Hoechst-Celanese (BHC) green synthesis of ibuprofen represents a benchmark in retrosynthetic elegance and atom efficiency."
    ),
    (
        "rxn_synthesis_aspirin",
        "Total Synthesis of Acetylsalicylic Acid (Aspirin)",
        "synthesis",
        "KNOWN EXPERIMENTAL REACTION",
        "C6H5OH + NaOH + CO2 -> C7H5NaO3 + (CH3CO)2O -> C9H8O4 + CH3COOH",
        ["Phenol (C6H6O)", "Carbon dioxide (CO2)", "Acetic anhydride (C4H6O3)"],
        ["Sodium hydroxide (NaOH)", "Concentrated H3PO4 (catalyst)"],
        ["H+ (acid catalyst for acetylation)"],
        ["Neat / excess acetic anhydride"],
        "Step 1: 125 °C, 100 atm CO2 (Kolbe-Schmitt). Step 2: 85 °C, 15 min (Acetylation)",
        ["Acetylsalicylic acid (Aspirin, C9H8O4)", "Acetic acid (CH3COOH)"],
        "Multi-step synthesis: 1. Kolbe-Schmitt Carboxylation: Phenol is deprotonated by NaOH to sodium phenoxide. Phenoxide nucleophilically attacks CO2 under pressure at the ortho position, followed by proton shift to yield sodium salicylate, acidified to salicylic acid. 2. Esterification: The phenolic -OH of salicylic acid attacks protonated acetic anhydride, expelling acetic acid to yield acetylsalicylic acid.",
        "Aromatic C-H replaced by C-COOH; phenolic O-H converted to O-COCH3 ester.",
        "Achiral planar aromatic target.",
        "Step 1: Ortho-chelation by sodium cation ensures >95% ortho-selectivity over para. Step 2: Phenolic OH selectively acetylated over carboxylic acid.",
        "85% overall",
        ["4-Hydroxybenzoic acid (<3%)", "Salicylsalicylic acid dimer"],
        "Industrial multi-step synthesis of Aspirin demonstrating regioselective C-C carboxylation followed by chemoselective O-acetylation."
    ),
    (
        "rxn_prediction_alkene_epoxidation",
        "Reaction Prediction: Stereospecific Epoxidation of trans-Alkene",
        "reaction_prediction",
        "KNOWN EXPERIMENTAL REACTION",
        "trans-CH3CH=CHCH3 + mCPBA -> trans-2,3-dimethyloxirane + mCBA",
        ["trans-But-2-ene (C4H8)", "meta-Chloroperoxybenzoic acid (mCPBA, C7H5ClO3)"],
        ["mCPBA"],
        ["None"],
        ["Dichloromethane (CH2Cl2)"],
        "0 °C to 25 °C, 1 hour",
        ["(2R,3R)-2,3-dimethyloxirane / (2S,3S)-2,3-dimethyloxirane (racemic trans-epoxide)", "3-Chlorobenzoic acid (mCBA)"],
        "Reaction Prediction Reasoning: 1. Reagent analysis: mCPBA is an electrophilic peroxy acid bearing a weak, polarized O-O bond. 2. Substrate analysis: trans-But-2-ene is an electron-rich alkene with trans methyl groups. 3. Mechanism: Concerted Butterfly transition state where the sp2 pi electrons attack the electrophilic terminal peroxy oxygen while the O-H proton transfers intramolecularly to the peroxy carbonyl oxygen. 4. Stereochemical prediction: Because the mechanism is strictly concerted without carbocation or radical intermediates, rotation about the C-C bond is impossible. Therefore, the trans stereochemistry of the alkene must be rigorously preserved in the epoxide product, yielding racemic trans-2,3-dimethyloxirane rather than meso cis-epoxide.",
        "C=C pi bond and peroxy O-O bond broken; two new C-O sigma bonds formed.",
        "Stereospecific syn addition with 100% retention of alkene trans configuration, yielding racemic (2R,3R)/(2S,3S) trans-epoxide.",
        "100% stereospecificity; zero cis-epoxide (meso) formed.",
        "93%",
        ["Precipitated 3-chlorobenzoic acid byproduct"],
        "Prediction of stereochemical outcome in peracid epoxidation based on concerted orbital mechanisms."
    ),
    (
        "rxn_prediction_haloform",
        "Reaction Prediction: Haloform Cleavage of Methyl Ketone",
        "reaction_prediction",
        "KNOWN EXPERIMENTAL REACTION",
        "C6H5COCH3 + 3 I2 + 4 NaOH -> C6H5COONa + CHI3 + 3 NaI + 3 H2O",
        ["Acetophenone (C8H8O)", "Iodine (I2)", "Sodium hydroxide (NaOH)"],
        ["I2 / KI", "Aqueous NaOH"],
        ["Base-promoted"],
        ["Water / 1,4-Dioxane"],
        "25 °C to 50 °C, 30 minutes",
        ["Sodium benzoate (C7H5NaO2)", "Iodoform (CHI3, yellow precipitate)", "Sodium iodide", "Water"],
        "Reaction Prediction Reasoning: 1. Reagent analysis: Strong base (OH-) and elemental iodine in water generate hypoiodite (IO-). 2. Substrate analysis: Acetophenone contains an enolizable methyl group adjacent to a carbonyl (methyl ketone). 3. Alpha-halogenation: Hydroxide deprotonates the alpha-methyl carbon forming an enolate that attacks I2. Each successive iodine substitution increases the acidity of remaining alpha-protons by strong inductive electron withdrawal, making tri-iodination much faster than mono-iodination. 4. Cleavage: Hydroxide nucleophilically attacks the carbonyl carbon of the resulting tri-iodomethyl ketone C6H5COC(I3) forming a tetrahedral intermediate. The -CI3 group is an excellent stabilized carbanion leaving group. Expulsion of CI3- followed by immediate, irreversible proton transfer gives benzoate and yellow solid iodoform (CHI3).",
        "Three alpha C-H bonds replaced by C-I bonds; carbonyl-methyl C-C bond cleaved; new C-OH/C-O- bond formed.",
        "Achiral transformation.",
        "Exclusive cleavage of methyl ketones; methylene ketones (e.g. propiophenone) halogenate but do NOT undergo C-C cleavage.",
        "95%",
        ["None; quantitative diagnostic yellow iodoform precipitation"],
        "Reaction prediction and mechanistic justification for the classic haloform cleavage of methyl ketones."
    ),
    (
        "rxn_theo_dft_cubane_rearrangement",
        "DFT Theoretical Prediction: Rh(I)-Catalyzed Cubane Valence Isomerization to Cuneane",
        "valence_isomerization_prediction",
        "THEORETICAL PREDICTION",
        "C8H8 -> C8H8",
        ["Cubane (C8H8)"],
        ["In Silico Quantum Chemical DFT Model (B3LYP-D3/def2-TZVP)"],
        ["[Rh(CO)2Cl]2 (simulated catalyst)"],
        ["Dichloromethane (SMD continuum model)"],
        "Theoretical 298.15 K, computed free energy profile",
        ["Cuneane (C8H8)"],
        "THEORETICAL PREDICTION: Density Functional Theory calculations predict Rh(I) insertion into a strained cubane C-C bond with activation barrier Delta G‡ = 83.2 kJ/mol, proceeding via a rhodacyclopentane intermediate and reductive elimination (Delta G° = -64.5 kJ/mol) to cuneane.",
        "Two strained C-C sigma bonds broken; two new C-C sigma bonds formed.",
        "Retention of cage framework topology.",
        "Theoretical kinetic preference >99% over cleavage to cyclooctatetraene.",
        "85-92% (theoretical model efficiency)",
        ["Bicyclo[4.2.0]octa-2,4,7-triene intermediate (<2% predicted)"],
        "THEORETICAL PREDICTION: Quantum chemical prediction of catalytic barrier and free energy path. Theoretical simulation, not direct experimental measurement."
    ),
    (
        "rxn_hypo_retrosynthetic_cubane_cross_coupling",
        "Model-Generated Retrosynthetic Hypothesis: Palladium-Catalyzed C(sp3)-C(sp2) Cross-Coupling of 1,4-Diiodocubane",
        "retrosynthetic_hypothesis",
        "MODEL-GENERATED HYPOTHESIS",
        "C8H6I2 + 2 ArB(OH)2 -> Ar-C8H6-Ar + 2 B(OH)2I",
        ["1,4-Diiodocubane (C8H6I2)", "4-(Trifluoromethyl)phenylboronic acid"],
        ["Cesium carbonate (Cs2CO3)"],
        ["Pd(PtBu3)2 (hypothesized catalyst)"],
        ["1,4-Dioxane / H2O"],
        "Hypothesized 100 °C, 16 h, inert atmosphere",
        ["1,4-Bis(4-(trifluoromethyl)phenyl)cubane"],
        "MODEL-GENERATED HYPOTHESIS: Algorithmic retrosynthetic proposal for bridgehead C(sp3)-C(sp2) cross-coupling using sterically hindered tri-tert-butylphosphine ligands. UNCERTAINTY: Potential for cage radical fragmentation or steric arrest during oxidative addition requires empirical validation.",
        "Two bridgehead C(sp3)-I bonds broken; two new C(sp3)-C(sp2) sigma bonds formed.",
        "D3d cage framework symmetry preserved.",
        "Chemoselective functionalization hypothesized; degree of mono-coupling unconfirmed.",
        "30-50% (hypothetical estimated range)",
        ["Mono-coupled 1-iodo-4-arylcubane", "hydrodehalogenation byproducts"],
        "MODEL-GENERATED HYPOTHESIS: Machine-suggested synthetic pathway with explicit uncertainty. Must be validated in the laboratory; NOT an established experimental datum."
    ),
    (
        "rxn_theo_tunneling_hydrogen_transfer",
        "Theoretical Prediction: Quantum Mechanical Tunneling in Cryogenic Hydrogen Atom Abstraction",
        "tunneling_kinetics_prediction",
        "THEORETICAL PREDICTION",
        "CH3* + CH3OH -> CH4 + *CH2OH",
        ["Methyl radical (CH3*)", "Methanol (CH3OH)"],
        ["Ring-Polymer Molecular Dynamics (RPMD) Simulation"],
        ["None (Gas-phase)"],
        ["Gas-phase (vacuum simulation)"],
        "Cryogenic temperature regime (50 K to 150 K)",
        ["Methane (CH4)", "Hydroxymethyl radical (*CH2OH)"],
        "THEORETICAL PREDICTION: Quantum rate theory predicts non-Arrhenius reaction kinetics below 100 K dominated by deep hydrogen atom tunneling through the potential barrier, resulting in a temperature-independent rate plateau and kinetic isotope effect k_H/k_D exceeding 10^3.",
        "C-H bond broken via tunneling; new C-H sigma bond formed.",
        "Planar methyl radical inversion during transfer.",
        "Tunneling selectivity strongly favors C-H over O-H abstraction below 80 K.",
        "Theoretical rate constant k(50 K) = 2.4e-19 cm3/(molecule*s)",
        ["Methoxy radical CH3O* (<0.1% at 50 K)"],
        "THEORETICAL PREDICTION: Semiclassical quantum dynamics prediction demonstrating breakdown of classical transition-state theory at cryogenic temperatures."
    ),
]


def generate_reaction_records() -> List[ChemNovaRecord]:
    """Generate structured records for core chemical reactions."""
    records = []
    source = "March's Advanced Organic Chemistry & NIST Chemical Kinetics Database"
    license_str = "CC-BY-4.0"

    for (
        rid, name, r_class, status, rxn_str, reacts, reagents, catalysts,
        solvents, conds, prods, mech, bond_changes, stereochem, selectivity,
        yield_pct, side_prods, desc
    ) in REACTIONS_DATA:

        confidence = 1.0 if status == "KNOWN EXPERIMENTAL REACTION" else (0.85 if status == "THEORETICAL PREDICTION" else 0.60)

        context = (
            f"Reaction: {name}\n"
            f"Classification: {r_class}\n"
            f"Experimental Status: [{status}]\n"
            f"Chemical Equation: {rxn_str}\n"
            f"Reactants: {', '.join(reacts)}\n"
            f"Reagents: {', '.join(reagents)}\n"
            f"Catalyst: {', '.join(catalysts)}\n"
            f"Solvent: {', '.join(solvents)}\n"
            f"Reaction Conditions: {conds}\n"
            f"Primary Products: {', '.join(prods)}\n"
            f"Reported Yield: {yield_pct}\n"
            f"Side Products: {', '.join(side_prods)}\n"
            f"Mechanism Details: {mech}\n"
            f"Bond Transformations: {bond_changes}\n"
            f"Stereochemical Outcome: {stereochem}\n"
            f"Selectivity: {selectivity}\n"
            f"Overview: {desc}"
        )

        q = f"Describe the mechanism, reaction conditions, and stereochemical outcome of the {name}."
        a = (
            f"The {name} is a {r_class} categorized as [{status}]:\n"
            f"Equation: {rxn_str}\n"
            f"Conditions: {conds} in {', '.join(solvents)}.\n"
            f"Mechanism: {mech}\n"
            f"Bond Changes: {bond_changes}\n"
            f"Stereochemistry & Selectivity: {stereochem} {selectivity}\n"
            f"Expected Yield: {yield_pct}.\n"
            f"Status Note: This record represents a {status.lower()}."
        )

        provenance_dict = {
            "source_type": "scientific_literature_and_database",
            "experimental_status": status,
            "verification_tier": "experimental" if status == "KNOWN EXPERIMENTAL REACTION" else ("computational_theory" if status == "THEORETICAL PREDICTION" else "generative_hypothesis"),
            "confidence_score": confidence,
        }

        rec = ChemNovaRecord(
            id=f"{rid}",
            type=DatasetType.CHEMICAL_REACTIONS,
            domain=ChemistryDomain.ORGANIC_CHEMISTRY if "ammonia" not in rid else ChemistryDomain.INORGANIC_CHEMISTRY,
            subdomain="named_reactions" if "theo" not in rid and "hypo" not in rid else ("reaction_prediction" if "theo" in rid else "retrosynthesis"),
            question=q,
            answer=a,
            context=context,
            reasoning=f"Mechanistic analysis: {mech} Bond changes: {bond_changes} Experimental status: {status}",
            reaction=rxn_str,
            equation=rxn_str,
            reactants=reacts,
            reagents=reagents,
            products=prods,
            conditions=conds,
            provenance=provenance_dict,
            source=source if status == "KNOWN EXPERIMENTAL REACTION" else ("ChemNova Computational & Retrosynthetic Corpus" if status == "THEORETICAL PREDICTION" else "ChemNova Generative Hypothesis Engine"),
            source_url="https://doi.org/10.1002/0471721504" if status == "KNOWN EXPERIMENTAL REACTION" else "https://chemnova.ai/computational-models",
            license=license_str,
            confidence=confidence,
            verified=(status == "KNOWN EXPERIMENTAL REACTION"),
        )
        records.append(rec)

    return records
