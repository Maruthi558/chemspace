"""Fundamental chemistry principles corpus generator.

Covers:
- Atomic structure, quantum numbers, electron configurations
- Chemical bonding (ionic, covalent, metallic, coordinate, hydrogen bonding)
- VSEPR theory, hybridization, molecular orbital concepts
- Formal charge, resonance, polarity, intermolecular forces
- Solutions, acids and bases (Arrhenius, Brønsted-Lowry, Lewis), salts
- States of matter: gases, liquids, solids, and phase equilibria
"""

from typing import List
from chemistry_llm.data.schema.types import DatasetType, ChemistryDomain
from chemistry_llm.data.schema.record import ChemNovaRecord


def generate_fundamentals_records() -> List[ChemNovaRecord]:
    """Generate structured records for fundamental chemical concepts."""
    records = []
    source = "OpenStax Chemistry 2e & IUPAC Gold Book"
    license_str = "CC-BY-4.0"

    concepts = [
        (
            "fund_quant_numbers",
            "Quantum Numbers and Atomic Orbitals",
            "What are the four quantum numbers and what physical properties do they describe?",
            "The four quantum numbers are the principal quantum number (n), azimuthal/angular momentum quantum number (l), magnetic quantum number (m_l), and electron spin quantum number (m_s).",
            "1. Principal quantum number n (n = 1, 2, 3...) determines orbital energy and average radial distance from the nucleus.\n"
            "2. Angular momentum quantum number l (l = 0, 1... n-1) defines orbital shape (l=0 is s, l=1 is p, l=2 is d, l=3 is f).\n"
            "3. Magnetic quantum number m_l (m_l = -l... +l) specifies orbital spatial orientation (2l + 1 orientations per subshell).\n"
            "4. Spin quantum number m_s (m_s = +1/2 or -1/2) specifies intrinsic angular momentum and electron spin orientation.",
            "atomic_structure"
        ),
        (
            "fund_vsepr_theory",
            "Valence Shell Electron Pair Repulsion (VSEPR) Theory",
            "How does VSEPR theory predict molecular geometry from electron domains?",
            "VSEPR theory states that electron domains (bonding pairs and lone pairs) arrange around a central atom to minimize electrostatic repulsion, dictating molecular shape.",
            "Electron domain count dictates the electron-domain geometry:\n"
            "- 2 domains: Linear (180°)\n"
            "- 3 domains: Trigonal planar (120°)\n"
            "- 4 domains: Tetrahedral (109.5°)\n"
            "- 5 domains: Trigonal bipyramidal (90°, 120°)\n"
            "- 6 domains: Octahedral (90°)\n"
            "Non-bonding lone pairs exert greater electrostatic repulsion than bonding pairs due to proximity to the nucleus, compressing adjacent bond angles (e.g., in water H2O, 2 bonding pairs + 2 lone pairs produce a bent molecular geometry with a 104.5° bond angle).",
            "molecular_structure"
        ),
        (
            "fund_hybridization",
            "Orbital Hybridization (sp, sp2, sp3)",
            "Explain orbital hybridization in carbon compounds (sp, sp2, sp3) and their geometry.",
            "Orbital hybridization is the mathematical mixing of atomic orbitals (s and p) to create equivalent hybrid orbitals with optimal directional geometry for covalent bonding.",
            "- sp3 hybridization mixes one 2s and three 2p orbitals to form four equivalent sp3 hybrids arranged tetrahedrally at 109.5° (e.g., methane CH4, 4 sigma bonds).\n"
            "- sp2 hybridization mixes one 2s and two 2p orbitals to form three trigonal planar sp2 hybrids at 120°, leaving one unhybridized p orbital for pi bonding (e.g., ethene C2H4, 1 sigma + 1 pi double bond).\n"
            "- sp hybridization mixes one 2s and one 2p orbital to form two linear sp hybrids at 180°, leaving two unhybridized p orbitals for two perpendicular pi bonds (e.g., ethyne C2H2, 1 sigma + 2 pi triple bond).",
            "chemical_bonding"
        ),
        (
            "fund_mo_theory_o2",
            "Molecular Orbital Theory and O2 Paramagnetism",
            "Why is molecular oxygen (O2) paramagnetic according to Molecular Orbital (MO) Theory?",
            "Molecular oxygen (O2) is paramagnetic because its ground-state molecular orbital configuration contains two unpaired electrons with parallel spins in degenerate pi* antibonding orbitals.",
            "Valence electrons for O2 (12 valence electrons total):\n"
            "Configuration: (sigma_2s)^2 (sigma*_2s)^2 (sigma_2p)^2 (pi_2p_x)^2 (pi_2p_y)^2 (pi*_2p_x)^1 (pi*_2p_y)^1.\n"
            "By Hund's rule, the two electrons occupying the degenerate pi* antibonding orbitals enter singly with parallel spins (S = 1 triplet state). This electronic spin produces a permanent magnetic dipole moment, explaining why liquid oxygen is attracted into the magnetic field of a strong magnet—a fundamental observation that classical Lewis structures fail to predict.",
            "molecular_orbital_theory"
        ),
        (
            "fund_formal_charge",
            "Formal Charge Calculation and Lewis Structure Selection",
            "How is formal charge calculated and used to evaluate the most plausible Lewis structure?",
            "Formal Charge = (Valence electrons of free atom) - (Non-bonding valence electrons) - 0.5 * (Bonding electrons). The most plausible structure minimizes formal charges and places negative charges on the most electronegative atoms.",
            "When multiple non-equivalent Lewis structures can be drawn for a molecule or polyatomic ion, formal charge rules determine stability:\n"
            "1. Neutral molecules where all formal charges are zero are preferred.\n"
            "2. If non-zero formal charges exist, structures with smallest formal charges (+1, -1 rather than +2, -2) are more stable.\n"
            "3. Negative formal charges should reside on the most electronegative elements (e.g., oxygen over carbon).\n"
            "4. Adjacent like formal charges (+/+ or -/-) are unfavorable.",
            "chemical_bonding"
        ),
        (
            "fund_imf_types",
            "Intermolecular Forces (IMFs) and Physical Properties",
            "Compare the types and relative strengths of intermolecular forces.",
            "Intermolecular forces range in strength: Ion-dipole > Hydrogen bonding > Dipole-dipole > London dispersion forces.",
            "1. Ion-dipole forces: Electrostatic interaction between an ion and a polar molecule (e.g., hydrated Na+ in aqueous solution).\n"
            "2. Hydrogen bonding: Strong, specialized dipole-dipole attraction occurring when hydrogen is covalently bonded to highly electronegative, small atoms (N, O, F) and attracted to a lone pair on another N, O, or F atom (typical strength 10-40 kJ/mol).\n"
            "3. Dipole-dipole interactions: Electrostatic attraction between permanent molecular dipoles in polar molecules (e.g., HCl, acetone).\n"
            "4. London dispersion forces (LDF): Universal, transient induced-dipole attractions arising from temporary fluctuations in electron cloud polarization. Dispersion forces increase with molecular surface area and polarizability (number of electrons).",
            "intermolecular_forces"
        ),
        (
            "fund_acids_bases",
            "Definitions of Acids and Bases: Arrhenius, Brønsted-Lowry, and Lewis",
            "Distinguish between Arrhenius, Brønsted-Lowry, and Lewis acid-base theories.",
            "Arrhenius defines acids as H+ producers and bases as OH- producers in water; Brønsted-Lowry defines acids as proton donors and bases as proton acceptors; Lewis defines acids as electron-pair acceptors and bases as electron-pair donors.",
            "- Arrhenius (1884): Limited to aqueous systems (HCl → H+ + Cl-, NaOH → Na+ + OH-).\n"
            "- Brønsted-Lowry (1923): Generalizes to proton transfer in any medium, introducing conjugate acid-base pairs (e.g., NH3 + H2O ⇌ NH4+ + OH-).\n"
            "- Lewis (1923): Most comprehensive; encompasses reactions without proton transfer. A Lewis base donates an electron pair into an empty orbital of a Lewis acid to form a coordinate covalent bond (adduct), such as BF3 + :NH3 → F3B-NH3.",
            "acids_and_bases"
        ),
        (
            "fund_gas_laws_vdw",
            "Ideal Gas Law vs Van der Waals Equation of State",
            "How does the Van der Waals equation correct the ideal gas law for real gas behavior?",
            "The Van der Waals equation (P + a(n/V)^2)(V - nb) = nRT corrects the ideal gas law for intermolecular attractions (parameter a) and finite molecular excluded volume (parameter b).",
            "The ideal gas law PV = nRT assumes:\n"
            "1. Gas particles have zero volume.\n"
            "2. No intermolecular forces exist between particles.\n"
            "At high pressure and low temperature, real gases deviate significantly:\n"
            "- The term a(n/V)^2 adds an attraction correction because attractive forces pull particles inward, decreasing pressure exerted on container walls.\n"
            "- The term -nb subtracts the physical volume occupied by the gas molecules themselves from the container volume, leaving the true free volume available for motion.",
            "gases"
        ),
        (
            "fund_matter_classification",
            "Classification of Matter: Elements, Compounds, and Mixtures",
            "Explain the hierarchical classification of matter into pure substances and mixtures.",
            "Matter is classified into pure substances (elements and chemical compounds) with constant chemical composition, and mixtures (homogeneous solutions and heterogeneous mixtures) with variable composition separable by physical means.",
            "1. Pure Substances: Consist of a single type of matter with fixed chemical formula and characteristic physical properties.\n"
            "   - Elements: Cannot be decomposed into simpler substances by chemical means (e.g., Fe, O2, Au).\n"
            "   - Compounds: Chemical combinations of two or more elements in definite fixed proportions by mass, separable only by chemical reactions (e.g., H2O, NaCl, C6H12O6).\n"
            "2. Mixtures: Physical combinations of two or more pure substances that retain their distinct chemical identities:\n"
            "   - Homogeneous mixtures (Solutions): Uniform macroscopic composition throughout (e.g., air, saline solution, bronze alloy).\n"
            "   - Heterogeneous mixtures: Non-uniform composition with distinct microscopic or macroscopic phases (e.g., oil-water emulsion, granite rock, blood).",
            "fundamentals"
        ),
        (
            "fund_atomic_structure_models",
            "Evolution of Atomic Models: Dalton, Thomson, Rutherford, and Bohr",
            "Trace the historical development of atomic structure models from Dalton to Bohr.",
            "Atomic theory evolved from Dalton's solid indivisible spheres (1803), to Thomson's plum pudding model (1897), to Rutherford's dense positive nucleus (1911), to Bohr's quantized electron orbits (1913), culminating in modern quantum wave mechanics.",
            "1. Dalton (1803): Atoms are indestructible, indivisible particles; all atoms of an element are identical; chemical reactions are rearrangements of atoms.\n"
            "2. Thomson (1897): Discovered the electron via cathode ray tube experiments; proposed the 'plum pudding' model of electrons embedded in a uniform sphere of positive charge.\n"
            "3. Rutherford (1911): Alpha-particle gold foil scattering demonstrated that the atom is mostly empty space with mass concentrated in a tiny, dense, positively charged nucleus.\n"
            "4. Bohr (1913): Applied Planck's quantum hypothesis, postulating electrons occupy discrete quantized stationary angular momentum orbits (L = n*h/2pi) where radiation is emitted only during transitions: Delta E = h*nu = E_final - E_initial.",
            "atoms"
        ),
        (
            "fund_aufbau_hund_pauli",
            "Electron Configuration Rules: Aufbau Principle, Pauli Exclusion, and Hund's Rule",
            "State the three core principles governing ground-state electron configurations in multi-electron atoms.",
            "The ground-state electron configuration is determined by the Aufbau principle (lowest energy orbitals fill first), the Pauli exclusion principle (maximum two electrons per orbital with opposite spins), and Hund's rule of maximum multiplicity (degenerate orbitals fill singly with parallel spins first).",
            "1. Aufbau Principle ('building up' in German): Orbitals are filled in order of increasing orbital energy according to the Madelung (n + l) rule. If two orbitals have identical (n + l), the orbital with lower n fills first (e.g., 4s fills before 3d).\n"
            "2. Pauli Exclusion Principle (1925): No two electrons in an atom can have the identical set of four quantum numbers (n, l, m_l, m_s). Consequently, each spatial orbital can hold at most two electrons with antiparallel spins (m_s = +1/2 and -1/2).\n"
            "3. Hund's Rule: For degenerate orbitals (e.g., the three 2p orbitals), the lowest energy state maximizes total spin multiplicity (electrons occupy separate orbitals with parallel spins to minimize electron-electron Coulombic repulsion and maximize quantum exchange energy).",
            "atomic_structure"
        ),
        (
            "fund_solutions_solubility_thermo",
            "Thermodynamics of Solutions and Raoult's Law",
            "Explain the thermodynamic driving forces of dissolution and state Raoult's Law for ideal solutions.",
            "Dissolution is governed by Delta G_soln = Delta H_soln - T * Delta S_soln, where Delta H_soln = Delta H_solute-solute + Delta H_solvent-solvent + Delta H_solvation. Raoult's Law states that the partial vapor pressure of solvent over a solution equals the pure solvent vapor pressure multiplied by its mole fraction: P_A = X_A * P°_A.",
            "1. Enthalpy of Solution (Delta H_soln):\n"
            "   - Endothermic step 1: Overcoming solute-solute lattice attractions (Delta H_lattice > 0).\n"
            "   - Endothermic step 2: Separating solvent molecules to create cavities (Delta H_solvent > 0).\n"
            "   - Exothermic step 3: Solute-solvent solvation interactions (Delta H_hydration < 0).\n"
            "   - If solvation energy matches or exceeds lattice energy, dissolution is enthalpically favorable. Even if slightly endothermic, positive entropy of mixing (Delta S_soln > 0) drives spontaneous dissolution at high temperature.\n"
            "2. Raoult's Law: For ideal solutions where intermolecular forces between unlike molecules equal those between like molecules, vapor pressure is directly proportional to solvent mole fraction: P_total = X_A * P°_A + X_B * P°_B. Deviations occur when solute-solvent attractions are stronger (negative deviation) or weaker (positive deviation) than pure components.",
            "solutions"
        ),
        (
            "fund_colligative_properties",
            "Colligative Properties and the Van 't Hoff Factor",
            "What are colligative properties and how does the van 't Hoff factor quantify electrolyte dissociation?",
            "Colligative properties depend solely on the number of dissolved solute particles relative to solvent molecules, not on their chemical identity. The van 't Hoff factor (i) accounts for ionic dissociation in freezing point depression (Delta Tf = i * Kf * m), boiling point elevation (Delta Tb = i * Kb * m), and osmotic pressure (Pi = i * M * R * T).",
            "1. Vapor Pressure Lowering: Dissolved non-volatile solute particles reduce the concentration of solvent molecules at the liquid-gas interface and stabilize the liquid state entropically, lowering vapor pressure according to Raoult's Law (Delta P = X_solute * P°_solvent).\n"
            "2. Boiling Point Elevation (Delta Tb = i * Kb * m): Because vapor pressure is lowered, higher temperature is required for liquid vapor pressure to match atmospheric pressure.\n"
            "3. Freezing Point Depression (Delta Tf = i * Kf * m): Solute particles disrupt crystalline lattice formation of the solid solvent, depressing freezing temperature.\n"
            "4. Osmotic Pressure (Pi = i * MRT): Hydrostatic pressure required to prevent net solvent flow across a semipermeable membrane into the solution.\n"
            "5. Van 't Hoff factor i = (actual moles of particles in solution) / (moles of solute dissolved). For non-electrolytes (glucose), i = 1; for strong electrolytes (NaCl), ideal i = 2, though real solutions have slightly lower i due to ion pairing.",
            "solutions"
        ),
        (
            "fund_metallic_bonding",
            "Metallic Bonding: Electron Sea Model and Band Theory",
            "Contrast the electron sea model and modern electronic band theory in explaining metallic electrical and thermal conductivity.",
            "The electron sea model describes metals as an array of positive metal ions immersed in a delocalized pool of valence electrons, while band theory explains conduction via partially filled valence bands or overlapping valence and conduction bands with zero band gap.",
            "1. Electron Sea Model (Drude-Lorentz): Valence electrons detach from individual metal atoms and form a freely moving electron gas surrounding rigid lattice cations. Explains ductility and malleability: lattice planes can slide past one another without electrostatic cleavage because the flexible electron pool maintains continuous nondirectional bonding.\n"
            "2. Band Theory: In an infinite crystal lattice of N atoms, overlapping atomic orbitals split into continuous energy bands containing closely spaced molecular orbitals:\n"
            "   - In conductors (metals): The highest occupied band (valence band) is only partially filled (e.g. alkali metals), or the valence band overlaps directly with an empty conduction band (alkaline earth metals), allowing electrons to accelerate under tiny electric potentials.\n"
            "   - In semiconductors: A small band gap Eg (<3 eV) separates filled valence and empty conduction bands, enabling thermal excitation.\n"
            "   - In insulators: A large band gap Eg (>5 eV) prevents electronic excitation.",
            "chemical_bonding"
        ),
        (
            "fund_born_haber_lattice_energy",
            "Lattice Energy and the Born-Haber Thermodynamic Cycle",
            "Define lattice energy and demonstrate how the Born-Haber cycle uses Hess's Law to calculate it for an ionic solid like NaCl.",
            "Lattice energy (Delta H_lattice) is the energy released when gaseous ions combine to form one mole of an ionic crystalline solid: Na+(g) + Cl-(g) → NaCl(s). The Born-Haber cycle calculates it indirectly from measurable thermodynamic steps using Hess's Law.",
            "Born-Haber cycle for sodium chloride formation from elements: Na(s) + 1/2 Cl2(g) → NaCl(s) (Delta H°_f = -411 kJ/mol).\n"
            "The thermodynamic steps are:\n"
            "1. Sublimation of solid sodium: Na(s) → Na(g) (Delta H_sub = +107 kJ/mol)\n"
            "2. First ionization of sodium: Na(g) → Na+(g) + e- (IE1 = +496 kJ/mol)\n"
            "3. Bond dissociation of chlorine gas: 1/2 Cl2(g) → Cl(g) (1/2 Delta H_bond = +122 kJ/mol)\n"
            "4. Electron affinity of chlorine: Cl(g) + e- → Cl-(g) (EA = -349 kJ/mol)\n"
            "5. Lattice formation: Na+(g) + Cl-(g) → NaCl(s) (Delta H_lattice)\n"
            "By Hess's Law: Delta H°_f = Delta H_sub + IE1 + 1/2 Delta H_bond + EA + Delta H_lattice.\n"
            "Solving: Delta H_lattice = -411 - (107 + 496 + 122 - 349) = -787 kJ/mol (strongly exothermic, electrostatic Coulomb attraction).",
            "chemical_bonding"
        ),
        (
            "fund_phase_diagrams",
            "States of Matter, Phase Diagrams, and the Triple Point",
            "Explain the features of a single-component phase diagram, including phase boundary curves, the triple point, and the critical point.",
            "A phase diagram maps the thermodynamically stable phases (solid, liquid, gas) of a substance as a function of temperature and pressure. Key landmarks are phase coexistence boundaries, the triple point (three phases coexist in equilibrium), and the critical point (liquid and gas merge into a supercritical fluid).",
            "1. Sublimation Curve: Boundary between solid and gas phases, governed by the Clausius-Clapeyron relation.\n"
            "2. Vaporization Curve: Boundary between liquid and gas; terminates at the Critical Point (Tc, Pc), beyond which surface tension vanishes and matter exists as a dense supercritical fluid possessing liquid-like solvent power and gas-like diffusivity.\n"
            "3. Melting (Fusion) Curve: Boundary between solid and liquid.\n"
            "   - For almost all substances, the fusion curve has a positive slope (dP/dT > 0), because the solid phase is denser than the liquid.\n"
            "   - For water (H2O), the fusion curve has an anomalous negative slope (dP/dT < 0) due to its open hexagonal ice crystal lattice being less dense than liquid water; increasing pressure lowers the melting point.\n"
            "4. Triple Point: Unique temperature and pressure where all three phases coexist in mutual thermodynamic equilibrium (e.g., for water: T = 273.16 K, P = 611.65 Pa). Gibbs Phase Rule dictates zero degrees of freedom (F = C - P + 2 = 1 - 3 + 2 = 0, invariant point).",
            "solids"
        ),
        (
            "fund_const_gas_constant",
            "The Universal Gas Constant (R)",
            "What is the physical significance and value of the Universal Gas Constant R in various scientific unit systems?",
            "The universal gas constant R = 8.314462618 J/(mol*K) is the fundamental constant of proportionality connecting energy, temperature, and amount of substance across thermodynamics and statistical mechanics.",
            "1. SI value: R = 8.314462618 J/(mol*K) = 8.314462618 kPa*L/(mol*K) = N_A * k_B.\n"
            "2. Atm-L value: R = 0.082057366 L*atm/(mol*K) (essential for ideal gas law calculations in atmospheres).\n"
            "3. Caloric value: R = 1.987204 cal/(mol*K).\n"
            "4. Physical meaning: R represents the molar work done by an expanding ideal gas per kelvin temperature increase at constant pressure.",
            "constants"
        ),
        (
            "fund_const_avogadro",
            "Avogadro's Constant (N_A)",
            "What is the exact definition and modern SI value of Avogadro's constant?",
            "Avogadro's constant N_A = 6.02214076 x 10^23 mol^-1 is defined under the 2019 SI redefinition as exactly 6.02214076 x 10^23 elementary entities per mole.",
            "1. Exact value: Exactly 6.02214076 x 10^23 reciprocal moles (zero experimental uncertainty).\n"
            "2. Purpose: Connects the macroscopic microscopic atomic scale (unified atomic mass unit, dalton) to macroscopic laboratory quantities (grams).\n"
            "3. One mole of any substance contains exactly N_A specified constituent particles (atoms, molecules, ions, electrons).",
            "constants"
        ),
        (
            "fund_const_planck",
            "Planck's Constant (h)",
            "State the exact value and quantum mechanical significance of Planck's constant.",
            "Planck's constant h = 6.62607015 x 10^-34 J*s (and reduced Planck constant hbar = 1.054571817 x 10^-34 J*s) is the fundamental quantum of action governing quantization of light and matter.",
            "1. Exact value: Exactly 6.62607015 x 10^-34 J*s.\n"
            "2. Photon energy relation: E = h*nu = h*c / lambda.\n"
            "3. De Broglie wavelength: lambda = h / p.\n"
            "4. Commutation and uncertainty: Heisenberg uncertainty principle dictates Delta x * Delta p >= hbar / 2.",
            "constants"
        ),
        (
            "fund_const_faraday",
            "Faraday's Constant (F)",
            "Define Faraday's constant and its relationship to elementary electric charge.",
            "Faraday's constant F = 96485.33212 C/mol is the magnitude of electric charge per mole of electrons, given by F = N_A * e.",
            "1. Exact calculated value: F = 6.02214076 x 10^23 mol^-1 * 1.602176634 x 10^-19 C = 96485.3321233 C/mol.\n"
            "2. Practical use: Used in electrochemistry to relate current and electrolysis time to moles of chemical substance transformed: n = I * t / (n_e * F).\n"
            "3. Relates electrical potential to Gibbs free energy: Delta G° = -n * F * E°.",
            "constants"
        ),
        (
            "fund_const_boltzmann",
            "Boltzmann's Constant (k_B)",
            "Define Boltzmann's constant and explain its role as the bridge between microscopic microstates and macroscopic temperature.",
            "Boltzmann's constant k_B = 1.380649 x 10^-23 J/K relates the average microscopic kinetic energy of particles in a gas to thermodynamic temperature T, given by k_B = R / N_A.",
            "1. Exact value: Exactly 1.380649 x 10^-23 J/K.\n"
            "2. Statistical entropy: Boltzmann entropy formula S = k_B * ln(Omega), where Omega is the number of accessible microstates.\n"
            "3. Thermal energy scale: Average kinetic energy per translational degree of freedom of a particle is (1/2) * k_B * T.",
            "constants"
        ),
        (
            "fund_form_ideal_gas",
            "The Ideal Gas Equation of State (PV = nRT)",
            "State the ideal gas equation and summarize its constituent empirical gas laws.",
            "The ideal gas law PV = nRT relates pressure P, volume V, moles n, and absolute temperature T through the universal gas constant R.",
            "Combines four empirical gas laws:\n"
            "1. Boyle's Law: P proportional to 1/V (constant n, T).\n"
            "2. Charles's Law: V proportional to T (constant n, P).\n"
            "3. Gay-Lussac's Law: P proportional to T (constant n, V).\n"
            "4. Avogadro's Law: V proportional to n (constant P, T).\n"
            "Valid for gases at low pressure and high temperature where molecular volume and intermolecular forces are negligible.",
            "formulas"
        ),
        (
            "fund_form_gibbs_free_energy",
            "The Gibbs Free Energy Equation (Delta G = Delta H - T Delta S)",
            "State the fundamental Gibbs free energy equation and explain its thermodynamic significance for chemical spontaneity.",
            "Delta G = Delta H - T * Delta S defines the change in Gibbs free energy at constant temperature and pressure, establishing the universal criterion for thermodynamic spontaneity (Delta G < 0).",
            "1. Delta H: Enthalpy change, reflecting heat absorbed or released due to chemical bond reorganization.\n"
            "2. Delta S: Entropy change, reflecting changes in thermal energy dispersion and positional randomness.\n"
            "3. Spontaneity condition: Spontaneous if Delta G < 0; at equilibrium when Delta G = 0; non-spontaneous (endergonic) if Delta G > 0.\n"
            "4. Connection to equilibrium: Delta G° = -R * T * ln(K_eq).",
            "formulas"
        ),
        (
            "fund_form_nernst_equation",
            "The Nernst Equation for Electrochemical Potential",
            "State the Nernst equation in natural log and log10 form at 298.15 K.",
            "The Nernst equation E = E° - (RT / nF) * ln(Q) calculates non-standard cell potential, simplifying at 298.15 K to E = E° - (0.05916 V / n) * log10(Q).",
            "1. Parameters: E is cell potential, E° is standard potential, R = 8.314 J/(mol*K), T is temperature in K, n is moles of electrons, F = 96485 C/mol, Q is reaction quotient.\n"
            "2. Concentration cells: Explains how potential difference develops purely from concentration gradients across two half-cells.\n"
            "3. pH meters: Direct linear relationship between electrode potential and hydronium activity: Delta E = 0.05916 V per pH unit.",
            "formulas"
        ),
        (
            "fund_form_henderson_hasselbalch",
            "The Henderson-Hasselbalch Equation for Buffer Solutions",
            "State the Henderson-Hasselbalch equation and explain its domain of validity for buffer solutions.",
            "The Henderson-Hasselbalch equation pH = pKa + log10([A-] / [HA]) computes the pH of an acid-base buffer from weak acid pKa and conjugate base/acid concentration ratio.",
            "1. Derivation: Derived by taking the negative logarithm of the acid dissociation constant Ka = [H3O+][A-] / [HA].\n"
            "2. Buffer capacity: Buffer capacity is maximal when [A-] = [HA], at which pH = pKa.\n"
            "3. Effective buffering range: Valid within pH = pKa ± 1.\n"
            "4. Assumptions: Assumes equilibrium concentrations [A-] and [HA] equal their initial analytical concentrations, valid when [HA] and [A-] are >> Ka and >> Kw/[H3O+].",
            "formulas"
        ),
        (
            "fund_form_arrhenius_equation",
            "The Arrhenius Equation for Chemical Kinetics",
            "State the Arrhenius equation and its linear logarithmic form.",
            "The Arrhenius equation k = A * exp(-Ea / RT) (linear form: ln k = ln A - Ea / (RT)) describes the temperature dependence of reaction rate constants.",
            "1. Rate constant k increases exponentially with absolute temperature T.\n"
            "2. Activation energy Ea represents the minimum kinetic energy colliding molecules must possess to surmount the reaction barrier.\n"
            "3. Linear Arrhenius plot: A plot of ln(k) vs 1/T yields a slope of -Ea / R and an intercept of ln(A).\n"
            "4. Two-point equation: ln(k2 / k1) = -(Ea / R) * (1/T2 - 1/T1).",
            "formulas"
        ),
        (
            "fund_form_beer_lambert",
            "The Beer-Lambert Law for Spectrophotometry",
            "State the Beer-Lambert law equation and define each term with standard units.",
            "The Beer-Lambert law A = epsilon * b * c describes the linear attenuation of light through an absorbing medium, where A is absorbance (dimensionless), epsilon is molar absorptivity (L/(mol*cm)), b is optical path length (cm), and c is concentration (mol/L).",
            "1. Absorbance definition: A = -log10(I / I0) = log10(100 / %T).\n"
            "2. Linearity range: Typically linear between A = 0.1 and A = 1.0 (transmittance 80% to 10%).\n"
            "3. Limitations: Deviates at high concentration (c > 0.01 M) due to electrostatic interactions, stray light, and polychromatic radiation.",
            "formulas"
        ),
        (
            "fund_unit_mole_definition",
            "The Mole as the SI Base Unit of Chemical Amount",
            "Define the mole under the modern 2019 SI redefinition and contrast it with the pre-2019 carbon-12 definition.",
            "The mole (symbol: mol) is the SI base unit of amount of substance, containing exactly 6.02214076 x 10^23 elementary entities.",
            "1. Modern SI definition (since May 20, 2019): The mole is defined by taking the fixed numerical value of the Avogadro constant N_A to be exactly 6.02214076 x 10^23 when expressed in the unit mol^-1.\n"
            "2. Pre-2019 definition: Previously defined as the amount of substance containing as many elementary entities as there are atoms in exactly 0.012 kg (12 g) of unbound carbon-12 at rest in ground state.\n"
            "3. Decoupling: Modern definition completely decouples the mole from the kilogram prototype, making it an independent fundamental counting unit.",
            "units"
        ),
        (
            "fund_unit_pressure_conversions",
            "Pressure Units and Standard Atmospheric Conversions",
            "Provide the exact conversion factors between atmospheres, pascals, bars, torrs, and pounds per square inch (psi).",
            "Standard atmospheric pressure is defined as exactly 1 atm = 101325 Pa = 101.325 kPa = 1.01325 bar = 760 Torr = 760 mmHg = 14.696 psi.",
            "1. Pascal (Pa): The SI derived unit of pressure, equal to 1 newton per square meter (1 N/m^2).\n"
            "2. Bar: 1 bar = exactly 100000 Pa = 100 kPa = 0.986923 atm. IUPAC standard state pressure is defined as exactly 1 bar (100 kPa).\n"
            "3. Torr: 1 Torr = exactly 1/760 atm ≈ 133.322 Pa. Historically defined by Evangelista Torricelli as the height of 1 mm of mercury column (1 mmHg at 0 °C).\n"
            "4. Atmosphere (atm): Standard atmospheric pressure at sea level = exactly 101325 Pa.",
            "units"
        ),
        (
            "fund_unit_energy_conversions",
            "Energy Units in Chemistry and Thermochemical Conversions",
            "Detail the conversion factors between Joules, calories, electron-volts, and Hartree atomic units.",
            "The primary energy units in chemistry convert as: 1 cal = exactly 4.184 J, 1 eV = 1.602176634 x 10^-19 J = 96.4853 kJ/mol, and 1 Hartree = 27.2114 eV = 2625.5 kJ/mol = 627.51 kcal/mol.",
            "1. Joule (J): The SI unit of energy (1 J = 1 kg*m^2/s^2 = 1 N*m = 1 W*s).\n"
            "2. Thermochemical Calorie (cal): Exactly 4.184 J, historically defined as heat needed to raise 1 g of water by 1 °C.\n"
            "3. Electron-Volt (eV): Energy gained by one electron accelerating across a 1 volt potential difference: 1 eV = 1.602176634 x 10^-19 J. On a molar basis, 1 eV per molecule = 96.485 kJ/mol.\n"
            "4. Chemical accuracy: In computational chemistry, 'chemical accuracy' is conventionally defined as ±1 kcal/mol (±4.184 kJ/mol).",
            "units"
        ),
        (
            "fund_unit_concentration_types",
            "Chemical Concentration Expressions: Molarity, Molality, Normality, and Mole Fraction",
            "Define and contrast Molarity (M), Molality (m), Normality (N), and Mole Fraction (X), noting temperature dependence.",
            "Molarity (M = mol solute / L solution) and Normality (N = eq solute / L solution) are volume-dependent and change with temperature; Molality (m = mol solute / kg solvent) and Mole Fraction (X = mol_i / total mol) are mass-based and strictly temperature-independent.",
            "1. Molarity (M, mol/L): Most common laboratory concentration unit; expands/contracts with temperature variations as liquid volume changes.\n"
            "2. Molality (m, mol/kg): Essential for colligative property calculations (freezing point depression, boiling point elevation) because solvent mass does not change with temperature.\n"
            "3. Mole Fraction (X_i): Dimensionless ratio of moles of component i to total moles in mixture; used in gas partial pressures (Dalton's Law) and vapor pressures (Raoult's Law).\n"
            "4. Normality (N, eq/L): Equivalents of reactive species per liter (e.g. 1 M H2SO4 = 2 N acid for neutralization; 1 M KMnO4 = 5 N in acidic redox).",
            "units"
        ),
    ]

    for cid, title, q, a, reasoning, sub in concepts:
        rec = ChemNovaRecord(
            id=f"{cid}",
            type=DatasetType.CHEMISTRY_CONCEPTS,
            domain=ChemistryDomain.GENERAL_CHEMISTRY,
            subdomain=sub,
            question=q,
            answer=a,
            reasoning=reasoning,
            context=f"Concept: {title}\nDomain: Fundamental Physical and Inorganic Principles",
            source=source,
            source_url="https://openstax.org/details/books/chemistry-2e",
            license=license_str,
            confidence=1.0,
            verified=True,
        )
        records.append(rec)

    return records
