"""Curated Chemistry Knowledge Base of Verified Scientific Documents."""

from typing import List
from chemistry_llm.rag.documents.schema import Document

CURATED_CHEMISTRY_DOCUMENTS: List[Document] = [
    # ------------------------------------------------------------------------
    # 1. Molecular Properties & Fundamental Substances
    # ------------------------------------------------------------------------
    Document(
        title="Ethanol - Physicochemical Properties and Spectroscopy",
        content=(
            "Molecule: Ethanol (Ethyl alcohol)\n"
            "SMILES: CCO\n"
            "Molecular Formula: C2H6O\n"
            "Molecular Weight: 46.069 g/mol\n"
            "Boiling Point: 78.37 °C | Melting Point: -114.1 °C\n"
            "Density: 0.789 g/cm³ at 20 °C\n"
            "LogP: -0.14 (Lipophilic/Hydrophilic balanced, fully miscible with water)\n"
            "Functional Group: Primary aliphatic alcohol (-OH)\n"
            "Spectroscopy:\n"
            "- IR: Diagnostic broad strong O-H stretch at 3200-3600 cm⁻¹ (intermolecular hydrogen bonding), "
            "sp³ C-H stretch at 2850-2960 cm⁻¹, and C-O single bond stretch at 1050-1085 cm⁻¹.\n"
            "- ¹H NMR (CDCl3): δ 1.22 ppm (3H, triplet, -CH3), δ 3.68 ppm (2H, quartet, -CH2-), δ 2.6 ppm (1H, broad singlet, -OH).\n"
            "- Mass Spectrometry: Molecular ion peak [M]+ at m/z = 46, base peak at m/z = 31 (CH2=OH+ cleavage fragment)."
        ),
        source="CRC Handbook of Chemistry and Physics / NIST Chemistry WebBook",
        source_url="https://webbook.nist.gov/chemistry/name-ser/?Name=ethanol",
        domain="organic_chemistry",
        subdomain="alcohols",
        molecule="Ethanol",
        smiles="CCO",
        verification_status="verified",
        confidence=1.0,
    ),
    Document(
        title="Benzene - Structure, Aromaticity, and Resonance",
        content=(
            "Molecule: Benzene\n"
            "SMILES: c1ccccc1\n"
            "Molecular Formula: C6H6\n"
            "Molecular Weight: 78.114 g/mol\n"
            "Boiling Point: 80.1 °C | Melting Point: 5.5 °C\n"
            "Aromaticity: Hückel's Rule (4n + 2) π electrons where n = 1 (6 delocalized π electrons in a planar ring).\n"
            "Resonance Energy: Approximately 36 kcal/mol (150 kJ/mol) stabilization energy.\n"
            "Spectroscopy:\n"
            "- IR: Sharp aromatic C-H stretching at 3030-3100 cm⁻¹, ring C=C breathing modes at 1475-1600 cm⁻¹, "
            "and out-of-plane aromatic bend at 675 cm⁻¹.\n"
            "- ¹H NMR: Single sharp singlet at δ 7.36 ppm due to strong aromatic ring current diamagnetic anisotropy.\n"
            "- ¹³C NMR: Single resonance at δ 128.4 ppm.\n"
            "- UV-Vis: Distinctive benzenoid absorption band at λmax = 254 nm (π -> π* transition)."
        ),
        source="March's Advanced Organic Chemistry / PubChem CID 241",
        source_url="https://pubchem.ncbi.nlm.nih.gov/compound/241",
        domain="organic_chemistry",
        subdomain="aromatics",
        molecule="Benzene",
        smiles="c1ccccc1",
        verification_status="verified",
        confidence=1.0,
    ),
    Document(
        title="Aspirin (Acetylsalicylic Acid) - Synthesis and Pharmacokinetics",
        content=(
            "Molecule: Acetylsalicylic acid (Aspirin)\n"
            "SMILES: CC(=O)Oc1ccccc1C(=O)O\n"
            "Molecular Formula: C9H8O4\n"
            "Molecular Weight: 180.158 g/mol\n"
            "Melting Point: 135 °C\n"
            "Mechanism of Action: Irreversible acetylation of cyclooxygenase enzymes (COX-1 and COX-2), "
            "inhibiting prostaglandin and thromboxane A2 biosynthesis.\n"
            "Synthesis: Esterification of salicylic acid (2-hydroxybenzoic acid) with acetic anhydride "
            "in the presence of an acid catalyst (phosphoric acid or sulfuric acid).\n"
            "Spectroscopy:\n"
            "- IR: Ester carbonyl C=O stretch at 1750 cm⁻¹, carboxylic acid carbonyl at 1685 cm⁻¹, "
            "and extremely broad carboxylic O-H stretching band from 2500-3300 cm⁻¹."
        ),
        source="Goodman & Gilman's Pharmacological Basis of Therapeutics",
        source_url="https://pubchem.ncbi.nlm.nih.gov/compound/2244",
        domain="medicinal_chemistry",
        subdomain="analgesics",
        molecule="Aspirin",
        smiles="CC(=O)Oc1ccccc1C(=O)O",
        verification_status="verified",
        confidence=1.0,
    ),
    # ------------------------------------------------------------------------
    # 2. Organic Reactions & Mechanisms
    # ------------------------------------------------------------------------
    Document(
        title="Diels-Alder Cycloaddition [4+2] Reaction",
        content=(
            "Reaction: Diels-Alder Cycloaddition\n"
            "Class: Pericyclic [4+2] concerted cycloaddition\n"
            "Participants: A conjugated diene (4 π electrons, must achieve s-cis conformation) "
            "and a dienophile (2 π electrons, typically substituted with electron-withdrawing groups like C=O or CN).\n"
            "Mechanism: Concerted single-step reaction passing through an aromatic 6-electron transition state. "
            "Forms two new carbon-carbon σ bonds and one new π bond simultaneously.\n"
            "Stereospecificity: Stereospecific suprafacial-suprafacial addition; cis/trans geometry of dienophile is preserved.\n"
            "Endo Rule: Secondary orbital overlap between diene and dienophile activating group stabilizes the endo transition state, "
            "favoring the endo isomer as the kinetic product.\n"
            "Nobel Prize: Awarded to Otto Diels and Kurt Alder in 1950."
        ),
        source="Strategic Applications of Named Reactions in Organic Synthesis",
        domain="organic_chemistry",
        subdomain="pericyclic_reactions",
        reaction="Diels-Alder [4+2] Cycloaddition",
        verification_status="verified",
        confidence=1.0,
    ),
    Document(
        title="Grignard Reaction - Organomagnesium Halides in Carbon-Carbon Bond Formation",
        content=(
            "Reaction: Grignard Carbonyl Addition\n"
            "Reagent: Organomagnesium halide (R-Mg-X, where X = Cl, Br, I), prepared from alkyl/aryl halides and magnesium metal in anhydrous ether or THF.\n"
            "Mechanism: The carbon attached to magnesium possesses partial carbanionic character (Rδ- — Mgδ+X). "
            "The nucleophilic carbon attacks the electrophilic carbonyl carbon of an aldehyde, ketone, or ester, "
            "forming a tetrahedral magnesium alkoxide intermediate. Acidic aqueous workup yields the corresponding alcohol.\n"
            "Transformations:\n"
            "- Formaldehyde + R-Mg-X -> Primary alcohol (R-CH2-OH)\n"
            "- Other aldehydes + R-Mg-X -> Secondary alcohol (R-CH(OH)-R')\n"
            "- Ketones + R-Mg-X -> Tertiary alcohol (R-C(OH)(R')(R''))\n"
            "Incompatible functional groups: Protic hydrogens (water, alcohols, amines, terminal alkynes), which quench the reagent to alkane (R-H)."
        ),
        source="Vogel's Textbook of Practical Organic Chemistry / Nobel Prize 1912 (Victor Grignard)",
        domain="organic_chemistry",
        subdomain="organometallics",
        reaction="Grignard Reaction",
        verification_status="verified",
        confidence=1.0,
    ),
    Document(
        title="Fischer Esterification - Acid-Catalyzed Condensation",
        content=(
            "Reaction: Fischer Esterification\n"
            "Reactants: Carboxylic acid (R-COOH) + Alcohol (R'-OH) in the presence of strong acid catalyst (conc. H2SO4 or TsOH).\n"
            "Products: Ester (R-COOR') + Water (H2O).\n"
            "Mechanism Steps:\n"
            "1. Protonation of the carbonyl oxygen increases electrophilicity of carbonyl carbon.\n"
            "2. Nucleophilic attack of alcohol oxygen onto the carbonyl carbon forming a tetrahedral intermediate.\n"
            "3. Proton transfer from alcohol oxygen to a hydroxyl group converting it into a good leaving group (-OH2+).\n"
            "4. Elimination of water molecule and reformation of C=O π bond.\n"
            "5. Deprotonation regenerating the acid catalyst.\n"
            "Equilibrium: Fully reversible; equilibrium is driven forward toward product by using excess alcohol or removing water via a Dean-Stark trap."
        ),
        source="Organic Chemistry by Clayden, Greeves, Warren",
        domain="organic_chemistry",
        subdomain="carbonyl_condensation",
        reaction="Fischer Esterification",
        verification_status="verified",
        confidence=1.0,
    ),
    # ------------------------------------------------------------------------
    # 3. Physical Chemistry, Thermodynamics & Kinetics
    # ------------------------------------------------------------------------
    Document(
        title="Gibbs Free Energy and Chemical Equilibrium Thermodynamics",
        content=(
            "Topic: Chemical Thermodynamics & Spontaneity\n"
            "Equation: ΔG = ΔH - TΔS\n"
            "where ΔG is Gibbs free energy change, ΔH is enthalpy change, T is absolute temperature (Kelvin), and ΔS is entropy change.\n"
            "Spontaneity Criteria at Constant T and P:\n"
            "- ΔG < 0: Exergonic, thermodynamically spontaneous in the forward direction.\n"
            "- ΔG = 0: Chemical system is at dynamic equilibrium.\n"
            "- ΔG > 0: Endergonic, non-spontaneous in the forward direction (spontaneous in reverse).\n"
            "Relationship with Equilibrium Constant (Keq):\n"
            "ΔG° = -R * T * ln(Keq), where R = 8.314 J/(mol·K).\n"
            "When Keq > 1, ΔG° < 0 (products favored at equilibrium).\n"
            "When Keq < 1, ΔG° > 0 (reactants favored at equilibrium).\n"
            "Temperature Dependence: Governed by the Van 't Hoff equation: d(ln K)/dT = ΔH° / (R * T²)."
        ),
        source="Atkins' Physical Chemistry (11th Edition)",
        domain="physical_chemistry",
        subdomain="thermodynamics",
        verification_status="verified",
        confidence=1.0,
    ),
    Document(
        title="Arrhenius Equation and Chemical Reaction Kinetics",
        content=(
            "Topic: Reaction Rates and Activation Energy\n"
            "Arrhenius Equation: k = A * exp(-Ea / (R * T))\n"
            "where k is reaction rate constant, A is pre-exponential frequency factor, Ea is activation energy (J/mol), "
            "R = 8.314 J/(mol·K) is gas constant, and T is temperature in Kelvin.\n"
            "Linear Form: ln(k) = ln(A) - (Ea / R) * (1 / T).\n"
            "Plotting ln(k) versus (1/T) yields a straight line with slope = -Ea/R and y-intercept = ln(A).\n"
            "Rule of Thumb: For many biological and organic reactions near room temperature (~300 K), "
            "a 10 °C temperature increase roughly doubles the reaction rate (Q10 coefficient ~ 2)."
        ),
        source="Levine's Physical Chemistry / IUPAC Gold Book",
        domain="physical_chemistry",
        subdomain="kinetics",
        verification_status="verified",
        confidence=1.0,
    ),
    # ------------------------------------------------------------------------
    # 4. Spectroscopy Reference Tables
    # ------------------------------------------------------------------------
    Document(
        title="Comprehensive Infrared (IR) Absorption Spectroscopy Diagnostic Table",
        content=(
            "Technique: Infrared (IR) Vibrational Spectroscopy\n"
            "Units: Wavenumber (cm⁻¹)\n"
            "Diagnostic Functional Group Regions:\n"
            "- 3200 - 3600 cm⁻¹ (broad): Hydrogen-bonded Alcohol and Phenol O-H stretch.\n"
            "- 3300 - 3500 cm⁻¹ (medium, sharp 1 or 2 peaks): Primary (two peaks) or secondary (one peak) Amine N-H stretch.\n"
            "- 3300 cm⁻¹ (sharp): Terminal alkyne ≡C-H stretch.\n"
            "- 3000 - 3100 cm⁻¹ (medium): Aromatic and Alkene =C-H stretch (sp² hybridized).\n"
            "- 2850 - 2960 cm⁻¹ (strong): Aliphatic Alkane C-H stretch (sp³ hybridized).\n"
            "- 2500 - 3300 cm⁻¹ (extremely broad): Carboxylic acid O-H stretch (overlaps C-H region).\n"
            "- 2200 - 2260 cm⁻¹: Nitrile (-C≡N) and internal alkyne (-C≡C-) stretch.\n"
            "- 1650 - 1750 cm⁻¹ (strong, sharp): Carbonyl C=O stretch:\n"
            "  * Esters: 1735 - 1750 cm⁻¹\n"
            "  * Aldehydes: 1720 - 1740 cm⁻¹ (with Fermi doublet C-H at 2720 & 2820 cm⁻¹)\n"
            "  * Ketones: 1705 - 1725 cm⁻¹\n"
            "  * Carboxylic acids: 1700 - 1720 cm⁻¹\n"
            "  * Amides: 1640 - 1690 cm⁻¹\n"
            "- 1450 - 1600 cm⁻¹: Aromatic ring C=C breathing vibrations."
        ),
        source="Silverstein's Spectrometric Identification of Organic Compounds",
        domain="analytical_chemistry",
        subdomain="spectroscopy",
        verification_status="verified",
        confidence=1.0,
    ),
    # ------------------------------------------------------------------------
    # 5. Inorganic, Quantum, and Coordination Chemistry
    # ------------------------------------------------------------------------
    Document(
        title="Crystal Field Theory and d-Orbital Splitting in Coordination Complexes",
        content=(
            "Topic: Inorganic Coordination Chemistry & Crystal Field Theory (CFT)\n"
            "Principles: Describes electrostatic interaction between transition metal cation d-orbitals "
            "and electron-pair donor ligands modeled as point negative charges.\n"
            "Octahedral Complexes: Degenerate five d-orbitals split into two energy levels separated by crystal field splitting energy Δo (10 Dq):\n"
            "- Lower energy t2g set (dxy, dyz, dxz): Orbitals point between ligand axes, minimizing electron repulsion.\n"
            "- Higher energy eg set (dx²-y², dz²): Orbitals point directly along x, y, z axes towards ligands, maximizing repulsion.\n"
            "Spectrochemical Series (Ligand field strength increasing -> larger Δo):\n"
            "I⁻ < Br⁻ < S²⁻ < SCN⁻ < Cl⁻ < F⁻ < OH⁻ < C2O4²⁻ < H2O < NCS⁻ < NH3 < en < bipy < NO2⁻ < PPh3 < CN⁻ < CO.\n"
            "High Spin vs Low Spin: Strong-field ligands (e.g. CN⁻, CO) produce large Δo exceeding electron pairing energy (P), "
            "forcing electrons to pair in t2g (low spin, diamagnetic or reduced paramagnetism)."
        ),
        source="Miessler & Tarr's Inorganic Chemistry (5th Edition)",
        domain="inorganic_chemistry",
        subdomain="coordination_chemistry",
        verification_status="verified",
        confidence=1.0,
    ),
    # ------------------------------------------------------------------------
    # 6. Laboratory Safety & GHS Standards
    # ------------------------------------------------------------------------
    Document(
        title="Chemical Laboratory Safety, GHS Hazard Pictograms, and Waste Disposal",
        content=(
            "Topic: Chemical Laboratory Safety and Hazard Management\n"
            "Standard: Globally Harmonized System of Classification and Labelling of Chemicals (GHS)\n"
            "Key Hazard Classes and Protocols:\n"
            "1. Flammable Liquids (Flash point < 60 °C): Ether, Acetone, Hexane. Keep away from heat, sparks, open flames. "
            "Store in dedicated NFPA fire-resistant safety cabinets.\n"
            "2. Corrosives: Concentrated acids (HCl, H2SO4, HNO3) and bases (NaOH, KOH). Always add acid to water (AAA rule) "
            "to safely dissipate heat of hydration. Wear neoprene or nitrile gloves, splash goggles, and face shield.\n"
            "3. Toxic and Carcinogens: Benzene, Chloroform, Formaldehyde. Work exclusively inside certified chemical fume hoods "
            "with face velocity > 100 fpm.\n"
            "4. Pyrophoric Reagents: t-Butyllithium, Triethylaluminum, white phosphorus. Spontaneously ignite in air; "
            "must be handled under inert atmosphere (Ar or N2) using Schlenk techniques or gloveboxes.\n"
            "5. Hazardous Waste Segregation: Never mix halogenated and non-halogenated organic solvents. "
            "Neutralize dilute acids/bases before heavy metal precipitation."
        ),
        source="OSHA Chemical Hygiene Standard / Prudent Practices in the Laboratory (NRC)",
        domain="safety",
        subdomain="laboratory_practices",
        verification_status="verified",
        confidence=1.0,
    ),
]


def load_curated_knowledge_base() -> List[Document]:
    """Return all curated chemistry reference documents."""
    return CURATED_CHEMISTRY_DOCUMENTS
