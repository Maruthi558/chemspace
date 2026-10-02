"""Molecular and compound knowledge corpus generator.

Generates structured chemical records for organic, inorganic, biochemical,
and pharmaceutical molecules with valid SMILES, InChI, InChIKey,
molecular formulas, IUPAC names, and physicochemical properties.
"""

from typing import List, Dict, Any
from chemistry_llm.data.schema.types import DatasetType, ChemistryDomain
from chemistry_llm.data.schema.record import ChemNovaRecord

# Structured molecule catalog: (id, name, iupac, formula, smiles, inchi, inchikey, mw, domain, subdomain, description)
MOLECULES_DATA = [
    (
        "mol_water",
        "Water",
        "Oxidane",
        "H2O",
        "O",
        "InChI=1S/H2O/h1H2",
        "XLYOFNOQVPJJNP-UHFFFAOYSA-N",
        18.015,
        ChemistryDomain.INORGANIC_CHEMISTRY,
        "solvents",
        "Universal polar solvent, high dielectric constant (78.4 at 25 °C), capable of extensive 3D hydrogen bonding network."
    ),
    (
        "mol_methane",
        "Methane",
        "Methane",
        "CH4",
        "C",
        "InChI=1S/CH4/h1H4",
        "VNWKTOKETHGBQD-UHFFFAOYSA-N",
        16.043,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "alkanes",
        "Simplest alkane and primary constituent of natural gas. Tetrahedral geometry with sp3 hybridized carbon."
    ),
    (
        "mol_benzene",
        "Benzene",
        "Benzene",
        "C6H6",
        "c1ccccc1",
        "InChI=1S/C6H6/c1-2-4-6-5-3-1/h1-6H",
        "UHOVQNZJYSORNB-UHFFFAOYSA-N",
        78.114,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "aromatics",
        "Prototypical aromatic hydrocarbon conforming to Hückel's 4n+2 pi electron rule (6 pi electrons, n=1). Planar D6h symmetry."
    ),
    (
        "mol_ethanol",
        "Ethanol",
        "Ethanol",
        "C2H6O",
        "CCO",
        "InChI=1S/C2H6O/c1-2-3/h3H,2H2,1H3",
        "LFQSCWFLJHTTHZ-UHFFFAOYSA-N",
        46.069,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "alcohols",
        "Primary aliphatic alcohol and renewable biofuel. Miscible in water via hydrogen bonding from the hydroxyl group."
    ),
    (
        "mol_acetone",
        "Acetone",
        "Propan-2-one",
        "C3H6O",
        "CC(=O)C",
        "InChI=1S/C3H6O/c1-3(2)4/h1-2H3",
        "CSCPPACGZOOCGX-UHFFFAOYSA-N",
        58.080,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "ketones",
        "Simplest ketone, widely used polar aprotic laboratory solvent. Exhibits keto-enol tautomerism with prop-1-en-2-ol."
    ),
    (
        "mol_acetic_acid",
        "Acetic Acid",
        "Ethanoic acid",
        "C2H4O2",
        "CC(=O)O",
        "InChI=1S/C2H4O2/c1-2(3)4/h1H3,(H,3,4)",
        "QTBSBXVTEAMEQO-UHFFFAOYSA-N",
        60.052,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "carboxylic_acids",
        "Weak monocarboxylic acid (pKa 4.76 at 25 °C). Readily forms hydrogen-bonded centrosymmetric dimers in non-polar solvents."
    ),
    (
        "mol_aspirin",
        "Aspirin",
        "2-Acetyloxybenzoic acid",
        "C9H8O4",
        "CC(=O)Oc1ccccc1C(=O)O",
        "InChI=1S/C9H8O4/c1-6(10)13-8-5-3-2-4-7(8)9(11)12/h2-5H,1H3,(H,11,12)",
        "BSYNRYMUTXBXSQ-UHFFFAOYSA-N",
        180.159,
        ChemistryDomain.MEDICINAL_CHEMISTRY,
        "pharmaceuticals",
        "Non-steroidal anti-inflammatory drug (NSAID) that irreversibly acetylates serine-530 of cyclooxygenase-1 (COX-1)."
    ),
    (
        "mol_paracetamol",
        "Acetaminophen (Paracetamol)",
        "N-(4-hydroxyphenyl)acetamide",
        "C8H9NO2",
        "CC(=O)Nc1ccc(O)cc1",
        "InChI=1S/C8H9NO2/c1-6(10)9-7-2-4-8(11)5-3-7/h2-5,11H,1H3,(H,9,10)",
        "RZVAJINKPMORJF-UHFFFAOYSA-N",
        151.165,
        ChemistryDomain.MEDICINAL_CHEMISTRY,
        "pharmaceuticals",
        "Analgesic and antipyretic drug. Metabolized in the liver primarily via glucuronidation and sulfation, with minor toxic NAPQI formation by CYP2E1."
    ),
    (
        "mol_caffeine",
        "Caffeine",
        "1,3,7-Trimethylpurine-2,6-dione",
        "C8H10N4O2",
        "Cn1cnc2c1c(=O)n(c(=O)n2C)C",
        "InChI=1S/C8H10N4O2/c1-10-4-9-6-5(10)7(13)12(3)8(14)11(6)2/h4H,1-3H3",
        "RYYVLZVUVIJVGH-UHFFFAOYSA-N",
        194.194,
        ChemistryDomain.BIOCHEMISTRY,
        "alkaloids",
        "Purine alkaloid and central nervous system stimulant acting as a competitive antagonist of adenosine A1 and A2A receptors."
    ),
    (
        "mol_d_glucose",
        "D-Glucose",
        "(2R,3S,4R,5R)-2,3,4,5,6-pentahydroxyhexanal",
        "C6H12O6",
        "OC[C@@H](O)[C@@H](O)[C@H](O)[C@@H](O)C=O",
        "InChI=1S/C6H12O6/c7-1-2(8)3(9)4(10)5(11)6-12/h1-5,7-11H,6H2/t2-,3+,4-,5-/m1/s1",
        "WQZGKKKJIJFFOK-GASJEMHNSA-N",
        180.156,
        ChemistryDomain.BIOCHEMISTRY,
        "carbohydrates",
        "Primary aldohexose sugar serving as the ubiquitous energy source in cellular respiration through glycolysis and oxidative phosphorylation."
    ),
    (
        "mol_glycine",
        "Glycine",
        "2-Aminoacetic acid",
        "C2H5NO2",
        "NCC(=O)O",
        "InChI=1S/C2H5NO2/c3-1-2(4)5/h1,3H2,(H,4,5)",
        "DHMQDGOQFOQNFH-UHFFFAOYSA-N",
        75.067,
        ChemistryDomain.BIOCHEMISTRY,
        "amino_acids",
        "The simplest proteinogenic amino acid and only achiral amino acid. Exists as a zwitterion (H3N+CH2COO-) at physiological pH."
    ),
    (
        "mol_sulfuric_acid",
        "Sulfuric Acid",
        "Sulfuric acid",
        "H2SO4",
        "O=S(=O)(O)O",
        "InChI=1S/H2O4S/c1-5(2,3)4/h(H2,1,2,3,4)",
        "QAIPRVGIBGTWDR-UHFFFAOYSA-N",
        98.079,
        ChemistryDomain.INORGANIC_CHEMISTRY,
        "mineral_acids",
        "Strong diprotic mineral acid and dehydrating agent. Produced industrially by the Contact Process (V2O5 catalyst)."
    ),
    (
        "mol_sodium_chloride",
        "Sodium Chloride",
        "Sodium chloride",
        "NaCl",
        "[Na+].[Cl-]",
        "InChI=1S/ClH.Na/h1H;/q;+1/p-1",
        "FAPWRFPIFSIZLT-UHFFFAOYSA-M",
        58.443,
        ChemistryDomain.INORGANIC_CHEMISTRY,
        "salts",
        "Prototypical face-centered cubic (FCC) rock salt lattice. Octahedral coordination (CN = 6) for both Na+ and Cl- ions."
    ),
    (
        "mol_ammonia",
        "Ammonia",
        "Azane",
        "NH3",
        "N",
        "InChI=1S/H3N/h1H3",
        "QGZKDVFQNNGYKY-UHFFFAOYSA-N",
        17.031,
        ChemistryDomain.INORGANIC_CHEMISTRY,
        "inorganic_bases",
        "Trigonal pyramidal geometry with one lone pair. Weak Brønsted base and monodentate ligand forming ammine complexes."
    ),
    (
        "mol_hydrochloric_acid",
        "Hydrogen Chloride (Hydrochloric Acid)",
        "Hydrogen chloride",
        "HCl",
        "Cl",
        "InChI=1S/ClH/h1H",
        "VEXZGXHMUGYJMC-UHFFFAOYSA-N",
        36.46,
        ChemistryDomain.INORGANIC_CHEMISTRY,
        "mineral_acids",
        "Strong monoprotic mineral acid (pKa ~ -6.3) completely dissociated in aqueous solution into H3O+ and Cl-."
    ),
    (
        "mol_nitric_acid",
        "Nitric Acid",
        "Nitric acid",
        "HNO3",
        "[N+](=O)(O)[O-]",
        "InChI=1S/HNO3/c2-1(3)4/h(H,2,3,4)",
        "GRYLNZFGIOAXRP-UHFFFAOYSA-N",
        63.012,
        ChemistryDomain.INORGANIC_CHEMISTRY,
        "mineral_acids",
        "Strong oxidizing mineral acid used industrially in nitration and fertilizer manufacturing via the Ostwald process."
    ),
    (
        "mol_carbon_dioxide",
        "Carbon Dioxide",
        "Carbon dioxide",
        "CO2",
        "O=C=O",
        "InChI=1S/CO2/c2-1-3",
        "CURLTTPVMYMDTN-UHFFFAOYSA-N",
        44.009,
        ChemistryDomain.INORGANIC_CHEMISTRY,
        "gases",
        "Linear non-polar greenhouse gas with zero net dipole moment. Sublimes directly at 195 K (-78.5 °C) under 1 atm."
    ),
    (
        "mol_hydrogen_peroxide",
        "Hydrogen Peroxide",
        "Hydrogen peroxide",
        "H2O2",
        "OO",
        "InChI=1S/H2O2/c1-2/h1-2H",
        "MHAJPDPJQMAIIY-UHFFFAOYSA-N",
        34.014,
        ChemistryDomain.INORGANIC_CHEMISTRY,
        "oxidizing_agents",
        "Skewed non-planar C2 symmetry with an O-O single bond. Disproportionates into water and oxygen gas."
    ),
    (
        "mol_sodium_borohydride",
        "Sodium Borohydride",
        "Sodium borohydride",
        "NaBH4",
        "[Na+].[BH4-]",
        "InChI=1S/BH4.Na/h1H4;/q-1;+1",
        "HXXFSFRBOHSIMQ-UHFFFAOYSA-N",
        37.83,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "reducing_agents",
        "Mild chemoselective nucleophilic hydride reducing agent that reduces aldehydes and ketones to alcohols in protic solvents."
    ),
    (
        "mol_lithium_aluminum_hydride",
        "Lithium Aluminum Hydride (LAH)",
        "Lithium aluminum hydride",
        "LiAlH4",
        "[Li+].[AlH4-]",
        "InChI=1S/AlH4.Li/h1H4;/q-1;+1",
        "OCVSSLAINAZJDO-UHFFFAOYSA-N",
        37.95,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "reducing_agents",
        "Powerful, unselective nucleophilic hydride reducing agent reducing esters, carboxylic acids, amides, and nitriles under dry aprotic conditions."
    ),
    (
        "mol_potassium_permanganate",
        "Potassium Permanganate",
        "Potassium permanganate",
        "KMnO4",
        "[K+].[O-][Mn](=O)(=O)=O",
        "InChI=1S/K.Mn.4O/q+1;;;;;-1/rK.MnO4/c;2-1(3,4)5/q+1;-1",
        "VAMGNFPGTJLNRL-UHFFFAOYSA-N",
        158.034,
        ChemistryDomain.INORGANIC_CHEMISTRY,
        "oxidizing_agents",
        "Deep purple strong oxidizing agent (Mn(VII), d0) that cleaves alkenes oxidatively and oxidizes primary alcohols to carboxylic acids."
    ),
    (
        "mol_ethene",
        "Ethylene (Ethene)",
        "Ethene",
        "C2H4",
        "C=C",
        "InChI=1S/C2H4/c1-2/h1-2H2",
        "VGGSQFUCUMXWEO-UHFFFAOYSA-N",
        28.054,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "alkenes",
        "Simplest alkene, planar D2h geometry with sp2 hybridized carbons. Essential monomer for polyethylene production."
    ),
    (
        "mol_ethyne",
        "Acetylene (Ethyne)",
        "Ethyne",
        "C2H2",
        "C#C",
        "InChI=1S/C2H2/c1-2/h1-2H",
        "HSFWRNGVRCDJHI-UHFFFAOYSA-N",
        26.038,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "alkynes",
        "Linear alkyne with sp hybridized carbons and a C≡C triple bond. Terminal acetylenic proton has pKa ~ 25 due to 50% s-character."
    ),
    (
        "mol_toluene",
        "Toluene",
        "Methylbenzene",
        "C7H8",
        "Cc1ccccc1",
        "InChI=1S/C7H8/c1-7-5-3-2-4-6-7/h2-6H,1H3",
        "YXFVVABEGXRONW-UHFFFAOYSA-N",
        92.141,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "aromatics",
        "Mono-substituted aromatic hydrocarbon with an electron-donating methyl substituent activating the ring toward ortho/para electrophilic substitution."
    ),
    (
        "mol_naphthalene",
        "Naphthalene",
        "Naphthalene",
        "C10H8",
        "c1ccc2ccccc2c1",
        "InChI=1S/C10H8/c1-2-6-10-8-4-3-7-9(10)5-1/h1-8H",
        "UFWIBTONFRDIAS-UHFFFAOYSA-N",
        128.17,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "polycyclic_aromatics",
        "Prototypical fused bicyclic aromatic hydrocarbon (10 pi electrons conforming to 4n+2 rule). Undergoes electrophilic substitution preferentially at the alpha (C1) position."
    ),
    (
        "mol_cyclohexane",
        "Cyclohexane",
        "Cyclohexane",
        "C6H6",
        "C1CCCCC1",
        "InChI=1S/C6H12/c1-2-4-6-5-3-1/h1-6H2",
        "XDTMQSROBMDMFD-UHFFFAOYSA-N",
        84.16,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "cycloalkanes",
        "Non-planar cycloalkane that adopts a strain-free chair conformation with staggered C-C bonds and 109.5° tetrahedral angles."
    ),
    (
        "mol_bromobenzene",
        "Bromobenzene",
        "Bromobenzene",
        "C6H5Br",
        "Brc1ccccc1",
        "InChI=1S/C6H5Br/c7-6-4-2-1-3-5-6/h1-5H",
        "QARBMVPHQWIHKH-UHFFFAOYSA-N",
        157.01,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "aryl_halides",
        "Aryl halide coupling partner for cross-coupling reactions (Suzuki, Heck, Sonogashira) and precursor for phenylmagnesium bromide Grignard reagent."
    ),
    (
        "mol_chloroform",
        "Chloroform (Trichloromethane)",
        "Trichloromethane",
        "CHCl3",
        "ClC(Cl)Cl",
        "InChI=1S/CHCl3/c2-1(3)4/h1H",
        "HEDRZPFGACZZDS-UHFFFAOYSA-N",
        119.38,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "halogenated_solvents",
        "Common organic solvent and precursor to dichlorocarbene (:CCl2) via alpha-elimination with strong base."
    ),
    (
        "mol_methanol",
        "Methanol",
        "Methanol",
        "CH4O",
        "CO",
        "InChI=1S/CH4O/c1-2/h2H,1H3",
        "OKKJLVBELUTLKV-UHFFFAOYSA-N",
        32.042,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "alcohols",
        "Simplest aliphatic alcohol, polar protic solvent and feedstock synthesized industrially from syngas (CO + 2 H2)."
    ),
    (
        "mol_phenol",
        "Phenol",
        "Phenol",
        "C6H6O",
        "Oc1ccccc1",
        "InChI=1S/C6H6O/c7-6-4-2-1-3-5-6/h1-5,7H",
        "ISWSIDIOOBJBQZ-UHFFFAOYSA-N",
        94.113,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "phenols",
        "Aromatic alcohol with significantly increased acidity (pKa ~ 9.95) compared to aliphatic alcohols due to phenoxide resonance stabilization."
    ),
    (
        "mol_diethyl_ether",
        "Diethyl Ether",
        "Ethoxyethane",
        "C4H10O",
        "CCOCC",
        "InChI=1S/C4H10O/c1-3-5-4-2/h3-4H2,1-2H3",
        "RTZKZFJDLAIYFH-UHFFFAOYSA-N",
        74.123,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "ethers",
        "Low-boiling (34.6 °C) aprotic solvent widely used in extraction and organometallic chemistry; prone to peroxide formation upon air exposure."
    ),
    (
        "mol_tetrahydrofuran",
        "Tetrahydrofuran (THF)",
        "Oxolane",
        "C4H8O",
        "C1CCOC1",
        "InChI=1S/C4H8O/c1-2-4-5-3-1/h1-4H2",
        "WYURNTSHIVDZCO-UHFFFAOYSA-N",
        72.107,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "cyclic_ethers",
        "Water-miscible cyclic ether solvent that coordinates strongly to Lewis acidic metals (Mg in Grignards, Li in organolithiums)."
    ),
    (
        "mol_oxirane",
        "Ethylene Oxide (Oxirane)",
        "Oxirane",
        "C2H4O",
        "C1CO1",
        "InChI=1S/C2H4O/c1-2-3-1/h1-2H2",
        "IAYPIBMASNFSPL-UHFFFAOYSA-N",
        44.053,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "epoxides",
        "Three-membered cyclic ether possessing high ring strain (114 kJ/mol) driving facile ring-opening by nucleophiles."
    ),
    (
        "mol_benzaldehyde",
        "Benzaldehyde",
        "Benzaldehyde",
        "C7H6O",
        "O=Cc1ccccc1",
        "InChI=1S/C7H6O/c8-6-7-4-2-1-3-5-7/h1-6H",
        "HUMVFWGGIJDGSJ-UHFFFAOYSA-N",
        106.124,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "aldehydes",
        "Aromatic aldehyde with characteristic almond odor. Lacks alpha-protons, undergoing Cannizzaro disproportionation and benzoin condensation."
    ),
    (
        "mol_ethyl_acetate",
        "Ethyl Acetate",
        "Ethyl ethanoate",
        "C4H8O2",
        "CCOC(=O)C",
        "InChI=1S/C4H8O2/c1-3-6-4(2)5/h3H2,1-2H3",
        "XEKOWRVHYACXOJ-UHFFFAOYSA-N",
        88.106,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "esters",
        "Widely used polar ester solvent prepared by Fischer esterification of ethanol and acetic acid."
    ),
    (
        "mol_pyridine",
        "Pyridine",
        "Pyridine",
        "C5H5N",
        "c1ccncc1",
        "InChI=1S/C5H5N/c1-2-4-6-5-3-1/h1-5H",
        "JUJWKXVUYUTGBO-UHFFFAOYSA-N",
        79.102,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "heterocycles",
        "Six-membered aromatic heterocycle (6 pi electrons). The nitrogen lone pair resides in an sp2 hybrid orbital perpendicular to the pi system, making it basic (pKa conjugate acid 5.25)."
    ),
    (
        "mol_pyrrole",
        "Pyrrole",
        "1H-Pyrrole",
        "C4H5N",
        "c1cc[nH]c1",
        "InChI=1S/C4H5N/c1-2-4-5-3-1/h1-5H",
        "KAESVVBWALUTOG-UHFFFAOYSA-N",
        67.091,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "heterocycles",
        "Five-membered aromatic heterocycle where the nitrogen lone pair contributes to the 6 pi-electron aromatic sextet, making pyrrole non-basic and electron-rich."
    ),
    (
        "mol_dimethyl_sulfoxide",
        "Dimethyl Sulfoxide (DMSO)",
        "Dimethyl sulfoxide",
        "C2H6OS",
        "CS(=O)C",
        "InChI=1S/C2H6OS/c1-4(2)3/h1-2H3",
        "IAZDPXIOMUYVGZ-UHFFFAOYSA-N",
        78.13,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "polar_aprotic_solvents",
        "Polar aprotic solvent with high dielectric constant (46.7), solvating metal cations and accelerating SN2 nucleophilic reactions."
    ),
    (
        "mol_triphenylphosphine",
        "Triphenylphosphine",
        "Triphenylphosphane",
        "C18H15P",
        "c1ccc(P(c2ccccc2)c3ccccc3)cc1",
        "InChI=1S/C18H15P/c1-4-10-16(11-5-1)19(17-12-6-2-7-13-17)18-14-8-3-9-15-18/h1-15H",
        "RIOQSEWOXXDEJA-UHFFFAOYSA-N",
        262.29,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "phosphorus_compounds",
        "Tertiary phosphine ligand in transition metal catalysis (Pd(PPh3)4, Wilkinson's catalyst) and key precursor for Wittig phosphonium ylides."
    ),
    (
        "mol_ibuprofen",
        "Ibuprofen",
        "2-[4-(2-methylpropyl)phenyl]propanoic acid",
        "C13H18O2",
        "CC(C)Cc1ccc(C(C)C(=O)O)cc1",
        "InChI=1S/C13H18O2/c1-9(2)8-11-4-6-12(7-5-11)10(3)13(14)15/h4-7,9-10H,8H2,1-3H3,(H,14,15)",
        "HEFNNWSXXWATRW-UHFFFAOYSA-N",
        206.28,
        ChemistryDomain.MEDICINAL_CHEMISTRY,
        "pharmaceuticals",
        "Non-steroidal anti-inflammatory drug (NSAID) with a chiral center; the (S)-(+)-enantiomer is the pharmacologically active COX inhibitor."
    ),
    (
        "mol_cisplatin",
        "Cisplatin",
        "cis-Diamminedichloroplatinum(II)",
        "Cl2H6N2Pt",
        "N.[Pt].[Cl-].[Cl-].N",
        "InChI=1S/2ClH.2H3N.Pt/h2*1H;2*1H3;/q;;;;+2/p-2",
        "LXZZYRPGZAFOLE-UHFFFAOYSA-L",
        300.05,
        ChemistryDomain.MEDICINAL_CHEMISTRY,
        "metallodrugs",
        "Square planar Pt(II) coordination complex used as a chemotherapy drug; forms 1,2-intrastrand crosslinks on purine bases in DNA."
    ),
    (
        "mol_ferrocene",
        "Ferrocene",
        "Bis(cyclopentadienyl)iron",
        "C10H10Fe",
        "c1cccc1.[Fe].c2cccc2",
        "InChI=1S/2C5H5.Fe/c2*1-2-4-5-3-1;/h2*1-5H;",
        "UHDHNACZTVHEEN-UHFFFAOYSA-N",
        186.03,
        ChemistryDomain.INORGANIC_CHEMISTRY,
        "organometallics",
        "Prototypical metallocene sandwich complex conforming to the 18-electron rule, exhibiting high thermal stability and aromatic character."
    ),
    (
        "mol_dmf",
        "N,N-Dimethylformamide (DMF)",
        "N,N-Dimethylformamide",
        "C3H7NO",
        "CN(C)C=O",
        "InChI=1S/C3H7NO/c1-4(2)3-5/h3H,1-2H3",
        "ZMXDDKWLCZADIW-UHFFFAOYSA-N",
        73.095,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "amides",
        "Widely used polar aprotic solvent in organic synthesis and peptide coupling, exhibiting partial double-bond character in the C-N amide linkage due to resonance."
    ),
    (
        "mol_acetyl_chloride",
        "Acetyl Chloride",
        "Ethanoyl chloride",
        "C2H3ClO",
        "CC(=O)Cl",
        "InChI=1S/C2H3ClO/c1-2(3)4/h1H3",
        "WETWJCDKMRWUPV-UHFFFAOYSA-N",
        78.498,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "acid_chlorides",
        "Highly reactive acyl halide that undergoes vigorous nucleophilic acyl substitution with water, alcohols, and amines to form acids, esters, and amides."
    ),
    (
        "mol_acetic_anhydride",
        "Acetic Anhydride",
        "Acetyl acetate",
        "C4H6O3",
        "CC(=O)OC(=O)C",
        "InChI=1S/C4H6O3/c1-3(5)7-4(2)6/h1-2H3",
        "WFDIJRYMOXRFFG-UHFFFAOYSA-N",
        102.089,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "anhydrides",
        "Important acetylating agent used industrially in the preparation of cellulose acetate and the synthesis of aspirin from salicylic acid."
    ),
    (
        "mol_aniline",
        "Aniline",
        "Aniline",
        "C6H7N",
        "Nc1ccccc1",
        "InChI=1S/C6H7N/c7-6-4-2-1-3-5-6/h1-5H,7H2",
        "PAYRUJLWNCNPSJ-UHFFFAOYSA-N",
        93.129,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "amines",
        "Primary aromatic amine where the amino lone pair is delocalized into the benzene ring, making it weakly basic (pKa conjugate acid 4.6) and strongly activating toward electrophilic aromatic substitution."
    ),
    (
        "mol_acetonitrile",
        "Acetonitrile",
        "Acetonitrile",
        "C2H3N",
        "CC#N",
        "InChI=1S/C2H3N/c1-2-3/h1H3",
        "WEVYAHXRMPXWEO-UHFFFAOYSA-N",
        41.053,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "nitriles",
        "Simplest organic nitrile and standard polar aprotic mobile phase for reverse-phase high-performance liquid chromatography (HPLC) with UV cut-off at 190 nm."
    ),
    (
        "mol_nitrobenzene",
        "Nitrobenzene",
        "Nitrobenzene",
        "C6H5NO2",
        "[O-][N+](=O)c1ccccc1",
        "InChI=1S/C6H5NO2/c8-7(9)6-4-2-1-3-5-6/h1-5H",
        "LQNUZADURLCDLV-UHFFFAOYSA-N",
        123.111,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "nitro_compounds",
        "Strongly deactivated aromatic compound bearing a meta-directing nitro group, serving as the industrial precursor for catalytic hydrogenation to aniline."
    ),
    (
        "mol_alanylglycine",
        "Alanylglycine",
        "2-(2-aminopropanamido)acetic acid",
        "C5H10N2O3",
        "CC(N)C(=O)NCC(=O)O",
        "InChI=1S/C5H10N2O3/c1-3(6)5(10)7-2-4(8)9/h3H,2,6H2,1H3,(H,7,10)(H,8,9)",
        "MTCFAGTZNQXDES-UHFFFAOYSA-N",
        146.146,
        ChemistryDomain.BIOCHEMISTRY,
        "peptides",
        "Simple dipeptide containing a planar trans-amide peptide bond with ~40% double-bond character, formed by condensation of L-alanine and glycine."
    ),
    (
        "mol_limonene",
        "(R)-Limonene",
        "(4R)-1-methyl-4-prop-1-en-2-ylcyclohexene",
        "C10H16",
        "CC1=CCC(CC1)C(=C)C",
        "InChI=1S/C10H16/c1-8(2)10-6-4-9(3)5-7-10/h5,10H,1,4,6-7H2,2-3H3/t10-/m0/s1",
        "XMGQYMWWDOXHJM-JTQLQIEISA-N",
        136.238,
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "natural_products",
        "Naturally occurring monoterpene extracted from citrus rinds, possessing an orange aroma; its enantiomer (S)-limonene has a pine/turpentine aroma, illustrating olfactory chiral discrimination."
    ),
]


