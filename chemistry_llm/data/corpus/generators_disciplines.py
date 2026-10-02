"""Disciplinary chemistry corpus generator.

Covers:
- Organic Chemistry: Functional groups, aromaticity, pericyclic rules
- Inorganic Chemistry: Coordination complexes, Crystal Field Theory, d-orbital splitting
- Physical Chemistry: Thermodynamics (Delta G, Delta H, Delta S), Kinetics (Arrhenius), Electrochemistry (Nernst equation)
- Quantum & Computational Chemistry: Schrödinger equation, DFT, Hartree-Fock, basis sets, Potential Energy Surfaces
"""

from typing import List
from chemistry_llm.data.schema.types import DatasetType, ChemistryDomain
from chemistry_llm.data.schema.record import ChemNovaRecord

DISCIPLINES_DATA = [
    # Inorganic / Coordination Chemistry
    (
        "inorg_cft_octahedral",
        DatasetType.INORGANIC_CHEMISTRY,
        ChemistryDomain.INORGANIC_CHEMISTRY,
        "coordination_chemistry",
        "Crystal Field Theory: d-Orbital Splitting in Octahedral Complexes",
        "Explain how d-orbitals split in an octahedral ligand field and distinguish between high-spin and low-spin configurations.",
        "In an octahedral crystal field, the five degenerate d-orbitals split into a lower-energy triply degenerate t2g set (d_xy, d_xz, d_yz) and a higher-energy doubly degenerate eg set (d_z2, d_x2-y2) separated by the crystal field splitting energy (Delta_oct).",
        "1. Electrostatic repulsion from six point-charge ligands along the x, y, and z Cartesian axes destabilizes the eg orbitals pointing directly at ligands.\n"
        "2. The t2g orbitals point between Cartesian axes, experiencing less repulsion and stabilizing relative to the barycenter (-0.4 Delta_oct for t2g, +0.6 Delta_oct for eg).\n"
        "3. High-spin vs Low-spin: If Delta_oct < P (pairing energy), electrons occupy eg orbitals before pairing in t2g (weak-field ligands such as I-, Br-, Cl-, F-).\n"
        "4. If Delta_oct > P, electrons pair completely in t2g before occupying eg (strong-field ligands such as CN-, CO, NO+)."
    ),
    # Physical Chemistry / Thermodynamics
    (
        "phys_gibbs_spontaneity",
        DatasetType.PHYSICAL_CHEMISTRY,
        ChemistryDomain.PHYSICAL_CHEMISTRY,
        "thermodynamics",
        "Gibbs Free Energy and Chemical Spontaneity Criteria",
        "State the Gibbs-Helmholtz relation and explain the conditions under which a chemical process is thermodynamically spontaneous.",
        "A process at constant temperature and pressure is spontaneous if the change in Gibbs free energy is negative (Delta G < 0), governed by Delta G = Delta H - T * Delta S.",
        "- When Delta H < 0 (exothermic) and Delta S > 0 (entropy increases), Delta G is negative at all temperatures (always spontaneous).\n"
        "- When Delta H > 0 (endothermic) and Delta S < 0 (entropy decreases), Delta G is positive at all temperatures (never spontaneous).\n"
        "- When Delta H < 0 and Delta S < 0, Delta G < 0 only at low temperatures where |Delta H| > T|Delta S|.\n"
        "- When Delta H > 0 and Delta S > 0, Delta G < 0 only at high temperatures where T*Delta S exceeds Delta H (entropy-driven process, such as vaporization)."
    ),
    # Physical Chemistry / Kinetics
    (
        "phys_arrhenius_kinetics",
        DatasetType.PHYSICAL_CHEMISTRY,
        ChemistryDomain.PHYSICAL_CHEMISTRY,
        "chemical_kinetics",
        "Arrhenius Equation and Activation Energy",
        "What is the physical meaning of each parameter in the Arrhenius equation k = A * exp(-Ea / RT)?",
        "In the Arrhenius equation, k is the reaction rate constant, A is the pre-exponential frequency factor, Ea is the activation energy, R is the universal gas constant (8.314 J/(mol*K)), and T is absolute temperature (K).",
        "- The exponential factor exp(-Ea / RT) represents the fraction of molecular collisions possessing kinetic energy equal to or greater than the activation energy Ea.\n"
        "- The pre-exponential factor A accounts for total collision frequency (Z) and the steric factor (P), representing the probability that collisions occur with proper spatial orientation (A = P * Z).\n"
        "- Plotting ln(k) vs 1/T yields a straight line with slope -Ea / R and y-intercept ln(A), allowing experimental determination of activation energy."
    ),
    # Physical Chemistry / Electrochemistry
    (
        "phys_nernst_equation",
        DatasetType.PHYSICAL_CHEMISTRY,
        ChemistryDomain.PHYSICAL_CHEMISTRY,
        "electrochemistry",
        "The Nernst Equation and Concentration-Dependent Cell Potential",
        "State the Nernst equation and explain how it calculates reduction potential under non-standard conditions.",
        "The Nernst equation E = E° - (RT / nF) * ln(Q) computes electrochemical cell potential under non-standard concentrations, where E° is standard cell potential, n is moles of electrons transferred, F is Faraday's constant (96485 C/mol), and Q is the reaction quotient.",
        "At 298.15 K (25 °C), converting the natural logarithm to base 10 gives the common form: E = E° - (0.0592 V / n) * log10(Q).\n"
        "1. When Q < 1 (reactants dominate), E > E°, increasing cell voltage.\n"
        "2. When Q > 1 (products accumulate), E < E°, reducing cell voltage.\n"
        "3. At chemical equilibrium, Q = K_eq and E = 0 V, yielding the fundamental thermodynamic connection: E° = (RT / nF) * ln(K_eq)."
    ),
    # Quantum Chemistry
    (
        "quant_schrodinger_postulates",
        DatasetType.QUANTUM_CHEMISTRY,
        ChemistryDomain.COMPUTATIONAL_CHEMISTRY,
        "quantum_mechanics",
        "Time-Independent Schrödinger Equation and Electronic Wavefunctions",
        "State the time-independent Schrödinger equation and explain the physical interpretation of the electronic wavefunction Psi.",
        "The time-independent Schrödinger equation is H_hat * Psi = E * Psi, where H_hat is the Hamiltonian operator, Psi is the wavefunction, and E is the total energy eigenvalue of the stationary state.",
        "1. The Hamiltonian operator H_hat represents the sum of kinetic energy operators for electrons and nuclei plus electrostatic Coulomb potential interactions (electron-nuclear attraction, electron-electron repulsion, nuclear-nuclear repulsion).\n"
        "2. According to Born's probabilistic interpretation, the square of the wavefunction magnitude |Psi(r)|^2 * dr represents the probability density of finding electrons within spatial volume dr.\n"
        "3. Valid wavefunctions must be single-valued, continuous, quadratically integrable, and normalized (integral of |Psi|^2 over all space equals 1)."
    ),
    # Computational Chemistry
    (
        "comp_dft_kohn_sham",
        DatasetType.COMPUTATIONAL_CHEMISTRY,
        ChemistryDomain.COMPUTATIONAL_CHEMISTRY,
        "density_functional_theory",
        "Density Functional Theory (DFT) and Kohn-Sham Approach",
        "What is the foundational premise of Density Functional Theory (DFT) and the Kohn-Sham formulation?",
        "DFT is founded on the Hohenberg-Kohn theorems, establishing that the ground-state properties and total energy of an electronic system are uniquely determined by its ground-state electron density rho(r) rather than the multi-electron wavefunction.",
        "1. First Hohenberg-Kohn theorem: The external potential V_ext(r) is a unique functional of ground-state electron density rho(r), which depends on only 3 spatial coordinates regardless of system size.\n"
        "2. Second Hohenberg-Kohn theorem: The true ground-state electron density minimizes the total energy functional.\n"
        "3. Kohn-Sham approach: Replaces the complex interacting electron system with an equivalent non-interacting reference system experiencing an effective local potential (V_KS), incorporating Hartree electronic Coulomb repulsion and an exchange-correlation functional (E_xc), drastically reducing computational complexity from O(3N) to O(N^3)."
    ),
    # Inorganic / Organometallics: 18-Electron Rule
    (
        "inorg_18_electron_rule",
        DatasetType.INORGANIC_CHEMISTRY,
        ChemistryDomain.INORGANIC_CHEMISTRY,
        "organometallics",
        "The 18-Electron Rule in Organometallic Chemistry",
        "Explain the theoretical basis and application of the 18-electron rule in transition metal complexes.",
        "The 18-electron rule states that thermodynamically stable transition metal organometallic complexes achieve a closed-shell electronic configuration possessing 18 valence electrons (nine valence orbitals: one s, three p, five d), analogous to the octet rule for main-group elements.",
        "1. Orbital basis: The metal valence shell consists of ns (1 orbital), np (3 orbitals), and (n-1)d (5 orbitals) = 9 orbitals accommodating a maximum of 18 electrons in bonding and non-bonding states.\n"
        "2. Neutral Counting Method: Metal valence electrons (group number) + sum of electrons donated by neutral ligands (CO = 2e-, PPh3 = 2e-, eta5-Cp = 5e-, hydride H = 1e-, Cl = 1e-, alkyl = 1e-).\n"
        "3. Example: Ferrocene Fe(eta5-C5H5)2: Fe(0) has 8 electrons; two cyclopentadienyl radicals donate 2 × 5 = 10 electrons. Total = 18 electrons (closed shell, diamagnetic, exceptionally stable).\n"
        "4. Deviations: Common in early transition metals (steric crowding prevents 18e-) and square planar d8 metals (Pt(II), Pd(II), Rh(I)), which favor 16-electron configurations due to a high-energy empty d_x2-y2 orbital."
    ),
    # Inorganic / Coordination: Jahn-Teller Effect
    (
        "inorg_jahn_teller_effect",
        DatasetType.INORGANIC_CHEMISTRY,
        ChemistryDomain.INORGANIC_CHEMISTRY,
        "coordination_chemistry",
        "The Jahn-Teller Theorem in Octahedral Complexes",
        "State the Jahn-Teller theorem and explain tetragonal distortion in octahedral d9 copper(II) complexes.",
        "The Jahn-Teller theorem states that any non-linear molecular system in a spatially degenerate electronic ground state will spontaneously undergo geometric distortion that removes the degeneracy and lowers the overall system energy.",
        "1. In octahedral d9 Cu(II) (e.g., [Cu(H2O)6]2+), the electronic configuration is (t2g)^6 (eg)^3.\n"
        "2. The single vacancy in the doubly degenerate eg set (d_z2, d_x2-y2) creates orbital degeneracy.\n"
        "3. To remove degeneracy, the complex typically elongates along the z-axis (tetragonal elongation / z-out): axial ligands move outward, stabilizing the d_z2 orbital (and lowering its energy) while destabilizing d_x2-y2.\n"
        "4. Two electrons occupy the stabilized d_z2 and only one occupies the destabilized d_x2-y2, achieving a net stabilization energy (Jahn-Teller stabilization energy). This explains why Cu(II) complexes have two abnormally long axial bonds and four short equatorial bonds."
    ),
    # Bioinorganic: Oxygen Binding in Hemoglobin
    (
        "inorg_bio_hemoglobin_cooperativity",
        DatasetType.INORGANIC_CHEMISTRY,
        ChemistryDomain.BIOCHEMISTRY,
        "bioinorganic_chemistry",
        "Bioinorganic Chemistry of Hemoglobin: Allosteric Cooperativity and Spin Transition",
        "Explain the bioinorganic mechanism of reversible oxygen binding in hemoglobin and the trigger for allosteric cooperativity.",
        "In deoxygenated hemoglobin, five-coordinate Fe(II) is high-spin (S = 2, d6) with electrons in antibonding eg orbitals, making the iron radius too large (0.78 Å) to fit into the heme porphyrin ring. Upon O2 binding, iron converts to low-spin (S = 0), shrinking by 0.17 Å and pulling the proximal histidine into the porphyrin plane, triggering a quaternary T-to-R transition with positive cooperativity.",
        "1. Deoxyhemoglobin (T-state): High-spin Fe(II) (t2g^4 eg^2) lies ~0.4 Å out of the porphyrin plane toward the proximal histidine (His F8).\n"
        "2. Oxygenation: O2 binds end-on to Fe(II), forming a low-spin Fe(III)-superoxide (O2•-) adduct (t2g^6 eg^0). The smaller low-spin Fe(II) fits snugly into the central N4 porphyrin cavity.\n"
        "3. Structural propagation: The inward movement of Fe pulls the proximal histidine, shifting the F-helix and disrupting interdimer salt bridges. This converts the low-affinity T (tense) quaternary structure to the high-affinity R (relaxed) state, yielding the characteristic sigmoidal Hill binding curve (Hill coefficient n_H ~ 2.8-3.0)."
    ),
    # Physical / Kinetics: Steady-State Approximation
    (
        "phys_steady_state_approx",
        DatasetType.PHYSICAL_CHEMISTRY,
        ChemistryDomain.PHYSICAL_CHEMISTRY,
        "chemical_kinetics",
        "The Steady-State Approximation in Reaction Mechanisms",
        "Explain the theoretical foundation of the steady-state approximation (SSA) and apply it to derive a rate law.",
        "The steady-state approximation assumes that the concentration of highly reactive, transient reaction intermediates remains constant and small throughout the bulk of the reaction, such that the net rate of change of intermediate concentration is set to zero: d[Intermediate]/dt ≈ 0.",
        "1. Consider consecutive elementary steps: A + B ⇌ I (k1, k-1) and I → P (k2).\n"
        "2. Rate equation for intermediate I: d[I]/dt = k1[A][B] - k-1[I] - k2[I] = 0.\n"
        "3. Solving for steady-state intermediate concentration: [I]_ss = (k1[A][B]) / (k-1 + k2).\n"
        "4. Product formation rate: d[P]/dt = k2[I] = (k1 * k2 * [A][B]) / (k-1 + k2).\n"
        "5. Limiting cases:\n"
        "   - If k2 << k-1 (pre-equilibrium limit): Rate = (k1*k2 / k-1)[A][B] = K_eq * k2 * [A][B].\n"
        "   - If k2 >> k-1: Rate = k1[A][B] (formation of intermediate is rate-determining)."
    ),
    # Physical / Kinetics: Michaelis-Menten Enzyme Kinetics
    (
        "phys_michaelis_menten_kinetics",
        DatasetType.PHYSICAL_CHEMISTRY,
        ChemistryDomain.BIOCHEMISTRY,
        "enzyme_kinetics",
        "The Michaelis-Menten Equation and Catalytic Parameters",
        "Derive and explain the Michaelis-Menten equation v0 = (Vmax * [S]) / (Km + [S]) and its fundamental kinetic constants.",
        "The Michaelis-Menten model describes enzyme-catalyzed reaction velocity v0 as a function of substrate concentration [S], parameterized by maximal velocity Vmax = kcat * [E]total and the Michaelis constant Km = (k-1 + kcat) / k1.",
        "1. Mechanism: E + S ⇌ ES (k1, k-1) → E + P (kcat).\n"
        "2. Applying the steady-state approximation to the enzyme-substrate complex [ES]: d[ES]/dt = k1[E][S] - (k-1 + kcat)[ES] = 0.\n"
        "3. Conservation of enzyme: [E]total = [E] + [ES]. Substituting [E] = [E]total - [ES] yields [ES] = ([E]total * [S]) / (Km + [S]), where Km = (k-1 + kcat) / k1.\n"
        "4. Velocity: v0 = kcat[ES] = (Vmax * [S]) / (Km + [S]).\n"
        "5. Interpretation:\n"
        "   - When [S] << Km: v0 = (Vmax / Km)[S] (first-order kinetics; kcat/Km reflects catalytic efficiency, approaching the diffusion-controlled limit ~10^8-10^9 M^-1 s^-1).\n"
        "   - When [S] >> Km: v0 = Vmax (zero-order kinetics; all active enzyme sites are saturated with substrate)."
    ),
    # Physical / Thermodynamics: Chemical Potential & Clausius-Clapeyron
    (
        "phys_chemical_potential_phase_equilibria",
        DatasetType.PHYSICAL_CHEMISTRY,
        ChemistryDomain.PHYSICAL_CHEMISTRY,
        "thermodynamics",
        "Chemical Potential and the Clausius-Clapeyron Equation",
        "Define chemical potential mu and derive the integrated Clausius-Clapeyron equation for liquid-vapor phase equilibrium.",
        "The chemical potential mu_i = (dG/dn_i)_{T,P,n_j} is the partial molar Gibbs free energy. Phase equilibrium between liquid and vapor requires equality of chemical potentials: mu_liquid = mu_vapor, leading to the Clausius-Clapeyron equation ln(P2/P1) = -(Delta H_vap / R) * (1/T2 - 1/T1).",
        "1. Criterion for phase equilibrium: For any two coexisting phases alpha and beta, dG = (mu_beta - mu_alpha)dn = 0, so mu_alpha = mu_beta.\n"
        "2. Clapeyron equation: Along the coexistence curve, d(mu_liquid) = d(mu_vapor) implies -S_m,liq dT + V_m,liq dP = -S_m,vap dT + V_m,vap dP, yielding dP/dT = Delta S_m / Delta V_m = Delta H_m / (T * Delta V_m).\n"
        "3. Clausius-Clapeyron approximations for vaporization:\n"
        "   - Molar volume of vapor is much larger than liquid (Delta V_m ≈ V_m,vap).\n"
        "   - Vapor behaves as an ideal gas: V_m,vap = RT / P.\n"
        "   - Substituting gives d(ln P)/dT = Delta H_vap / (RT^2).\n"
        "4. Integrating assuming constant Delta H_vap: ln(P2 / P1) = -(Delta H_vap / R) * (1/T2 - 1/T1), relating vapor pressure directly to temperature."
    ),
    # Physical / Statistical Mechanics: Boltzmann Distribution
    (
        "phys_stat_mech_boltzmann",
        DatasetType.PHYSICAL_CHEMISTRY,
        ChemistryDomain.PHYSICAL_CHEMISTRY,
        "statistical_mechanics",
        "The Boltzmann Distribution and Canonical Molecular Partition Function",
        "State the Boltzmann distribution law and explain how the molecular partition function q connects microscopic states to macroscopic thermodynamic properties.",
        "The Boltzmann distribution P_i = (g_i * exp(-E_i / k_B T)) / q gives the fractional population of quantum energy level E_i at thermal equilibrium, where q = sum(g_i * exp(-E_i / k_B T)) is the molecular partition function.",
        "1. Thermal energy scale: The parameter beta = 1 / (k_B T) defines the thermal energy available to populate excited quantum states.\n"
        "2. Physical meaning of q: Partition function q measures the effective number of thermally accessible quantum states at temperature T. At T → 0 K, q approaches the ground-state degeneracy g_0; at T → infinity, q approaches infinity.\n"
        "3. Thermodynamic bridge: All macroscopic thermodynamic properties derive from partition function Q = q^N / N! (for indistinguishable molecules):\n"
        "   - Internal energy U = k_B T^2 (d ln Q / dT)_V\n"
        "   - Helmholtz free energy A = -k_B T ln Q\n"
        "   - Entropy S = k_B ln Q + U / T (Gibbs entropy formula S = -k_B sum(P_i ln P_i))."
    ),
    # Quantum Mechanics: Particle in a Box
    (
        "quant_particle_in_a_box",
        DatasetType.QUANTUM_CHEMISTRY,
        ChemistryDomain.COMPUTATIONAL_CHEMISTRY,
        "quantum_mechanics",
        "The Particle-in-a-Box Model and Zero-Point Energy",
        "Solve the one-dimensional particle-in-a-box problem and explain why quantum systems possess non-zero zero-point energy.",
        "For a particle of mass m confined to an infinite potential well of length L (V=0 for 0 < x < L, V=infinity elsewhere), stationary wavefunctions are Psi_n(x) = sqrt(2/L) * sin(n*pi*x / L) with quantized energy levels E_n = (n^2 * h^2) / (8 * m * L^2), where n = 1, 2, 3...",
        "1. Boundary conditions: Wavefunction must vanish at walls (Psi(0) = Psi(L) = 0) to maintain continuity, enforcing standing-wave quantization: k = n*pi / L.\n"
        "2. Energy quantization: E_n = (hbar^2 * k^2) / (2m) = (n^2 * h^2) / (8m * L^2).\n"
        "3. Zero-Point Energy: The lowest possible energy is E_1 = h^2 / (8mL^2) > 0. The particle cannot have E = 0 because if E = 0, momentum p = 0 with Delta p = 0, meaning uncertainty in position Delta x would be infinite, violating confinement within box length L (Heisenberg uncertainty principle Delta x * Delta p >= hbar / 2).\n"
        "4. Chemical application: Accurately models pi-electron delocalization in conjugated polyenes (e.g. retinal, cyanine dyes)."
    ),
    # Computational Chemistry: Hartree-Fock Theory
    (
        "comp_hartree_fock_scf",
        DatasetType.COMPUTATIONAL_CHEMISTRY,
        ChemistryDomain.COMPUTATIONAL_CHEMISTRY,
        "ab_initio_methods",
        "Hartree-Fock Theory and the Self-Consistent Field (SCF) Method",
        "Explain the Mean-Field approximation in Hartree-Fock theory and the Self-Consistent Field (SCF) iterative procedure.",
        "Hartree-Fock (HF) theory approximates the N-electron wavefunction as a single anti-symmetrized Slater determinant, replacing instantaneous electron-electron repulsions with an average effective mean electrostatic field (Coulomb operator J and Exchange operator K), solved iteratively via the Roothaan-Hall equations until self-consistency.",
        "1. Slater Determinant: Ensures antisymmetry upon electron exchange, satisfying the Pauli exclusion principle (Psi(1, 2) = -Psi(2, 1)).\n"
        "2. Fock Operator: F_hat(1) = h_core(1) + sum_j [2*J_j(1) - K_j(1)], where J represents classical Coulomb repulsion and K represents purely quantum mechanical non-local exchange stabilization of electrons with parallel spins.\n"
        "3. Roothaan-Hall equations: F * C = S * C * epsilon expresses HF in a finite basis set (matrix eigenvalue problem where S is the overlap matrix, C is orbital coefficients, epsilon is orbital energies).\n"
        "4. Limitation (Electron Correlation): HF neglects instantaneous electron correlation (correlation energy E_corr = E_exact - E_HF < 0), requiring post-HF methods (MP2, CCSD(T)) or DFT for chemical accuracy."
    ),
    # Computational Chemistry: Basis Sets
    (
        "comp_basis_sets_pople_dunning",
        DatasetType.COMPUTATIONAL_CHEMISTRY,
        ChemistryDomain.COMPUTATIONAL_CHEMISTRY,
        "electronic_structure",
        "Basis Sets in Electronic Structure Theory: Pople vs Correlation-Consistent Sets",
        "Explain how atom-centered Gaussian basis sets approximate molecular orbitals and contrast Pople-style split-valence sets with Dunning correlation-consistent sets.",
        "Molecular orbitals are expanded as linear combinations of atomic basis functions: psi_i = sum_mu c_mu,i * phi_mu. Gaussian-Type Orbitals (GTOs, exp(-alpha*r^2)) are used because multi-center electron repulsion integrals can be evaluated analytically via the Gaussian product theorem.",
        "1. Minimal basis (e.g. STO-3G): Represents each core and valence orbital with one contract Gaussian function (3 primitive Gaussians fit to a Slater-type orbital).\n"
        "2. Pople Split-Valence Sets (e.g. 6-31G(d,p)):\n"
        "   - '6': Core orbitals represented by 6 contracted Gaussians.\n"
        "   - '31': Valence orbitals split into an inner contracted set (3 Gaussians) and an outer diffuse set (1 Gaussian), allowing the electron cloud to expand or contract.\n"
        "   - '(d,p)' (or '*'): Polarization functions (adds d-functions to heavy atoms and p-functions to hydrogens) enabling electron cloud distortion under covalent bonding.\n"
        "   - '+' (diffuse functions): Low-exponent Gaussians essential for anions, lone pairs, and Rydberg states.\n"
        "3. Dunning correlation-consistent sets (cc-pVnZ, n=D, T, Q, 5):\n"
        "   - Systematically converge post-Hartree-Fock correlation energy toward the Complete Basis Set (CBS) limit by adding shells of correlating polarization functions."
    ),
]


def generate_discipline_records() -> List[ChemNovaRecord]:
    """Generate structured records for disciplinary chemistry domains."""
    records = []
    source = "Atkins' Physical Chemistry & Miessler-Fischer Inorganic Chemistry & Levine Quantum Chemistry"
    license_str = "CC-BY-4.0"

    for did, dtype, dom, sub, title, q, a, reasoning in DISCIPLINES_DATA:
        rec = ChemNovaRecord(
            id=f"{did}",
            type=dtype,
            domain=dom,
            subdomain=sub,
            question=q,
            answer=a,
            reasoning=reasoning,
            context=f"Subject: {title}\nDomain: {dom.value} ({sub})",
            source=source,
            source_url="https://doi.org/10.1093/hesc/9780198823360.001.0001",
            license=license_str,
            confidence=1.0,
            verified=True,
        )
        records.append(rec)

    return records
