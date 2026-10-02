"""Chemical reaction reasoning corpus generator.

Produces didactic examples explaining:
- WHAT happens
- WHY it happens
- HOW it happens
- WHAT product is expected
- WHAT uncertainty exists
Covers electrophiles, nucleophiles, leaving groups, regioselectivity,
chemoselectivity, and carbocation rearrangements.
"""

from typing import List
from chemistry_llm.data.schema.types import DatasetType, ChemistryDomain
from chemistry_llm.data.schema.record import ChemNovaRecord

REASONING_DATA = [
    (
        "rsn_markovnikov_addition",
        "Regioselectivity in Markovnikov Electrophilic Addition",
        "Explain the regiochemical outcome when hydrogen bromide (HBr) reacts with 2-methylprop-1-ene.",
        "The major product is 2-bromo-2-methylpropane (tert-butyl bromide) via Markovnikov regioselectivity.",
        "WHAT HAPPENS:\n"
        "2-Methylprop-1-ene reacts with HBr to selectively yield 2-bromo-2-methylpropane as the major product rather than 1-bromo-2-methylpropane (isobutyl bromide).\n\n"
        "WHY IT HAPPENS (ELECTRONIC DRIVING FORCE):\n"
        "Protonation of the alkene double bond can theoretically generate either a tertiary carbocation (at C2) or a primary carbocation (at C1). A tertiary carbocation is stabilized by hyperconjugation from nine adjacent C-H sigma bonds and inductive electron donation from three methyl groups, making its activation energy significantly lower according to the Hammond postulate.\n\n"
        "HOW IT HAPPENS (STEP-BY-STEP MECHANISM):\n"
        "1. The nucleophilic pi electrons of the alkene attack the electrophilic proton of H-Br, forming a tertiary carbocation intermediate (CH3)3C+ and a bromide anion (Br-).\n"
        "2. The bromide nucleophile attacks the planar sp2-hybridized carbocation carbon to form the C-Br sigma bond.\n\n"
        "WHAT PRODUCT IS EXPECTED:\n"
        "2-Bromo-2-methylpropane is obtained in >98% selectivity under standard polar conditions.\n\n"
        "WHAT UNCERTAINTY / EXCEPTIONS EXIST:\n"
        "If peroxides (ROOR) and light are present, a radical chain mechanism proceeds instead, generating an anti-Markovnikov bromine radical addition leading to 1-bromo-2-methylpropane."
    ),
    (
        "rsn_sn1_vs_sn2_secondary",
        "Competition between SN1, SN2, E1, and E2 for Secondary Substrates",
        "Predict and explain the major product when (2R)-2-bromobutane is treated with sodium ethoxide (NaOEt) in ethanol vs sodium iodide (NaI) in acetone.",
        "With strong unhindered base NaOEt in ethanol, E2 elimination dominates yielding trans-2-butene (Zaitsev product); with good nucleophile/weak base NaI in acetone, SN2 substitution dominates yielding (2S)-2-iodobutane with complete stereochemical inversion.",
        "WHAT HAPPENS:\n"
        "Reaction A (NaOEt / EtOH): Strong basic conditions favor bimolecular elimination (E2).\n"
        "Reaction B (NaI / acetone): Nucleophilic conditions in polar aprotic solvent favor bimolecular substitution (SN2).\n\n"
        "WHY IT HAPPENS:\n"
        "- Ethoxide (EtO-) is a strong Brønsted base (pKa conjugate acid ~16). For a secondary alkyl halide, steric hindrance at the alpha-carbon makes proton abstraction from the beta-carbon faster than nucleophilic backside attack.\n"
        "- Iodide (I-) is a very weak base (pKa conjugate acid ~ -10) but an outstanding polarizable nucleophile. In polar aprotic acetone, sodium ions are solvated while iodide remains unsolvated and nucleophilically aggressive.\n\n"
        "HOW IT HAPPENS:\n"
        "- Case A (E2): EtO- abstracts an anti-periplanar beta-hydrogen synchronously with C=C double bond formation and bromide departure.\n"
        "- Case B (SN2): I- attacks C2 from the backside opposite the C-Br bond, inverting stereochemistry at C2 via a trigonal bipyramidal transition state.\n\n"
        "WHAT PRODUCT IS EXPECTED:\n"
        "- Case A: trans-2-Butene (~75%), cis-2-butene (~15%), 1-butene (~10%).\n"
        "- Case B: (2S)-2-Iodobutane (>95% yield, 100% optical inversion).\n\n"
        "WHAT UNCERTAINTY EXISTS:\n"
        "In protic solvent mixtures without strong base or nucleophile, ionization to a secondary carbocation can occur, leading to competing SN1/E1 racemization and Wagner-Meerwein methyl/hydride shifts."
    ),
    (
        "rsn_carbocation_rearrangement",
        "Wagner-Meerwein Hydride and Alkyl Shifts in Solvolysis",
        "Explain why the solvolysis of 2-bromo-3,3-dimethylbutane in water yields predominantly 2,3-dimethylbutan-2-ol rather than 3,3-dimethylbutan-2-ol.",
        "The reaction proceeds via an SN1 mechanism involving a rapid 1,2-methyl shift that converts a secondary carbocation into a more stable tertiary carbocation before nucleophilic capture.",
        "WHAT HAPPENS:\n"
        "Solvolysis of secondary alkyl halide 2-bromo-3,3-dimethylbutane produces a rearranged tertiary alcohol (2,3-dimethylbutan-2-ol) as the major thermodynamic and kinetic product.\n\n"
        "WHY IT HAPPENS:\n"
        "Ionization of the C-Br bond initially produces a secondary carbocation adjacent to a quaternary carbon (neopentyl-type system). A 1,2-methyl shift relieves steric strain and transforms the less stable secondary carbocation (4 hyperconjugative interactions) into a much more stable tertiary carbocation (7 hyperconjugative interactions).\n\n"
        "HOW IT HAPPENS:\n"
        "1. Rate-determining ionization of Br- forms the secondary carbocation (CH3)3C-CH(+)-CH3.\n"
        "2. A methyl group migrates with its bonding pair of electrons (1,2-methide shift) across the C-C bond to the vacant p-orbital, yielding (CH3)2C(+)-CH(CH3)2.\n"
        "3. Water attacks the tertiary carbocation, followed by deprotonation to yield the tertiary alcohol.\n\n"
        "WHAT PRODUCT IS EXPECTED:\n"
        "2,3-Dimethylbutan-2-ol (>85%) alongside rearranged elimination alkenes (2,3-dimethylbut-2-ene).\n\n"
        "WHAT UNCERTAINTY EXISTS:\n"
        "Minor unrearranged alcohol (3,3-dimethylbutan-2-ol) can be captured if a powerful external nucleophile intercepts the secondary carbocation prior to rearrangement."
    ),
    (
        "rsn_eas_directing_effects",
        "Ortho/Para vs Meta Directing Effects in Electrophilic Aromatic Substitution",
        "Explain why methoxy (-OCH3) directs electrophilic substitution to ortho and para positions while nitro (-NO2) directs to meta positions.",
        "Methoxy (-OCH3) directs ortho/para because its lone pairs provide resonance electron donation that generates an extra stable octet-complete arenium ion contributor for ortho and para attack. Nitro (-NO2) is strongly electron-withdrawing by induction and resonance, placing adjacent formal positive charges in ortho/para transition states, leaving meta as the least destabilized pathway.",
        "WHAT HAPPENS:\n"
        "Nitration of anisole (methoxybenzene) yields predominantly ortho- and para-nitroanisole at rates faster than benzene. Nitration of nitrobenzene yields predominantly meta-dinitrobenzene at rates far slower than benzene.\n\n"
        "WHY IT HAPPENS (ELECTRONIC DRIVING FORCE):\n"
        "- For -OCH3: Resonance donation (+M effect) into the pi system outweighs inductive withdrawal (-I). In the Wheland intermediate resulting from ortho or para attack, the oxygen lone pair can delocalize positive charge, producing a fourth resonance contributor where every atom (including carbon and oxygen) has a complete octet.\n"
        "- For -NO2: The nitrogen atom bears a formal +1 charge and is conjugated with the aromatic ring (-M and -I). Ortho or para attack produces a resonance contributor with adjacent positive charges (N+ adjacent to C+), creating severe electrostatic repulsion. Meta attack avoids this unfavorable adjacent positive charge state.\n\n"
        "HOW IT HAPPENS:\n"
        "1. Electrophile NO2+ approaches the aromatic pi cloud.\n"
        "2. Formation of the Wheland sigma-complex (rate-determining step).\n"
        "3. Proton loss to base restores the 6-electron aromatic sextet.\n\n"
        "WHAT PRODUCT IS EXPECTED:\n"
        "- Anisole: ~69% para-nitroanisole, ~31% ortho-nitroanisole, <1% meta.\n"
        "- Nitrobenzene: ~93% meta-dinitrobenzene, ~6% ortho, ~1% para.\n\n"
        "WHAT UNCERTAINTY EXISTS:\n"
        "Ortho/para ratio is influenced by the steric size of both the directing group and the incoming electrophile (larger substituents like tert-butyl direct almost exclusively para due to steric hindrance)."
    ),
    (
        "rsn_chemoselective_reduction",
        "Chemoselectivity in Carbonyl Reductions: NaBH4 vs LiAlH4",
        "Predict and explain the product when methyl 4-oxopentanoate is treated with NaBH4 in ethanol vs LiAlH4 in THF followed by aqueous workup.",
        "NaBH4 chemoselectively reduces the ketone without affecting the ester, yielding methyl 4-hydroxypentanoate (which rapidly lactonizes). LiAlH4 non-selectively reduces both the ketone and the ester, yielding pentane-1,4-diol.",
        "WHAT HAPPENS:\n"
        "- Treatment with NaBH4 reduces only the ketone carbonyl.\n"
        "- Treatment with LiAlH4 reduces both ketone and ester carbonyls to alcohols.\n\n"
        "WHY IT HAPPENS (NUCLEOPHILICITY & LEWIS ACIDITY):\n"
        "- An ester carbonyl is less electrophilic than a ketone carbonyl because resonance electron donation from the alkoxy oxygen lone pair (:OR) delocalizes electron density into the C=O carbon, diminishing its partial positive charge (delta+).\n"
        "- NaBH4 is a mild, moderately nucleophilic hydride donor. In protic ethanol, it attacks the more electrophilic ketone carbon rapidly, but is too weak to attack the resonance-stabilized ester carbon.\n"
        "- LiAlH4 possesses a more polar, nucleophilic Al-H bond (electronegativity of Al is 1.61 vs B is 2.04), and Li+ acts as a strong Lewis acid coordinating to the carbonyl oxygen. This activates even resonance-stabilized esters for hydride transfer.\n\n"
        "HOW IT HAPPENS:\n"
        "1. Ketone reduction: Hydride transfers to carbonyl carbon; protonation of alkoxide yields secondary alcohol.\n"
        "2. Ester reduction with LiAlH4: First hydride addition forms a tetrahedral intermediate which collapses by expelling methoxide (MeO-), generating an aldehyde in situ. The aldehyde is even more electrophilic and is instantly reduced by a second hydride to the primary alcohol.\n\n"
        "WHAT PRODUCT IS EXPECTED:\n"
        "- NaBH4: 5-Methyltetrahydrofuran-2-one (gamma-valerolactone, formed by spontaneous intramolecular transesterification) in >90% yield.\n"
        "- LiAlH4: Pentane-1,4-diol in >95% yield.\n\n"
        "WHAT UNCERTAINTY EXISTS:\n"
        "Prolonged reaction times or refluxing NaBH4 with added LiCl or in MeOH can cause slow, partial reduction of esters."
    ),
    (
        "rsn_e2_anti_periplanar",
        "Conformational Requirement of Anti-Periplanar Geometry in E2 Elimination",
        "Why does neomenthyl chloride undergo E2 elimination with sodium ethoxide roughly 200 times faster than menthyl chloride, and what are the respective products?",
        "E2 elimination requires a strictly anti-periplanar (180° dihedral angle) alignment between the beta-C-H bond and the alpha-C-Cl bond. In neomenthyl chloride, chlorine is axial in the most stable chair conformation with two anti-periplanar beta-hydrogens, enabling rapid Zaitsev elimination (1-menthene). In menthyl chloride, chlorine is equatorial, requiring unfavorable ring flipping into an energetically strained diaxial chair with only one anti-periplanar beta-hydrogen, leading to slow Hofmann elimination (2-menthene).",
        "WHAT HAPPENS:\n"
        "- Neomenthyl chloride reacts rapidly with NaOEt/EtOH to yield 1-menthene (Zaitsev product, 75%) and 2-menthene (25%).\n"
        "- Menthyl chloride reacts very slowly with NaOEt/EtOH to yield exclusively 2-menthene (100%, non-Zaitsev product).\n\n"
        "WHY IT HAPPENS:\n"
        "- In the E2 transition state, pi bond formation occurs synchronously with C-H and C-Cl bond cleavage. Maximum orbital overlap between the breaking sigma(C-H) orbital and sigma*(C-Cl) antibonding orbital occurs when the dihedral angle is exactly 180° (anti-periplanar).\n"
        "- Neomenthyl chloride has an axial chlorine in its lowest energy conformation (all three bulky alkyl groups equatorial). Both C2 and C4 beta-hydrogens are axial and anti-periplanar to Cl, allowing rapid elimination to the more substituted, thermodynamically stable alkene (1-menthene).\n"
        "- Menthyl chloride has an equatorial chlorine in its stable chair. E2 can only occur from the high-energy chair where chlorine is axial (placing all alkyl groups axial, costing ~20 kJ/mol). In this flipped chair, the only axial beta-hydrogen is at C2, giving exclusively 2-menthene.\n\n"
        "HOW IT HAPPENS:\n"
        "Ethoxide base abstracts the axial beta-hydrogen while electrons flow to form the C=C double bond and axial chloride departs.\n\n"
        "WHAT PRODUCT IS EXPECTED:\n"
        "- Neomenthyl: 1-menthene (~75%), 2-menthene (~25%). Rate is fast (k_rel ~ 200).\n"
        "- Menthyl: 2-menthene (100%). Rate is slow (k_rel = 1).\n\n"
        "WHAT UNCERTAINTY EXISTS:\n"
        "If a very bulky base like potassium tert-butoxide is used, steric repulsion can alter the regiochemical isomer ratio toward the less substituted alkene."
    ),
    (
        "rsn_kinetic_vs_thermodynamic_enolates",
        "Kinetic vs Thermodynamic Control in Enolate Alkylation",
        "Explain how reaction conditions dictate the formation of kinetic vs thermodynamic enolates from 2-methylcyclohexanone.",
        "Treatment with a strong, hindered, non-nucleophilic base (LDA) at low temperature (-78 °C) under aprotic conditions gives the kinetic enolate (deprotonation at less hindered C6). Treatment with a weaker base (NaOEt or KOtBu) at room temperature with slight excess ketone allows equilibrium, affording the thermodynamic enolate (deprotonation at more substituted C2 forming more stable tetrasubstituted alkene).",
        "WHAT HAPPENS:\n"
        "- Condition A (LDA, THF, -78 °C): >99% 6-methyl enolate (kinetic).\n"
        "- Condition B (KOtBu, tBuOH, 25 °C): >90% 2-methyl enolate (thermodynamic).\n\n"
        "WHY IT HAPPENS:\n"
        "- The kinetic enolate is formed faster because the secondary C6 protons are sterically more accessible to the bulky isopropyl groups of LDA than the tertiary C2 proton.\n"
        "- The thermodynamic enolate is more stable because its C=C double bond is tetrasubstituted (hyperconjugative and electronic alkene stabilization) compared to the trisubstituted kinetic enolate.\n"
        "- At -78 °C with strong base, deprotonation is irreversible, locking in the kinetic product.\n"
        "- At higher temperature with protic solvent or slight excess ketone, proton transfer is reversible (enolate-ketone equilibration), allowing the system to relax to the most stable thermodynamic state.\n\n"
        "HOW IT HAPPENS:\n"
        "LDA abstracts the accessible C6 proton. Subsequent addition of alkyl halide (e.g., CH3I) yields 2,6-dimethylcyclohexanone (kinetic route) or 2,2-dimethylcyclohexanone (thermodynamic route).\n\n"
        "WHAT PRODUCT IS EXPECTED:\n"
        "- Kinetic alkylation: 2,6-Dimethylcyclohexanone (>90%).\n"
        "- Thermodynamic alkylation: 2,2-Dimethylcyclohexanone (>85%).\n\n"
        "WHAT UNCERTAINTY EXISTS:\n"
        "Polyalkylation can compete if unreacted neutral ketone equilibrates with alkylated enolate."
    ),
    (
        "rsn_epoxide_ring_opening",
        "Regioselectivity in Epoxide Ring Opening: Acidic vs Basic Conditions",
        "Predict and mechanistically rationalize the regiochemical outcome of treating 2,2-dimethyloxirane with methanol under acidic (H+) vs basic (NaOCH3) conditions.",
        "Under basic conditions (NaOCH3), nucleophilic attack occurs at the less hindered primary carbon (C3) via an SN2 mechanism. Under acidic conditions (H+/CH3OH), nucleophilic attack occurs at the more substituted tertiary carbon (C2) because protonation of the epoxide creates significant partial positive charge at C2, which is better stabilized by hyperconjugation and alkyl donation.",
        "WHAT HAPPENS:\n"
        "- Basic condition (CH3O- / CH3OH): Methoxide attacks the primary carbon to yield 2-methoxy-2-methylpropan-1-ol.\n"
        "- Acidic condition (H+ / CH3OH): Methanol attacks the tertiary carbon to yield 1-methoxy-2-methylpropan-2-ol.\n\n"
        "WHY IT HAPPENS (STERIC VS ELECTRONIC CONTROL):\n"
        "- Basic mechanism (SN2): Methoxide is a strong nucleophile reacting with an unactivated neutral epoxide. The rate is governed by steric hindrance at the transition state; attack at the sterically accessible primary carbon has a significantly lower activation energy.\n"
        "- Acidic mechanism (borderline SN1/SN2): Protonation of oxygen generates an oxonium ion. The C-O bonds weaken and polarize unevenly. The tertiary carbon can bear a substantial partial carbocation character (delta+) stabilized by hyperconjugation from two methyl groups. This electronic stabilization outweighs steric hindrance, directing the weak methanol nucleophile to C2.\n\n"
        "HOW IT HAPPENS:\n"
        "1. Base: CH3O- attacks C3 from backside with inversion, breaking C3-O bond. Protonation of alkoxide yields product.\n"
        "2. Acid: Oxygen protonates. Methanol lone pair attacks C2, cleaving C2-O bond. Deprotonation yields product.\n\n"
        "WHAT PRODUCT IS EXPECTED:\n"
        "- Basic: 2-Methoxy-2-methylpropan-1-ol (>95%).\n"
        "- Acidic: 1-Methoxy-2-methylpropan-2-ol (>90%).\n\n"
        "WHAT UNCERTAINTY EXISTS:\n"
        "With secondary epoxides, acidic conditions often give mixtures of regioisomers because the secondary carbon provides less carbocation stabilization than a tertiary center."
    ),
    (
        "rsn_trans_effect_platinum",
        "The Trans-Effect and Trans-Influence in Square Planar Platinum(II) Complexes",
        "Explain how the trans-effect is used to synthesize cis-diamminedichloroplatinum(II) (cisplatin) vs trans-diamminedichloroplatinum(II).",
        "The trans-effect is the labilization of ligands trans to a specific trans-directing ligand in square planar complexes, governed by sigma-donation (trans-influence, ground-state bond weakening) and pi-acceptor ability (stabilizing the trigonal bipyramidal transition state). Chloride has a stronger trans-effect than ammonia (Cl- > NH3), allowing selective synthesis of cisplatin from [PtCl4]2- and transplatin from [Pt(NH3)4]2+.",
        "WHAT HAPPENS:\n"
        "- Synthesis of cisplatin: Start with [PtCl4]2-, add two equivalents of NH3. Yields exclusively cis-[PtCl2(NH3)2].\n"
        "- Synthesis of transplatin: Start with [Pt(NH3)4]2+, add two equivalents of Cl-. Yields exclusively trans-[PtCl2(NH3)2].\n\n"
        "WHY IT HAPPENS (KINETIC TRANS-EFFECT):\n"
        "Trans-directing ability series: CN- ~ CO ~ C2H4 > PR3 ~ H- > I- > Br- > Cl- > NH3 > OH- > H2O.\n"
        "- In [PtCl4]2-, substitution of the first Cl- by NH3 yields [PtCl3(NH3)]-. The three remaining chlorides see either a trans Cl- or a trans NH3. Because Cl- has a stronger trans-effect than NH3, the chloride trans to Cl- is labilized, directing the second NH3 cis to the first NH3, affording cisplatin.\n"
        "- In [Pt(NH3)4]2+, substitution of the first NH3 by Cl- yields [Pt(NH3)3Cl]+. In this intermediate, Cl- has a much stronger trans-effect than NH3. Therefore, the ammonia ligand located trans to Cl- is labilized and replaced by the second incoming Cl-, affording transplatin.\n\n"
        "HOW IT HAPPENS:\n"
        "Substitution proceeds via an associative (A) mechanism involving a 5-coordinate trigonal bipyramidal transition state. Pi-acceptor and strong sigma-donor ligands stabilize this transition state when situated in the equatorial plane.\n\n"
        "WHAT PRODUCT IS EXPECTED:\n"
        "- Route 1 ([PtCl4]2- + 2 NH3): cis-[PtCl2(NH3)2] (>90%).\n"
        "- Route 2 ([Pt(NH3)4]2+ + 2 Cl-): trans-[PtCl2(NH3)2] (>90%).\n\n"
        "WHAT UNCERTAINTY EXISTS:\n"
        "Prolonged heating in excess chloride can lead to slow isomerization or over-substitution back to [PtCl4]2-."
    ),
]


def generate_reasoning_records() -> List[ChemNovaRecord]:
    """Generate structured records for reaction reasoning and mechanistic logic."""
    records = []
    source = "March's Advanced Organic Chemistry & Carey-Sundberg Advanced Organic Chemistry"
    license_str = "CC-BY-4.0"

    for rid, title, q, a, reasoning in REASONING_DATA:
        rec = ChemNovaRecord(
            id=f"{rid}",
            type=DatasetType.CHEMISTRY_REASONING,
            domain=ChemistryDomain.ORGANIC_CHEMISTRY,
            subdomain="reaction_reasoning",
            question=q,
            answer=a,
            reasoning=reasoning,
            context=f"Subject: {title}\nDomain: Organic Reaction Mechanisms and Chemical Reasoning",
            source=source,
            source_url="https://doi.org/10.1007/978-0-387-44899-2",
            license=license_str,
            confidence=1.0,
            verified=True,
        )
        records.append(rec)

    return records