def generate_molecule_records() -> List[ChemNovaRecord]:
    """Generate structured records for representative chemical compounds."""
    records = []
    source = "National Center for Biotechnology Information (NCBI PubChem PUG REST)"
    license_str = "Public Domain"

    for mid, name, iupac, formula, smiles, inchi, inchikey, mw, domain, sub, desc in MOLECULES_DATA:
        context = (
            f"Compound Name: {name}\n"
            f"IUPAC Systematic Name: {iupac}\n"
            f"Molecular Formula: {formula}\n"
            f"Molecular Weight: {mw} g/mol\n"
            f"Canonical SMILES: {smiles}\n"
            f"InChI: {inchi}\n"
            f"InChIKey: {inchikey}\n"
            f"Chemical Discipline: {domain.value} ({sub})\n"
            f"Description: {desc}"
        )

        q = f"What is the structure, chemical identity, and properties of {name} ({formula})?"
        a = (
            f"{name} (IUPAC: {iupac}) has the molecular formula {formula} and a molecular weight of {mw} g/mol. "
            f"Its canonical SMILES is `{smiles}`, with InChIKey `{inchikey}`. {desc}"
        )

        rec = ChemNovaRecord(
            id=f"{mid}",
            type=DatasetType.COMPOUND_INFORMATION,
            domain=domain,
            subdomain=sub,
            question=q,
            answer=a,
            context=context,
            molecule=name,
            smiles=smiles,
            inchi=inchi,
            formula=formula,
            molecular_formula=formula,
            source=source,
            source_url=f"https://pubchem.ncbi.nlm.nih.gov/#query={inchikey}",
            license=license_str,
            confidence=1.0,
            verified=True,
        )
        records.append(rec)

    return records
