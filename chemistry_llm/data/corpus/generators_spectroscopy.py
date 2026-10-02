"""Spectroscopy knowledge corpus generator.

Generates structured records covering:
- Infrared (IR) Spectroscopy: Functional group frequencies, Hooke's law
- Nuclear Magnetic Resonance (NMR): 1H, 13C, 19F, 31P chemical shifts, splitting
- Mass Spectrometry (MS): EI, ESI, McLafferty rearrangement, isotope clusters
- UV-Visible Spectroscopy: Beer-Lambert law, chromophores, pi-pi* transitions
- Raman Spectroscopy: Inelastic scattering, polarizability selection rules
- X-ray Photoelectron Spectroscopy (XPS): Core electron binding energy
- X-ray Diffraction (XRD): Bragg's law, crystal lattice parameters
- Electron Paramagnetic Resonance (EPR): Unpaired spins, g-factor, hyperfine splitting
"""

from typing import List
from chemistry_llm.data.schema.types import DatasetType, ChemistryDomain
from chemistry_llm.data.schema.record import ChemNovaRecord

SPECTROSCOPY_DATA = [
    (
        "spec_ir_carbonyl",
        "Infrared (IR) Spectroscopy: Carbonyl Stretching Frequencies",
        "Explain the diagnostic IR absorption ranges for carbonyl (C=O) groups across different functional classes.",
        "The carbonyl (C=O) stretching absorption appears as an intense band between 1650 and 1820 cm⁻¹ in Infrared spectroscopy.",
        "Carbonyl stretching frequency is dictated by bond order, resonance, induction, and ring strain:\n"
        "- Acid chlorides: 1790-1815 cm⁻¹ (strong electronegative Cl induction pulls electron density, strengthening C=O bond).\n"
        "- Anhydrides: Doublet at 1760 and 1820 cm⁻¹ (symmetric and asymmetric coupled stretching).\n"
        "- Esters: 1735-1750 cm⁻¹ (inductive effect of alkoxy oxygen dominates).\n"
        "- Aldehydes: 1720-1740 cm⁻¹ (paired with Fermi resonance C-H doublet at 2720 and 2820 cm⁻¹).\n"
        "- Ketones (acyclic): 1710-1725 cm⁻¹ (standard aliphatic reference).\n"
        "- Carboxylic acids: 1700-1725 cm⁻¹ (accompanied by extremely broad O-H stretch from 2500-3300 cm⁻¹ due to dimeric H-bonding).\n"
        "- Amides: 1650-1690 cm⁻¹ (strong resonance donation of nitrogen lone pair lowers C=O bond order toward single bond character).\n"
        "- Alpha,beta-conjugation lowers the stretching frequency by 20-40 cm⁻¹ due to delocalization.",
        "ir"
    ),
    (
        "spec_nmr_1h_basics",
        "Proton Nuclear Magnetic Resonance (1H NMR) Interpretation",
        "How are chemical shift, integration, and spin-spin splitting used to deduce molecular structure in 1H NMR?",
        "1H NMR elucidates molecular structure through four primary spectral parameters: number of signals (chemical equivalence), chemical shift delta (electronic environment in ppm), signal integration (relative proton ratio), and multiplicity (n+1 rule for neighboring vicinal protons).",
        "1. Chemical Shift (delta, ppm relative to TMS at 0 ppm):\n"
        "   - Aliphatic C-H: 0.8-1.8 ppm\n"
        "   - Allylic / Benzylic C-H: 2.0-3.0 ppm\n"
        "   - Heteroatom-adjacent C-H (O, N, halogens): 3.0-4.5 ppm\n"
        "   - Alkenyl =C-H: 4.5-6.5 ppm\n"
        "   - Aromatic C-H: 6.5-8.5 ppm (deshielded by diamagnetic ring current)\n"
        "   - Aldehydic -CHO: 9.0-10.0 ppm\n"
        "   - Carboxylic acid -COOH: 10.5-12.5 ppm\n"
        "2. Multiplicity and Coupling Constants (J):\n"
        "   - Governed by the (n + 1) rule for I = 1/2 nuclei: n equivalent neighboring protons split a peak into n+1 lines (singlet, doublet, triplet, quartet).\n"
        "   - Vicinal three-bond coupling (3J_HH) for freely rotating aliphatic chains typically ranges from 6 to 8 Hz, whereas trans-alkene coupling (12-18 Hz) clearly distinguishes from cis-alkene coupling (6-12 Hz) via the Karplus relationship.",
        "nmr"
    ),
    (
        "spec_ms_mclafferty",
        "Mass Spectrometry: The McLafferty Rearrangement Mechanism",
        "What is the McLafferty rearrangement in electron ionization (EI) mass spectrometry?",
        "The McLafferty rearrangement is a characteristic intramolecular beta-cleavage accompanying gamma-hydrogen transfer through a six-membered cyclic transition state in carbonyl compounds.",
        "Criteria for McLafferty rearrangement in EI-MS (70 eV):\n"
        "1. Requirement: A carbonyl (or related unsaturated system like an ester, ketone, acid) possessing a hydrogen atom at the gamma position (gamma-C-H).\n"
        "2. Mechanism: Upon electron impact ionization, the molecular radical cation undergoes homolytic migration of the gamma-hydrogen to the radical carbonyl oxygen atom.\n"
        "3. Cleavage: The alpha-beta carbon-carbon bond simultaneously cleaves, releasing a neutral neutral alkene molecule (e.g., ethene, 28 Da) and leaving a resonance-stabilized radical cation enol fragment of even mass-to-charge (m/z) ratio.\n"
        "4. Diagnostic value: Readily distinguishes straight-chain ketones, aldehydes, and esters by yielding prominent even-mass fragment ions (e.g., m/z 58 for pentan-2-one).",
        "mass_spectrometry"
    ),
    (
        "spec_uvvis_beer_lambert",
        "UV-Visible Spectroscopy and the Beer-Lambert Law",
        "State the Beer-Lambert Law and describe the electronic transitions responsible for UV-Vis absorption in organic molecules.",
        "The Beer-Lambert Law A = epsilon * b * c relates absorbance (A) to molar absorptivity (epsilon, L/(mol*cm)), path length (b, cm), and sample molar concentration (c, mol/L).",
        "UV-Vis spectroscopy (200-800 nm) probes electronic transitions between frontier molecular orbitals:\n"
        "1. sigma → sigma* (vacuum UV, <180 nm, saturated C-C and C-H bonds).\n"
        "2. n → sigma* (180-260 nm, lone pairs in alcohols, ethers, amines, halogen compounds).\n"
        "3. pi → pi* (200-400 nm, intense absorption, epsilon > 10,000, in conjugated alkenes and aromatics; bathochromic red-shift occurs with increasing conjugated double bond length according to Woodward-Fieser rules).\n"
        "4. n → pi* (270-350 nm, forbidden transition, low intensity, epsilon < 100, observed in carbonyls).\n"
        "Limitations: Deviation from linearity occurs at high concentrations (c > 0.01 M) due to intermolecular electrostatic interactions and refractive index changes.",
        "uv_visible"
    ),
    (
        "spec_xrd_braggs_law",
        "X-Ray Diffraction (XRD) and Bragg's Law",
        "Derive and explain Bragg's Law for constructive interference in crystalline lattices.",
        "Bragg's Law n * lambda = 2 * d * sin(theta) defines the condition for constructive X-ray interference from parallel crystal lattice planes with spacing d at incident angle theta for radiation of wavelength lambda.",
        "1. Physical basis: When monochromatic X-rays (e.g., Cu K-alpha, lambda = 1.5406 Å) strike a crystalline lattice, electrons scatter the radiation elastically.\n"
        "2. Path difference: The difference in distance traveled by rays reflecting from adjacent lattice planes separated by interplanar distance d_hkl is 2 * d * sin(theta).\n"
        "3. Constructive interference: Occurs when this path difference equals an integer multiple n of the incident wavelength lambda, producing a sharp diffraction peak.\n"
        "4. Application: Powder XRD yields a unique fingerprint of crystalline phase purity, lattice dimensions (a, b, c), and crystallite size via the Scherrer equation.",
        "xrd"
    ),
    (
        "spec_nmr_13c_dept",
        "Carbon-13 NMR (13C NMR) and DEPT Spectral Editing",
        "How do 13C NMR chemical shifts and DEPT-135 experiments distinguish quaternary carbons, CH, CH2, and CH3 groups?",
        "13C NMR chemical shifts span 0-220 ppm relative to TMS. Broadband proton decoupling collapses 13C-1H splitting into singlets. DEPT-135 spectral editing differentiates carbon multiplicities: CH3 and CH point up (positive phase), CH2 points down (inverted phase), and quaternary carbons do not appear.",
        "1. Diagnostic 13C chemical shift zones (ppm):\n"
        "   - Aliphatic sp3 carbons (C-C): 0-50 ppm\n"
        "   - Heteroatom-attached sp3 carbons (C-O, C-N, C-X): 50-90 ppm\n"
        "   - Alkyne sp carbons (C≡C): 65-90 ppm\n"
        "   - Alkene sp2 carbons (C=C): 100-150 ppm\n"
        "   - Aromatic sp2 carbons (Ar-C): 110-160 ppm\n"
        "   - Carbonyl sp2 carbons (esters, acids, amides): 160-185 ppm\n"
        "   - Carbonyl sp2 carbons (aldehydes, ketones): 190-220 ppm\n"
        "2. DEPT (Distortionless Enhancement by Polarization Transfer):\n"
        "   - DEPT-45: All carbons with attached protons (CH, CH2, CH3) appear positive.\n"
        "   - DEPT-90: Exclusively CH carbons appear positive.\n"
        "   - DEPT-135: CH3 and CH carbons appear positive (+), CH2 carbons appear negative/inverted (-), and quaternary carbons (zero attached H) are completely absent.\n"
        "3. Quaternary identification: Observed in broadband decoupled 13C spectrum but completely disappear in all DEPT spectra.",
        "nmr"
    ),
    (
        "spec_nmr_19f",
        "Fluorine-19 NMR (19F NMR) Spectroscopy",
        "What are the nuclear spin properties, chemical shift references, and coupling characteristics of 19F NMR?",
        "19F is an ideal NMR nucleus having 100% natural abundance, nuclear spin I = 1/2, high gyromagnetic ratio (gamma = 25.18 × 10^7 rad/(T*s)), and a broad chemical shift range spanning >500 ppm referenced to trichlorofluoromethane (CFCl3 = 0 ppm).",
        "1. Physical characteristics: High sensitivity (83% of 1H receptivity). Spin 1/2 gives sharp, non-quadrupolar resonance lines.\n"
        "2. Reference standard: CFCl3 set to 0.0 ppm; fluorobenzene (C6H5F) appears at -113.1 ppm, trifluoroacetic acid (TFA) at -76.5 ppm.\n"
        "3. Chemical shift sensitivity: Enormously sensitive to local steric and electronic environments (e.g. distinguishing axial vs equatorial fluorines in steroid rings).\n"
        "4. Coupling constants (J):\n"
        "   - 2J_FF (geminal F-C-F): Up to 150-300 Hz in diastereotopic CF2 groups.\n"
        "   - 3J_FH (vicinal H-C-C-F): Typically 10-40 Hz, adhering to a Karplus-like dihedral angle relationship.\n"
        "   - 'Through-space' coupling: Observed across crowded non-bonded fluorine atoms in close spatial proximity (<2.7 Å).",
        "nmr"
    ),
    (
        "spec_nmr_31p",
        "Phosphorus-31 NMR (31P NMR) Spectroscopy",
        "Explain the diagnostic utility, chemical shift ranges, and reference standard in 31P NMR.",
        "31P NMR utilizes the 100% naturally abundant spin I = 1/2 31P nucleus, referenced to 85% aqueous phosphoric acid (H3PO4 = 0.0 ppm), spanning a wide chemical shift dispersion of ~700 ppm across different phosphorus oxidation states and coordination numbers.",
        "1. Reference: 85% H3PO4 (ext. capillary standard, delta = 0 ppm). Common secondary standards include P(OMe)3 (+140 ppm) and PPh3 (-6 ppm).\n"
        "2. Characteristic chemical shift zones:\n"
        "   - Phosphines (PR3, P(III)): Typically -60 to +40 ppm (PPh3 at -6 ppm, PCy3 at +10 ppm).\n"
        "   - Phosphites (P(OR)3, P(III)): Deshielded to +130 to +160 ppm by electronegative oxygens.\n"
        "   - Phosphates and esters (O=P(OR)3, P(V)): Resonate near -20 to +10 ppm.\n"
        "   - Phosphine oxides (R3P=O, P(V)): +25 to +50 ppm.\n"
        "3. Biochemical application: 31P NMR cleanly resolves the three distinct phosphate groups of ATP in vivo: gamma-phosphate (~ -5 ppm), alpha-phosphate (~ -10 ppm), and beta-phosphate (~ -21 ppm doublet of doublets due to 2J_PP coupling ~ 20 Hz).",
        "nmr"
    ),
    (
        "spec_raman_spectroscopy",
        "Raman Spectroscopy and the Selection Rule of Polarizability Change",
        "Contrast Raman scattering with IR absorption and explain the Rule of Mutual Exclusion.",
        "Raman spectroscopy probes vibrational transitions via inelastic photon scattering (h*nu_0 ± Delta E_vib). An optical transition is Raman-active only if molecular vibration induces a change in polarizability (d_alpha/dQ != 0). The Rule of Mutual Exclusion states that for molecules with an inversion center (centrosymmetric), no vibrational mode can be both IR-active and Raman-active.",
        "1. Physical basis: Monochromatic laser excitation (nu_0) polarizes molecular electron clouds. Most photons scatter elastically (Rayleigh scattering, nu_0). A tiny fraction (~1 in 10^7) exchanges energy with vibrational modes:\n"
        "   - Stokes scattering: Molecule absorbs vibrational energy, photon exits at lower frequency (nu_0 - Delta nu_vib).\n"
        "   - Anti-Stokes scattering: Thermally excited molecule loses vibrational energy to photon, exiting at higher frequency (nu_0 + Delta nu_vib; lower intensity by Boltzmann factor exp(-Delta E / k_B T)).\n"
        "2. Selection rules comparison:\n"
        "   - IR active: Requires a change in molecular dipole moment (d_mu/dQ != 0; strong for polar bonds: C=O, O-H).\n"
        "   - Raman active: Requires a change in molecular polarizability (d_alpha/dQ != 0; strong for symmetric, non-polar bonds: C=C, C≡C, S-S, homonuclear diatomics like N2 and O2).\n"
        "3. Rule of Mutual Exclusion: In molecules with an inversion center (e.g. CO2, trans-dichloroethene, benzene), centrosymmetric vibrations are either gerade (Raman active, IR inactive) or ungerade (IR active, Raman inactive), never both.",
        "raman"
    ),
    (
        "spec_xps_binding_energy",
        "X-Ray Photoelectron Spectroscopy (XPS) and Chemical Shifts",
        "Explain the operating principle of XPS and how core electron binding energy chemical shifts determine oxidation states.",
        "XPS is a surface-sensitive quantitative technique based on the photoelectric effect. Monochromatic X-rays (Al K-alpha, 1486.6 eV) eject core electrons with kinetic energy E_k, determining core binding energy via E_B = h*nu - E_k - Phi_spec. Chemical shifts in E_B reveal oxidation states and local chemical bonding environments within the top 1-10 nm.",
        "1. Governing equation: E_binding = h*nu_incident - E_kinetic - Phi (where Phi is spectrometer work function).\n"
        "2. Surface sensitivity: Although X-rays penetrate microns into materials, photoelectrons have an inelastic mean free path (IMFP) of only 1-3 nm, meaning only electrons escaping without energy loss from the top few atomic layers contribute to sharp core-level peaks.\n"
        "3. Chemical shifts: Higher positive oxidation state reduces core electron shielding from the nucleus, increasing core binding energy E_B (e.g., in carbon XPS, C-C/C-H appears at 284.8 eV as reference, C-O at ~286.5 eV, C=O at ~288.0 eV, and O-C=O at ~289.0 eV; for Ti, Ti(0) 2p_3/2 appears at 453.8 eV while Ti(IV) in TiO2 shifts upward to 458.8 eV by +5.0 eV).",
        "xps"
    ),
    (
        "spec_epr_g_factor",
        "Electron Paramagnetic Resonance (EPR) and Hyperfine Splitting",
        "What are the physical principles of EPR spectroscopy and how do g-factor and hyperfine coupling elucidate radical structures?",
        "EPR (or ESR) detects species with unpaired electron spins (free radicals, transition metal complexes) by measuring microwave resonant absorption in an external magnetic field B0: Delta E = h*nu = g * mu_B * B0. Hyperfine coupling between electron spin S and nearby nuclear spins I splits the EPR signal into 2*I + 1 lines.",
        "1. Zeeman splitting: In magnetic field B0, the two spin states of an unpaired electron (m_s = +1/2 and -1/2) split by Delta E = g * mu_B * B0 (where mu_B is Bohr magneton = 9.274 × 10^-24 J/T).\n"
        "2. The g-factor: For a free electron, g_e = 2.0023. In chemical radicals, spin-orbit coupling shifts g from 2.0023, providing a fingerprint of the orbital hosting the unpaired electron (organic carbon radicals g ~ 2.002-2.005; transition metals like Cu(II) g ~ 2.05-2.25).\n"
        "3. Hyperfine coupling (A): Interaction of the unpaired electron with nuclear magnetic moments of nuclei in the radical.\n"
        "   - One nucleus with spin I splits the peak into (2*I + 1) equal lines.\n"
        "   - For example, methyl radical (•CH3): Unpaired electron couples to three equivalent protons (I = 1/2), producing a 1:3:3:1 quartet with hyperfine splitting a_H = 23 Gauss (2.3 mT).\n"
        "   - For nitroxide spin labels (TEMPO): Coupling to 14N nucleus (I = 1) yields a characteristic 1:1:1 triplet.",
        "epr"
    ),
    (
        "spec_ms_isotope_patterns",
        "Mass Spectrometry Isotope Patterns: Chlorine and Bromine Signatures",
        "How are isotopic patterns in mass spectrometry used to detect chlorine and bromine atoms?",
        "Chlorine and bromine produce unique, unmistakable isotopic patterns in mass spectrometry due to the natural abundance of their stable isotopes: Chlorine (35Cl:37Cl ≈ 3:1) produces an M : M+2 doublet with a 3:1 intensity ratio; Bromine (79Br:81Br ≈ 1:1) produces an M : M+2 doublet of nearly equal intensity.",
        "1. Chlorine signature:\n"
        "   - One Cl atom: M and M+2 peaks in 100 : 32.5 ratio (~3:1).\n"
        "   - Two Cl atoms: M, M+2, and M+4 peaks in binomial ratio 9 : 6 : 1.\n"
        "   - Three Cl atoms (e.g. chloroform CHCl3): 27 : 27 : 9 : 1 ratio.\n"
        "2. Bromine signature:\n"
        "   - One Br atom: M and M+2 peaks in 100 : 97 ratio (~1:1 'twin peaks', 2 Da apart).\n"
        "   - Two Br atoms: M, M+2, and M+4 peaks in 1 : 2 : 1 ratio.\n"
        "3. Diagnostic power: Allows instant identification of halogenated compounds in crude mixtures and confirms molecular formulas when combined with high-resolution exact mass measurement.",
        "mass_spectrometry"
    ),
    (
        "spec_ir_diagnostic_regions",
        "Infrared Spectroscopy Diagnostic Absorption Regions",
        "Detail the four primary diagnostic regions of an Infrared spectrum from 4000 to 400 cm⁻¹.",
        "Infrared spectra divide into four distinct regions: 1. Single bonds to hydrogen (4000-2500 cm⁻¹), 2. Triple bonds (2500-2000 cm⁻¹), 3. Double bonds (2000-1500 cm⁻¹), and 4. The fingerprint region (1500-400 cm⁻¹).",
        "1. Single bonds to Hydrogen (4000-2500 cm⁻¹):\n"
        "   - Free O-H stretch: Sharp peak at 3600-3650 cm⁻¹.\n"
        "   - H-bonded alcohol O-H: Broad intense band at 3200-3500 cm⁻¹.\n"
        "   - Carboxylic acid O-H: Very broad envelope from 2500-3300 cm⁻¹ overlapping C-H.\n"
        "   - Primary amine N-H: Doublet at 3300-3500 cm⁻¹; secondary amine: singlet.\n"
        "   - sp C-H (terminal alkyne): Sharp strong peak at ~3300 cm⁻¹.\n"
        "   - sp2 C-H (alkene/aromatic): Sharp peaks just above 3000 cm⁻¹ (3010-3100 cm⁻¹).\n"
        "   - sp3 C-H (alkane): Intense peaks just below 3000 cm⁻¹ (2850-2960 cm⁻¹).\n"
        "2. Triple bonds (2500-2000 cm⁻¹):\n"
        "   - C≡C alkyne: 2100-2260 cm⁻¹ (weak or absent if centrosymmetric).\n"
        "   - C≡N nitrile: 2220-2260 cm⁻¹ (sharp, medium to strong).\n"
        "3. Double bonds (2000-1500 cm⁻¹):\n"
        "   - Carbonyl C=O: Intense absorption at 1650-1820 cm⁻¹.\n"
        "   - Alkene C=C: 1620-1680 cm⁻¹ (medium intensity).\n"
        "   - Aromatic C=C: Multiple sharp bands at 1450-1600 cm⁻¹.\n"
        "4. Fingerprint Region (1500-400 cm⁻¹): Complex bending and C-C/C-O skeletal vibrations unique to individual molecular structure.",
        "ir"
    ),
]


def generate_spectroscopy_records() -> List[ChemNovaRecord]:
    """Generate structured records for spectroscopy and structural analytics."""
    records = []
    source = "Silverstein Spectrometric Identification of Organic Compounds & NIST Chemistry WebBook"
    license_str = "CC-BY-4.0"

    for sid, title, q, a, reasoning, sub in SPECTROSCOPY_DATA:
        rec = ChemNovaRecord(
            id=f"{sid}",
            type=DatasetType.SPECTROSCOPY_INFORMATION,
            domain=ChemistryDomain.ANALYTICAL_CHEMISTRY,
            subdomain=f"spectroscopy/{sub}",
            question=q,
            answer=a,
            reasoning=reasoning,
            context=f"Technique: {title}\nDomain: Analytical Spectroscopy & Structural Elucidation",
            source=source,
            source_url="https://webbook.nist.gov/chemistry/",
            license=license_str,
            confidence=1.0,
            verified=True,
        )
        records.append(rec)

    return records
