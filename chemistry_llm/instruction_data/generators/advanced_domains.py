"""Advanced Chemistry Domains Instruction Generator for Step 6.

Covers:
- Inorganic Coordination Chemistry
- Physical Chemistry & Kinetics
- Analytical Chemistry & Chromatography
- Biochemistry & Enzymes
- Medicinal Chemistry & ADME
- Materials & Polymers
- Environmental & Nuclear Chemistry
- Photochemistry & Computational Chemistry
"""

from typing import List
from chemistry_llm.instruction_data.schema import ChemistryInstructionExample


def generate_advanced_domain_instructions() -> List[ChemistryInstructionExample]:
    """Generate high-quality instruction examples covering advanced chemistry domains."""
    examples = [
        ChemistryInstructionExample(
            id="inorg_001",
            instruction="Explain crystal field splitting in octahedral transition metal complexes and describe the spectrochemical series.",
            output=(
                "In an octahedral coordination complex [ML6]ⁿ⁺, six ligands approach the central transition metal ion along the Cartesian axes (x, y, z).\n\n"
                "1. d-Orbital Splitting:\n"
                "- The five degenerate d-orbitals split into two sets under the electrostatic repulsion of ligand lone pairs:\n"
                "- eg set (higher energy, dx²-y², dz²): Orbitals with lobes pointing directly at the approaching ligands experience strong repulsion and destabilization (+0.6 Δo).\n"
                "- t2g set (lower energy, dxy, dxz, dyz): Orbitals with lobes oriented between the Cartesian axes experience less repulsion and relative stabilization (-0.4 Δo).\n\n"
                "2. The Spectrochemical Series:\n"
                "Ligands are ranked empirically by the magnitude of the crystal field splitting parameter (Δo) they induce:\n"
                "I⁻ < Br⁻ < S²⁻ < SCN⁻ < Cl⁻ < F⁻ < OH⁻ < C2O4²⁻ < H2O < NCS⁻ < EDTA⁴⁻ < NH3 < en < bpy < phen < NO2⁻ < PPh3 < CN⁻ ≈ CO\n\n"
                "- Weak-field ligands (e.g., halides, H2O): Cause small Δo, promoting high-spin complexes where pairing energy P > Δo.\n"
                "- Strong-field ligands (e.g., CN⁻, CO): Cause large Δo via π-backbonding, promoting low-spin complexes where electrons pair up in t2g before populating eg."
            ),
            domain="inorganic_chemistry",
            subdomain="coordination_chemistry",
            difficulty="undergraduate",
            reasoning_type="deductive",
            answer_type="explanation",
            chemical_entities=["[Fe(CN)6]4-", "[Fe(H2O)6]2+"],
            verified=True,
            confidence="high",
        ),
        ChemistryInstructionExample(
            id="phys_001",
            instruction="How does temperature affect the rate constant of a chemical reaction according to the Arrhenius equation?",
            output=(
                "The relationship between reaction temperature and rate constant is quantified by the Arrhenius equation:\n\n"
                "k = A * exp(-Ea / (R * T))\n\n"
                "Where:\n"
                "- k: Reaction rate constant\n"
                "- A: Pre-exponential factor (frequency factor related to collision frequency and steric orientation)\n"
                "- Ea: Activation energy (J/mol)\n"
                "- R: Universal gas constant (8.314 J/(mol·K))\n"
                "- T: Absolute temperature (in Kelvin)\n\n"
                "Physical Meaning:\n"
                "The exponential factor exp(-Ea / RT) represents the fraction of colliding molecules with kinetic energy equal to or greater than the activation energy barrier Ea.\n"
                "As temperature T increases, the denominator RT increases, making the negative exponent (-Ea / RT) less negative. Consequently, the fraction of molecules with sufficient energy to overcome the barrier rises exponentially, causing a dramatic increase in reaction rate (often roughly doubling for every 10 °C rise near room temperature)."
            ),
            domain="physical_chemistry",
            subdomain="kinetics",
            difficulty="undergraduate",
            reasoning_type="deductive",
            answer_type="explanation",
            verified=True,
            confidence="high",
        ),
        ChemistryInstructionExample(
            id="analyt_001",
            instruction="Explain the Beer-Lambert law and its limitations in analytical spectrophotometry.",
            output=(
                "The Beer-Lambert law states that the absorbance (A) of a monochromatic light beam passing through an absorbing solution is directly proportional to the path length (b) and solute concentration (c):\n\n"
                "A = ε * b * c\n\n"
                "Where:\n"
                "- A: Absorbance (dimensionless, defined as -log10(I / I0))\n"
                "- ε: Molar absorptivity (extinction coefficient, L/(mol·cm))\n"
                "- b: Path length of the cuvette (typically 1.00 cm)\n"
                "- c: Analyte molar concentration (mol/L)\n\n"
                "Practical Limitations & Deviations:\n"
                "1. High Concentrations (c > 0.01 M): Electrostatic interactions between solute molecules alter the electron distribution and molar absorptivity.\n"
                "2. Chemical Equilibria: Association, dissociation, or reaction of analyte with solvent (e.g., pH indicators changing color with dilution).\n"
                "3. Instrumental Deviations: Polychromatic (non-monochromatic) radiation and stray light reaching the detector lead to negative deviations at high absorbance values."
            ),
            domain="analytical_chemistry",
            subdomain="spectrophotometry",
            difficulty="undergraduate",
            reasoning_type="deductive",
            answer_type="explanation",
            verified=True,
            confidence="high",
        ),
        ChemistryInstructionExample(
            id="biochem_001",
            instruction="What is the Michaelis-Menten equation, and what do the kinetic constants Vmax and Km represent?",
            output=(
                "The Michaelis-Menten model describes the rate of many single-substrate enzyme-catalyzed reactions:\n\n"
                "v0 = (Vmax * [S]) / (Km + [S])\n\n"
                "Key Constants:\n"
                "1. Vmax (Maximum Velocity):\n"
                "- The theoretical maximum rate achieved when the enzyme is completely saturated with substrate ([S] >> Km).\n"
                "- Related to enzyme concentration: Vmax = kcat * [E]total, where kcat is the turnover number (catalytic constant).\n\n"
                "2. Km (Michaelis Constant):\n"
                "- The substrate concentration at which the initial reaction velocity is exactly half of Vmax (v0 = Vmax / 2).\n"
                "- Units: Concentration (mol/L or M).\n"
                "- Biological Significance: An inverse measure of apparent enzyme-substrate affinity; a lower Km indicates that the enzyme reaches half-maximal velocity at lower substrate concentrations (higher apparent affinity)."
            ),
            domain="biochemistry",
            subdomain="enzymes_kinetics",
            difficulty="undergraduate",
            reasoning_type="deductive",
            answer_type="explanation",
            verified=True,
            confidence="high",
        ),
        ChemistryInstructionExample(
            id="med_001",
            instruction="What are Lipinski's Rule of Five criteria for oral bioavailability of drug-like small molecules?",
            output=(
                "Lipinski's Rule of Five (RO5) is an empirical guideline predicting whether a chemical compound has structural properties likely to confer favorable oral bioavailability and intestinal absorption in humans.\n\n"
                "The criteria (multiples of five):\n"
                "1. Molecular Weight: MW ≤ 500 Da (larger molecules face poor membrane permeability).\n"
                "2. Lipophilicity: Calculated log P (octanol-water partition coefficient, cLogP) ≤ 5 (excessively hydrophobic compounds have poor aqueous solubility).\n"
                "3. Hydrogen Bond Donors: No more than 5 H-bond donors (sum of OH and NH groups).\n"
                "4. Hydrogen Bond Acceptors: No more than 10 H-bond acceptors (sum of N and O atoms).\n\n"
                "Compounds violating more than one of these criteria typically face poor absorption or permeability, though natural products and active transport substrates often serve as notable exceptions."
            ),
            domain="medicinal_chemistry",
            subdomain="adme_druglikeness",
            difficulty="undergraduate",
            reasoning_type="direct_recall",
            answer_type="explanation",
            verified=True,
            confidence="high",
        ),
        ChemistryInstructionExample(
            id="poly_001",
            instruction="Differentiate between step-growth (condensation) and chain-growth (addition) polymerization.",
            output=(
                "Polymers are synthesized via two fundamentally different mechanisms:\n\n"
                "1. Chain-Growth (Addition) Polymerization:\n"
                "- Monomers: Typically contain carbon-carbon double bonds (e.g., ethylene, styrene, vinyl chloride).\n"
                "- Mechanism: Initiator generates reactive centers (radicals, cations, or anions). Monomers add sequentially one-by-one to the active chain end.\n"
                "- High Molecular Weight Polymer: Formed almost immediately at the start of the reaction; monomer concentration declines steadily throughout.\n"
                "- Byproducts: No small molecules are eliminated.\n\n"
                "2. Step-Growth (Condensation) Polymerization:\n"
                "- Monomers: Bi-functional or multi-functional molecules (e.g., diacids + diamines yielding polyamides/nylon; diacids + diols yielding polyesters/PET).\n"
                "- Mechanism: Any two molecular species (monomers, dimers, oligomers) can react with each other at any time.\n"
                "- Molecular Weight: Grows slowly; high molecular weight polymer is achieved only at very high conversion (>98-99%).\n"
                "- Byproducts: Typically releases a small condensation byproduct (e.g., H2O or HCl)."
            ),
            domain="materials_chemistry",
            subdomain="polymer_synthesis",
            difficulty="undergraduate",
            reasoning_type="comparative",
            answer_type="explanation",
            chemical_entities=["nylon", "polyethylene", "PET"],
            verified=True,
            confidence="high",
        ),
        ChemistryInstructionExample(
            id="env_001",
            instruction="Explain the catalytic mechanism of stratospheric ozone depletion by chlorofluorocarbons (CFCs).",
            output=(
                "Chlorofluorocarbons (e.g., CFCl3, CFC-11) are inert in the troposphere but undergo photolytic cleavage when transported to the stratosphere by UV-C radiation (λ < 240 nm):\n\n"
                "Step 1: Photolysis (Initiation)\n"
                "CFCl3 + hν -> ·CFCl2 + Cl· (chlorine free radical)\n\n"
                "Step 2: Catalytic Ozone Destruction Cycle (Propagation)\n"
                "Cl· + O3 -> ClO· + O2\n"
                "ClO· + O· -> Cl· + O2\n"
                "Net Reaction: O3 + O· -> 2 O2\n\n"
                "Catalytic Efficiency:\n"
                "Because the chlorine radical (Cl·) is regenerated in the second propagation step, a single chlorine atom can catalytically destroy up to 100,000 ozone molecules before being temporarily sequestered into stable reservoir species (such as HCl or ClONO2)."
            ),
            domain="environmental_chemistry",
            subdomain="atmospheric_ozone",
            difficulty="undergraduate",
            reasoning_type="mechanistic",
            answer_type="explanation",
            chemical_entities=["CFC-11", "O3", "Cl·", "ClO·"],
            verified=True,
            confidence="high",
        ),
        ChemistryInstructionExample(
            id="nuc_001",
            instruction="Compare alpha (α), beta-minus (β⁻), and gamma (γ) radioactive decay in terms of identity, charge, and penetrating power.",
            output=(
                "Nuclear radiation takes three primary forms characterized by distinct physical natures:\n\n"
                "1. Alpha Decay (α):\n"
                "- Identity: Helium-4 nucleus (2 protons + 2 neutrons, ⁴₂He²⁺).\n"
                "- Charge: +2e.\n"
                "- Penetrating Power: Very low (stopped by a single sheet of paper or the outer dead layer of human skin); however, possesses high linear energy transfer (LET) and severe internal biological toxicity if inhaled or ingested.\n\n"
                "2. Beta-Minus Decay (β⁻):\n"
                "- Identity: High-speed electron emitted when a neutron converts to a proton (n -> p + e⁻ + ν_e).\n"
                "- Charge: -1e.\n"
                "- Penetrating Power: Moderate (penetrates skin; stopped by a few millimeters of aluminum or plastic).\n\n"
                "3. Gamma Emission (γ):\n"
                "- Identity: High-energy electromagnetic photons originating from nuclear de-excitation.\n"
                "- Charge: 0 (neutral).\n"
                "- Penetrating Power: Very high (requires several centimeters of dense lead or meters of concrete to attenuate effectively)."
            ),
            domain="nuclear_chemistry",
            subdomain="radioactive_decay",
            difficulty="introductory",
            reasoning_type="comparative",
            answer_type="explanation",
            verified=True,
            confidence="high",
        ),
        ChemistryInstructionExample(
            id="photo_001",
            instruction="Differentiate between fluorescence and phosphorescence using a Jablonski energy diagram framework.",
            output=(
                "Fluorescence and phosphorescence are two distinct radiative photoluminescent relaxation pathways from electronically excited states:\n\n"
                "1. Fluorescence:\n"
                "- Transition: Radiative decay from the lowest excited singlet state to the ground singlet state (S1 -> S0 + hν).\n"
                "- Spin Multiplicity: Spin-allowed transition (ΔS = 0; no change in electron spin).\n"
                "- Lifetime: Extremely fast (10⁻⁹ to 10⁻⁷ seconds, nanoseconds). Luminescence ceases immediately when excitation light is removed.\n\n"
                "2. Phosphorescence:\n"
                "- Transition: Molecule in S1 first undergoes radiationless Intersystem Crossing (ISC) to an excited triplet state (T1), followed by radiative decay to the singlet ground state (T1 -> S0 + hν).\n"
                "- Spin Multiplicity: Spin-forbidden transition (ΔS ≠ 0; requires an electron spin flip).\n"
                "- Lifetime: Much longer (10⁻³ to hours, milliseconds to seconds or longer). Produces persistent 'glow-in-the-dark' afterglow because the transition probability is low."
            ),
            domain="photochemistry",
            subdomain="luminescence",
            difficulty="undergraduate",
            reasoning_type="comparative",
            answer_type="explanation",
            verified=True,
            confidence="high",
        ),
        ChemistryInstructionExample(
            id="comp_001",
            instruction="Compare Density Functional Theory (DFT) with classical Molecular Mechanics (MM) force fields in computational chemistry.",
            output=(
                "Density Functional Theory (DFT) and Molecular Mechanics (MM) occupy different positions along the accuracy-computational cost spectrum:\n\n"
                "1. Density Functional Theory (DFT):\n"
                "- Underlying Physics: Quantum mechanical approach based on the Hohenberg-Kohn theorems, expressing the ground-state electronic energy as a functional of electron density ρ(r).\n"
                "- Capabilities: Explicitly models electrons, chemical bond breaking, transition states, orbital energies, and charge transfers.\n"
                "- Computational Scaling: Typically scales as ~O(N³) with system size; practically limited to systems of tens to hundreds of atoms.\n\n"
                "2. Molecular Mechanics (MM):\n"
                "- Underlying Physics: Classical Newtonian physics treating atoms as charged spheres connected by harmonic springs (bonds, angles, torsions, Lennard-Jones van der Waals, and Coulomb electrostatic potentials).\n"
                "- Capabilities: Cannot model chemical bond formation or breaking without specialized reactive force fields (ReaxFF); ignores explicit electrons.\n"
                "- Computational Scaling: Very fast (~O(N log N)); routinely handles macromolecules, solvated proteins, and lipid bilayers of 100,000 to 1,000,000+ atoms over microsecond timescales."
            ),
            domain="computational_chemistry",
            subdomain="quantum_vs_classical",
            difficulty="graduate",
            reasoning_type="comparative",
            answer_type="explanation",
            verified=True,
            confidence="high",
        ),
    ]
    return examples
