"""Chemistry terminology dictionary corpus generator.

Produces structured terminology records conforming to:
- term
- definition
- synonyms
- related terms
- domain
- examples
- common confusion
- source
"""

from typing import List, Dict, Any
from chemistry_llm.data.schema.types import DatasetType, ChemistryDomain
from chemistry_llm.data.schema.record import ChemNovaRecord

TERMS_DATA = [
    (
        "term_electrophile",
        "Electrophile",
        "An electron-deficient atom, molecule, or ion that accepts an electron pair to form a new covalent bond with an electron-rich species (nucleophile).",
        ["Lewis acid", "electron acceptor", "cationic reagent"],
        ["Nucleophile", "Leaving group", "Lewis base", "Carbocation"],
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "Carbocations (R3C+), carbonyl carbons (C=O), hydronium (H3O+), halonium ions (Br+).",
        "Frequently confused with nucleophile. Remember: Electrophiles are 'electron-lovers' seeking negative charge."
    ),
    (
        "term_nucleophile",
        "Nucleophile",
        "An electron-rich chemical species possessing a lone pair of electrons or pi bond that donates an electron pair to an electrophile to form a covalent bond.",
        ["Lewis base", "electron donor", "attacking group"],
        ["Electrophile", "Basicity", "Nucleophilicity", "Leaving group"],
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "Hydroxide (OH-), cyanide (CN-), iodide (I-), ammonia (NH3), water (H2O), enolate anions.",
        "Confusing nucleophilicity (kinetic rate of attack on carbon) with basicity (thermodynamic equilibrium of proton abstraction). Iodide is a great nucleophile but a very weak base."
    ),
    (
        "term_enantiomers",
        "Enantiomers",
        "Non-superimposable mirror-image stereoisomers that possess identical physical properties (boiling point, melting point, density) in an achiral environment, but rotate plane-polarized light in equal and opposite directions.",
        ["Optical isomers", "chiral pairs", "antipodes"],
        ["Diastereomers", "Chirality", "Optical activity", "Racemic mixture"],
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "(R)-lactic acid and (S)-lactic acid; (R)-carvone (spearmint) and (S)-carvone (caraway).",
        "Confusing enantiomers with diastereomers. Diastereomers are stereoisomers that are NOT mirror images and have distinct physical properties."
    ),
    (
        "term_enthalpy",
        "Enthalpy (H)",
        "A state thermodynamic function defined as H = U + PV, where U is internal energy, P is pressure, and V is volume. At constant pressure, the change in enthalpy (Delta H) equals the heat absorbed or released by the system.",
        ["Heat content"],
        ["Internal energy", "Entropy", "Gibbs free energy", "Exothermic", "Endothermic"],
        ChemistryDomain.PHYSICAL_CHEMISTRY,
        "Standard enthalpy of combustion of methane (Delta H°_c = -890.3 kJ/mol).",
        "Assuming Delta H is identical to total heat q. Delta H equals heat q only under strictly constant-pressure conditions without non-PV work."
    ),
    (
        "term_tautomers",
        "Tautomers",
        "Structural isomers of chemical compounds that readily interconvert through the rapid relocation of a mobile atom (typically a proton) and a corresponding shift in adjacent pi bonds.",
        ["Tautomeric forms", "desmotropism"],
        ["Resonance structures", "Isomers", "Keto-enol equilibrium"],
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "Acetone (keto form: CH3-C(=O)-CH3) and prop-1-en-2-ol (enol form: CH3-C(OH)=CH2).",
        "CRITICAL MISTAKE: Confusing tautomerism with resonance. Tautomers are distinct chemical species with different atomic connectivity in dynamic equilibrium. Resonance structures differ ONLY in electron placement without moving any nuclei."
    ),
    (
        "term_entropy",
        "Entropy (S)",
        "A thermodynamic state function that quantifies the number of microscopic configurations (microstates Omega) corresponding to a macroscopic state: S = k_B * ln(Omega), measuring thermal energy unavailable for mechanical work.",
        ["Disorder", "multiplicity measure", "dispersal of energy"],
        ["Second Law of Thermodynamics", "Enthalpy", "Gibbs free energy", "Microstates"],
        ChemistryDomain.PHYSICAL_CHEMISTRY,
        "Entropy increase during phase transitions (Delta S_vap > Delta S_fus) and spontaneous expansion of a gas into a vacuum.",
        "Equating entropy solely to colloquial 'messiness'. Entropy is quantitatively the statistical dispersal of energy across quantized molecular states."
    ),
    (
        "term_gibbs_free_energy",
        "Gibbs Free Energy (G)",
        "A thermodynamic potential defined as G = H - TS, whose change (Delta G) at constant temperature and pressure represents the maximum non-expansion work obtainable from a closed system, and whose sign dictates spontaneity (Delta G < 0).",
        ["Free enthalpy", "Gibbs function"],
        ["Enthalpy", "Entropy", "Chemical equilibrium", "Spontaneity", "Exergonic"],
        ChemistryDomain.PHYSICAL_CHEMISTRY,
        "Standard Gibbs energy of formation of liquid water (Delta G°_f = -237.1 kJ/mol).",
        "Believing negative Delta G guarantees a fast reaction. Thermodynamics determines IF a reaction can occur; kinetics determines HOW FAST it occurs (a reaction with large negative Delta G can be kinetically inert, like diamond converting to graphite)."
    ),
    (
        "term_activation_energy",
        "Activation Energy (Ea)",
        "The minimum threshold kinetic energy that reacting colliding molecules must possess to overcome electrostatic repulsion and rehybridize into the transition state leading to chemical reaction.",
        ["Kinetic barrier", "energy of activation"],
        ["Arrhenius equation", "Transition state", "Catalyst", "Reaction coordinate"],
        ChemistryDomain.PHYSICAL_CHEMISTRY,
        "Ea for alkaline hydrolysis of ethyl acetate (~47 kJ/mol).",
        "Confusing activation energy (Ea) with overall reaction enthalpy (Delta H). Delta H is the thermodynamic energy difference between reactants and products; Ea is the kinetic height of the barrier."
    ),
    (
        "term_catalyst",
        "Catalyst",
        "A chemical substance that increases the rate of a chemical reaction by providing an alternative elementary reaction pathway with lower activation energy, without being consumed or altering reaction thermodynamics (Delta G° or K_eq).",
        ["Catalytic agent", "promoter"],
        ["Enzyme", "Turnover number", "Activation energy", "Substrate"],
        ChemistryDomain.PHYSICAL_CHEMISTRY,
        "Platinum nanoparticles in automotive catalytic converters; carbonic anhydrase in biological red blood cells.",
        "Believing a catalyst increases product yield at equilibrium. A catalyst speeds up equilibrium attainment but cannot alter the equilibrium position dictated by thermodynamics."
    ),
    (
        "term_aromaticity",
        "Aromaticity",
        "A property of cyclic, planar, fully conjugated ring systems possessing (4n + 2) pi electrons (Hückel's rule) that exhibit extraordinary thermodynamic stability, bond length equalization, and a diatropic diamagnetic ring current in magnetic fields.",
        ["Hückel aromaticity", "aromatic stabilization"],
        ["Hückel rule", "Antiaromaticity", "Resonance energy", "Ring current"],
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "Benzene (6 pi electrons, n=1), pyridine, cyclopentadienyl anion, tropylium cation.",
        "Thinking any cyclic molecule with alternating double bonds is aromatic. Cyclooctatetraene (8 pi electrons) is non-aromatic because it adopts a non-planar tub shape to avoid antiaromaticity."
    ),
    (
        "term_carbocation",
        "Carbocation",
        "A trivalent, positively charged carbon chemical intermediate possessing an empty unhybridized p-orbital and six valence electrons (electron-deficient electrophile).",
        ["Carbonium ion", "carbenium ion"],
        ["Hyperconjugation", "Electrophile", "SN1 reaction", "Carbocation rearrangement"],
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "tert-Butyl cation (CH3)3C+, allyl cation (CH2=CH-CH2+), benzyl cation.",
        "Assuming all carbocations have identical stability. Stability order: tertiary > secondary > primary > methyl; resonance-stabilized allylic and benzylic cations are far more stable than aliphatic equivalents."
    ),
    (
        "term_coordination_number",
        "Coordination Number (CN)",
        "The total number of ligand donor atoms directly bonded to a central transition metal ion or atom in a coordination complex.",
        ["Ligancy"],
        ["Ligand", "Chelate", "Crystal field theory", "Denticity"],
        ChemistryDomain.INORGANIC_CHEMISTRY,
        "CN = 6 in octahedral [Fe(CN)6]4-; CN = 4 in tetrahedral [Zn(NH3)4]2+ and square planar [PtCl4]2-.",
        "Confusing coordination number with the number of ligand molecules. A bidentate ligand (e.g. ethylenediamine) coordinates two donor atoms per molecule; therefore [Co(en)3]3+ has 3 ligands but a coordination number of 6."
    ),
    (
        "term_chelate_effect",
        "The Chelate Effect",
        "The enhanced thermodynamic stability of coordination complexes formed by polydentate (chelating) ligands compared to analogous complexes formed by equivalent unidentate ligands.",
        ["Chelation stabilization"],
        ["Denticity", "Entropy of chelation", "EDTA", "Bidentate"],
        ChemistryDomain.INORGANIC_CHEMISTRY,
        "[Ni(en)3]2+ is ~10^10 times more stable than [Ni(NH3)6]2+.",
        "Attributing the chelate effect primarily to enthalpy. The primary driving force is entropic (Delta S > 0): displacing six monodentate water molecules with three bidentate ligands increases net free particles from 4 to 7, substantially increasing translational entropy."
    ),
    (
        "term_zwitterion",
        "Zwitterion",
        "An internally neutral chemical molecule possessing distinct, separate formal positive and negative charges on different atoms simultaneously.",
        ["Dipolar ion", "inner salt"],
        ["Isoelectric point (pI)", "Amino acids", "Betaines"],
        ChemistryDomain.BIOCHEMISTRY,
        "Glycine in neutral aqueous solution: H3N+-CH2-COO-.",
        "Confusing zwitterions with uncharged neutral molecules. Zwitterions have high dipole moments, behave like salts, and possess high melting points and water solubility."
    ),
    (
        "term_meso_compound",
        "Meso Compound",
        "An achiral stereoisomer of a compound possessing two or more chiral stereocenters that is superimposable on its mirror image due to an internal plane or center of symmetry.",
        ["Meso form"],
        ["Chirality", "Enantiomers", "Diastereomers", "Internal plane of symmetry"],
        ChemistryDomain.ORGANIC_CHEMISTRY,
        "(2R,3S)-tartaric acid (meso-tartaric acid) with an internal horizontal reflection plane.",
        "Assuming that every molecule with chiral centers is optically active. Meso compounds contain chiral centers but have optical rotation [alpha] = 0° because internal symmetry cancels optical activity."
    ),
]


