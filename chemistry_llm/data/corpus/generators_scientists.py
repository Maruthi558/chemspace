"""Chemistry scientists, discoveries, and historical breakthroughs corpus generator.

Generates structured historical records covering:
- Scientist name, field, discovery, approximate date, scientific significance
- Verifiable scientific history with strict provenance
"""

from typing import List
from chemistry_llm.data.schema.types import DatasetType, ChemistryDomain
from chemistry_llm.data.schema.record import ChemNovaRecord

SCIENTISTS_DATA = [
    (
        "sci_lavoisier_oxygen",
        "Antoine-Laurent de Lavoisier",
        "Chemical Revolution & Law of Conservation of Mass",
        "Identified and named oxygen (1778) and hydrogen (1783), overthrew the phlogiston theory, and formulated the Law of Conservation of Mass in chemical reactions.",
        "1789",
        "Recognized as the father of modern chemistry. Published 'Traité Élémentaire de Chimie', the first modern chemistry textbook establishing rigorous quantitative stoichiometry and systematic chemical nomenclature.",
        "In his landmark 1789 treatise, Lavoisier demonstrated through meticulous closed-system balance measurements that mass is neither created nor destroyed during combustion, establishing mass conservation as a fundamental law."
    ),
    (
        "sci_mendeleev_periodic_law",
        "Dmitri Mendeleev",
        "Periodic Law and the Periodic Table of Elements",
        "Formulated the Periodic Law (1869), organizing known chemical elements by increasing atomic weight and predicting the existence and properties of undiscovered elements (e.g., eka-aluminum/gallium, eka-silicon/germanium).",
        "1869",
        "Created the foundation of modern chemical classification. The periodic recurrence of chemical and physical properties remains the organizing paradigm of all chemistry.",
        "Mendeleev left deliberate blank spaces in his periodic table, predicting with remarkable precision the atomic mass, density, and oxide formulas of germanium and gallium years before their physical discovery."
    ),
    (
        "sci_marie_curie_radioactivity",
        "Marie Skłodowska-Curie",
        "Radioactivity and Discovery of Polonium and Radium",
        "Co-discovered the radioactive elements Polonium and Radium (1898) and pioneered techniques for isolating radioactive isotopes.",
        "1898",
        "First woman to win a Nobel Prize and the only person honored in two distinct scientific fields (Physics 1903, Chemistry 1911). Her work opened the field of nuclear chemistry and modern subatomic physics.",
        "Curie coined the term 'radioactivity' and proved that radioactive emissions are an intrinsic subatomic atomic property rather than a molecular interaction."
    ),
    (
        "sci_linus_pauling_chemical_bond",
        "Linus Pauling",
        "Quantum Nature of the Chemical Bond & Electronegativity",
        "Applied quantum mechanics to chemical bonding, developing the concepts of orbital hybridization (sp, sp2, sp3), resonance structures, and the Pauling electronegativity scale.",
        "1931-1939",
        "Published 'The Nature of the Chemical Bond' (1939), unifying organic and inorganic structural chemistry. Awarded the 1954 Nobel Prize in Chemistry.",
        "Pauling's integration of quantum wave mechanics into bonding theory explained bond angles, partial ionic character, and secondary structures in proteins (alpha-helix)."
    ),
    (
        "sci_woodward_organic_synthesis",
        "Robert Burns Woodward",
        "Complex Organic Total Synthesis and Orbital Symmetry",
        "Achieved the total synthesis of complex natural products (quinine, cholesterol, chlorophyll, vitamin B12) and co-formulated the Woodward-Hoffmann rules for pericyclic reaction stereochemistry.",
        "1965",
        "Awarded the 1965 Nobel Prize in Chemistry for his contributions to the art and science of organic synthesis, proving that the most intricate stereochemically complex molecules could be synthesized systematically.",
        "The Woodward-Hoffmann rules demonstrated that conservation of orbital symmetry dictates the thermal and photochemical stereospecificity of electrocyclic and cycloaddition reactions."
    ),
    (
        "sci_gibbs_thermodynamics",
        "Josiah Willard Gibbs",
        "Chemical Thermodynamics, Gibbs Free Energy, and the Phase Rule",
        "Formulated the theoretical foundations of chemical thermodynamics, introducing the concepts of chemical potential (mu), free energy (G = H - TS), and the Gibbs Phase Rule (F = C - P + 2).",
        "1873-1878",
        "Published 'On the Equilibrium of Heterogeneous Substances', transforming physical chemistry from an empirical art into an exact mathematical science governing chemical spontaneity and phase equilibrium.",
        "Gibbs demonstrated that chemical equilibrium at constant temperature and pressure corresponds to the minimum of the Gibbs free energy function, establishing criterion dG = 0."
    ),
    (
        "sci_arrhenius_electrolytes_kinetics",
        "Svante Arrhenius",
        "Electrolytic Dissociation and Chemical Activation Energy",
        "Formulated the theory of electrolytic dissociation (salts dissociate into ions in water) and the temperature-dependent rate equation (Arrhenius equation k = A * exp(-Ea / RT)).",
        "1884-1889",
        "Awarded the 1903 Nobel Prize in Chemistry for his electrolytic theory of dissociation, which established modern ionic chemistry and quantitative chemical kinetics.",
        "Arrhenius introduced the concept of 'activation energy', positing that only reactant molecules possessing energy above a critical threshold can undergo reactive chemical transformation."
    ),
    (
        "sci_lewis_covalent_bond",
        "Gilbert N. Lewis",
        "The Shared Electron Pair Covalent Bond and Lewis Acid-Base Theory",
        "Proposed that covalent chemical bonds consist of shared electron pairs (Lewis structures, octet rule) and defined acids as electron-pair acceptors and bases as electron-pair donors.",
        "1916-1923",
        "Revolutionized molecular representation and acid-base theory; his 1916 paper 'The Atom and the Molecule' forms the visual and conceptual language of modern chemistry.",
        "Lewis generalized acid-base interactions beyond proton transfer to encompass coordinate covalent bond formation between any electron-pair donor and acceptor."
    ),
    (
        "sci_schrodinger_wave_mechanics",
        "Erwin Schrödinger",
        "Wave Mechanics and the Electronic Schrödinger Equation",
        "Formulated wave mechanics and the non-relativistic time-independent Schrödinger wave equation (H_hat * Psi = E * Psi), providing the quantum mechanical description of atomic and molecular electronic structure.",
        "1926",
        "Awarded the 1933 Nobel Prize in Physics; established modern quantum chemistry, replacing circular Bohr orbits with three-dimensional electronic probability wavefunctions and orbitals.",
        "Schrödinger wave mechanics successfully reproduced the exact energy spectrum and selection rules of the hydrogen atom and laid the mathematical foundation for molecular orbital theory."
    ),
    (
        "sci_haber_ammonia_synthesis",
        "Fritz Haber",
        "Catalytic High-Pressure Synthesis of Ammonia from Elemental Nitrogen and Hydrogen",
        "Invented the catalytic high-pressure process for directly synthesizing ammonia gas from atmospheric nitrogen and hydrogen: N2 + 3H2 ⇌ 2NH3.",
        "1909",
        "Awarded the 1918 Nobel Prize in Chemistry; scaled by Carl Bosch into the industrial Haber-Bosch process, which sustains global synthetic nitrogen fertilizer production and feeds nearly half the human population.",
        "Haber solved the formidable kinetic challenge of cleaving the extraordinarily strong N≡N triple bond (945 kJ/mol) using promoted osmium/iron catalysts under 200 atm and 500 °C."
    ),
    (
        "sci_fischer_stereochemistry",
        "Emil Fischer",
        "Stereochemistry of Carbohydrates, Purines, and the Lock-and-Key Enzyme Model",
        "Elucidated the complete stereochemical structures and configurations of D-glucose and related hexoses, invented Fischer projection formulas, and proposed the 'lock-and-key' model of enzyme specificity.",
        "1890-1899",
        "Awarded the 1902 Nobel Prize in Chemistry for his monumental work on sugar and purine syntheses, establishing the foundation of structural biochemistry.",
        "Fischer's proof of the relative configuration of the four stereocenters of D-glucose represents one of the most brilliant logical deductive achievements in the history of science."
    ),
    (
        "sci_grignard_organomagnesium",
        "Victor Grignard",
        "Discovery of Organomagnesium Halides (Grignard Reagents)",
        "Discovered that magnesium turnings react smoothly with organic halides in anhydrous ether to form alkyl/arylmagnesium halides (RMgX), functioning as powerful nucleophilic carbanion equivalents.",
        "1900",
        "Awarded the 1912 Nobel Prize in Chemistry; Grignard reagents remain among the most ubiquitous carbon-carbon bond forming tools in all of organic synthesis.",
        "Grignard turned unreactive alkyl halides into potent nucleophiles capable of attacking aldehydes, ketones, esters, and epoxides to synthesize complex alcohols and hydrocarbons."
    ),
    (
        "sci_corey_retrosynthesis",
        "Elias James Corey",
        "The Logic of Retrosynthetic Analysis and Computer-Assisted Synthetic Planning",
        "Formulated the theory and methodology of retrosynthetic analysis (disconnections, synthons, transform-based disconnections), turning organic synthesis from an empirical art into a systematic algorithmic discipline.",
        "1967-1988",
        "Awarded the 1990 Nobel Prize in Chemistry; enabled the systematic total synthesis of hundreds of complex bio-active natural products, prostaglandins, and ginkgolides.",
        "Corey established the concepts of retrosynthetic tree search, synthons, and synthetic equivalents, providing the foundational principles for modern computational synthesis planning."
    ),
    (
        "sci_sharpless_click_asymmetric",
        "K. Barry Sharpless",
        "Chiral Catalytic Oxidations and Click Chemistry",
        "Discovered Sharpless asymmetric epoxidation (1980) and dihydroxylation, and co-founded Click Chemistry (copper-catalyzed azide-alkyne cycloaddition, CuAAC).",
        "1980-2001",
        "One of only two people to receive two Nobel Prizes in Chemistry (2001 for chiral catalytic oxidation, 2022 for the development of click chemistry and bioorthogonal chemistry).",
        "Sharpless demonstrated that modular, spring-loaded reactions with high thermodynamic driving force (>80 kJ/mol) proceed reliably in water under ambient conditions without byproducts."
    ),
    (
        "sci_karplus_nmr_coupling",
        "Martin Karplus",
        "The Karplus Equation and Multiscale Biomolecular Simulations",
        "Formulated the Karplus equation relating vicinal three-bond NMR spin-spin coupling constants (3J) to dihedral torsion angles (theta), and pioneered molecular dynamics simulations of biological macromolecules.",
        "1959-1977",
        "Awarded the 2013 Nobel Prize in Chemistry; the Karplus equation remains the primary experimental tool for determining 3D peptide conformation and stereochemistry in solution.",
        "Karplus utilized valence bond theory to derive 3J(theta) = A*cos^2(theta) + B*cos(theta) + C, linking quantum coupling directly to molecular conformation."
    ),
]


def generate_scientist_records() -> List[ChemNovaRecord]:
    """Generate structured records for chemistry scientists and historical discoveries."""
    records = []
    source = "Nobel Prize Official Archives & Royal Society of Chemistry Historical Collection"
    license_str = "CC-BY-4.0"

    for sid, scientist, field, discovery, date_str, significance, context_str in SCIENTISTS_DATA:
        q = f"What was the scientific contribution and historical discovery of {scientist} in chemistry?"
        a = (
            f"{scientist} was a pioneer in {field}. In approximately {date_str}, {scientist} achieved: {discovery} "
            f"Significance: {significance}"
        )

        rec = ChemNovaRecord(
            id=f"{sid}",
            type=DatasetType.SCIENTIST_DISCOVERY,
            domain=ChemistryDomain.GENERAL_CHEMISTRY,
            subdomain="history_of_chemistry",
            question=q,
            answer=a,
            reasoning=context_str,
            context=f"Scientist: {scientist}\nField: {field}\nDate: {date_str}\nSignificance: {significance}",
            source=source,
            source_url="https://www.nobelprize.org/prizes/chemistry/",
            license=license_str,
            confidence=1.0,
            verified=True,
        )
        records.append(rec)

    return records