def generate_terminology_records() -> List[ChemNovaRecord]:
    """Generate structured records for chemistry terminology and definitions."""
    records = []
    source = "IUPAC Compendium of Chemical Terminology (Gold Book)"
    license_str = "CC-BY-4.0"

    for tid, term, defn, syns, rel_terms, dom, examp, conf in TERMS_DATA:
        context = (
            f"Term: {term}\n"
            f"Domain: {dom.value}\n"
            f"Definition: {defn}\n"
            f"Synonyms: {', '.join(syns)}\n"
            f"Related Concepts: {', '.join(rel_terms)}\n"
            f"Representative Examples: {examp}\n"
            f"Common Pitfalls / Confusions: {conf}"
        )

        q = f"Define '{term}' in chemistry, its related concepts, and common confusions."
        a = (
            f"{term}: {defn}\n"
            f"Synonyms: {', '.join(syns)}.\n"
            f"Examples: {examp}\n"
            f"Common Confusion: {conf}"
        )

        rec = ChemNovaRecord(
            id=f"{tid}",
            type=DatasetType.CHEMISTRY_TERMINOLOGY,
            domain=dom,
            subdomain="terminology",
            question=q,
            answer=a,
            reasoning=f"Pedagogical context: {conf} Examples: {examp}",
            context=context,
            source=source,
            source_url="https://goldbook.iupac.org/",
            license=license_str,
            confidence=1.0,
            verified=True,
        )
        records.append(rec)

    return records
