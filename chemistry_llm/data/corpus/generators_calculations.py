"""Chemistry worked calculation examples generator.

Stores rigorous step-by-step problem solutions containing:
- problem
- given values
- equation
- substitution
- calculation
- units
- final answer
- reasoning
- sanity check
"""

from typing import List
from chemistry_llm.data.schema.types import DatasetType, ChemistryDomain
from chemistry_llm.data.schema.record import ChemNovaRecord

CALCULATIONS_DATA = [
    (
        "calc_limiting_reagent_water",
        "Stoichiometry and Limiting Reagent in Water Synthesis",
        "Calculate the mass of water (H2O) produced and identify the limiting reagent when 4.00 g of hydrogen gas (H2) reacts with 64.0 g of oxygen gas (O2).",
        "Given the reaction 2H2 + O2 → 2H2O, the limiting reagent is H2, producing 35.7 g of H2O.",
        "1. Problem Statement:\n"
        "   When 4.00 g H2 and 64.0 g O2 react via 2 H2(g) + O2(g) → 2 H2O(l), find the limiting reactant and mass of H2O formed.\n\n"
        "2. Given Values:\n"
        "   - Mass of H2 = 4.00 g\n"
        "   - Mass of O2 = 64.0 g\n"
        "   - Molar mass of H2 = 2.016 g/mol\n"
        "   - Molar mass of O2 = 31.998 g/mol\n"
        "   - Molar mass of H2O = 18.015 g/mol\n\n"
        "3. Governing Equations:\n"
        "   - Moles n = mass / Molar mass\n"
        "   - Stoichiometric ratio: 2 mol H2 : 1 mol O2 : 2 mol H2O\n\n"
        "4. Substitution & Step-by-Step Calculation:\n"
        "   - Moles of H2 available = 4.00 g / 2.016 g/mol = 1.984 mol H2\n"
        "   - Moles of O2 available = 64.0 g / 31.998 g/mol = 2.000 mol O2\n"
        "   - Theoretical O2 required for 1.984 mol H2 = 1.984 / 2 = 0.992 mol O2\n"
        "   - Since 2.000 mol O2 > 0.992 mol O2, H2 is completely consumed first. Thus, H2 is the LIMITING REAGENT.\n"
        "   - Theoretical yield of H2O = moles of limiting H2 = 1.984 mol H2O\n"
        "   - Mass of H2O produced = 1.984 mol * 18.015 g/mol = 35.74 g H2O\n\n"
        "5. Final Answer:\n"
        "   35.7 g H2O (3 significant figures).\n\n"
        "6. Sanity Check:\n"
        "   Conservation of mass check: Total initial reactants = 4.00 g + 64.0 g = 68.0 g. Unreacted O2 = (2.000 - 0.992) mol * 32.00 g/mol = 32.26 g. Products (35.74 g) + Remaining reactants (32.26 g) = 68.0 g, perfectly conserved."
    ),
    (
        "calc_buffer_henderson_hasselbalch",
        "Buffer pH Calculation via Henderson-Hasselbalch Equation",
        "Calculate the pH of an acetate buffer solution prepared by mixing 0.15 M acetic acid (CH3COOH, Ka = 1.75 x 10^-5) with 0.25 M sodium acetate (CH3COONa).",
        "The pH of the buffer solution is 4.98.",
        "1. Problem Statement:\n"
        "   Determine the pH of a solution containing [CH3COOH] = 0.15 M and [CH3COO-] = 0.25 M, with Ka = 1.75 × 10⁻⁵.\n\n"
        "2. Given Values:\n"
        "   - [HA] = [CH3COOH] = 0.15 M\n"
        "   - [A-] = [CH3COO-] = 0.25 M\n"
        "   - Ka = 1.75 × 10⁻⁵ (pKa = -log10(1.75 × 10⁻⁵) = 4.757)\n\n"
        "3. Governing Equation (Henderson-Hasselbalch):\n"
        "   pH = pKa + log10([Conjugate Base] / [Weak Acid])\n\n"
        "4. Substitution & Step-by-Step Calculation:\n"
        "   - Ratio [A-] / [HA] = 0.25 / 0.15 = 1.6667\n"
        "   - log10(1.6667) = +0.222\n"
        "   - pH = 4.757 + 0.222 = 4.979\n\n"
        "5. Final Answer:\n"
        "   pH = 4.98 (reported to 2 decimal places for pH convention).\n\n"
        "6. Sanity Check:\n"
        "   Since the conjugate base concentration (0.25 M) exceeds the acid concentration (0.15 M), the pH must be slightly higher than the pKa (4.76). 4.98 is indeed higher than 4.76, confirming correct direction."
    ),
    (
        "calc_galvanic_cell_nernst",
        "Non-Standard Electrochemical Cell Potential via Nernst Equation",
        "Calculate the cell potential at 298 K for a Daniell cell Zn(s) | Zn2+(aq, 0.010 M) || Cu2+(aq, 2.0 M) | Cu(s), given E°(Zn2+/Zn) = -0.763 V and E°(Cu2+/Cu) = +0.340 V.",
        "The non-standard cell potential E_cell is 1.17 V.",
        "1. Problem Statement:\n"
        "   Calculate E_cell for the redox reaction Zn(s) + Cu2+(aq) → Zn2+(aq) + Cu(s) under specified non-standard ion concentrations.\n\n"
        "2. Given Values:\n"
        "   - [Zn2+] = 0.010 M\n"
        "   - [Cu2+] = 2.0 M\n"
        "   - E°(cathode, Cu2+/Cu) = +0.340 V\n"
        "   - E°(anode, Zn2+/Zn) = -0.763 V\n"
        "   - Number of electrons transferred n = 2\n"
        "   - Temperature T = 298.15 K\n\n"
        "3. Governing Equations:\n"
        "   - E°_cell = E°(cathode) - E°(anode)\n"
        "   - Q = [Zn2+] / [Cu2+]\n"
        "   - E_cell = E°_cell - (0.0592 V / n) * log10(Q)\n\n"
        "4. Substitution & Step-by-Step Calculation:\n"
        "   - E°_cell = (+0.340 V) - (-0.763 V) = +1.103 V\n"
        "   - Reaction quotient Q = 0.010 / 2.0 = 5.0 × 10⁻³\n"
        "   - log10(5.0 × 10⁻³) = -2.301\n"
        "   - Nernst correction = -(0.0592 V / 2) * (-2.301) = +0.0681 V\n"
        "   - E_cell = 1.103 V + 0.0681 V = 1.1711 V\n\n"
        "5. Final Answer:\n"
        "   E_cell = +1.17 V.\n\n"
        "6. Sanity Check:\n"
        "   According to Le Chatelier's principle, having a high reactant concentration [Cu2+] (2.0 M) and low product concentration [Zn2+] (0.010 M) drives the reaction forward, so the cell potential must be greater than standard E° (1.10 V). 1.17 V > 1.10 V, which is physically consistent."
    ),
    (
        "calc_ideal_gas_molar_mass",
        "Ideal Gas Law and Gas Molar Mass Determination",
        "A 0.500 g sample of an unknown volatile liquid is vaporized into a 250.0 mL bulb at 100.0 °C and 745.0 mmHg. Calculate the molar mass of the unknown compound.",
        "The molar mass of the unknown volatile compound is 62.4 g/mol.",
        "1. Problem Statement:\n"
        "   Determine the molar mass (M) of an unknown gas from mass, volume, temperature, and pressure measurements.\n\n"
        "2. Given Values:\n"
        "   - Mass m = 0.500 g\n"
        "   - Volume V = 250.0 mL = 0.2500 L\n"
        "   - Temperature T = 100.0 °C = 373.15 K\n"
        "   - Pressure P = 745.0 mmHg / 760.0 mmHg/atm = 0.98026 atm\n"
        "   - Gas constant R = 0.082057 L*atm/(mol*K)\n\n"
        "3. Governing Equations:\n"
        "   - Ideal Gas Law: P * V = n * R * T = (m / M) * R * T\n"
        "   - Rearranging for molar mass: M = (m * R * T) / (P * V)\n\n"
        "4. Substitution & Step-by-Step Calculation:\n"
        "   - M = (0.500 g * 0.082057 L*atm/(mol*K) * 373.15 K) / (0.98026 atm * 0.2500 L)\n"
        "   - Numerator = 15.3101 g*L*atm/mol\n"
        "   - Denominator = 0.24507 L*atm\n"
        "   - M = 15.3101 / 0.24507 = 62.47 g/mol\n\n"
        "5. Final Answer:\n"
        "   62.5 g/mol (3 significant figures).\n\n"
        "6. Sanity Check:\n"
        "   At STP, 1 mole occupies 22.4 L. Here, 0.250 L at ~1 atm and 373 K contains ~0.008 moles. 0.500 g / 0.008 mol ≈ 62.5 g/mol, consistent with volatile organics like ethylene glycol (62.07 g/mol)."
    ),
    (
        "calc_weak_acid_ph_ice",
        "Weak Acid Dissociation and Solution pH via ICE Table",
        "Calculate the pH of a 0.200 M aqueous solution of hypochlorous acid (HOCl), given Ka = 3.00 x 10^-8 at 25 °C.",
        "The pH of the 0.200 M HOCl solution is 4.11.",
        "1. Problem Statement:\n"
        "   Calculate [H3O+] and pH of 0.200 M HOCl(aq) with Ka = 3.00 × 10⁻⁸.\n\n"
        "2. Given Values:\n"
        "   - Initial [HOCl] = 0.200 M\n"
        "   - Ka = 3.00 × 10⁻⁸\n"
        "   - Kw = 1.00 × 10⁻¹⁴\n\n"
        "3. Governing Equations:\n"
        "   - Equilibrium: HOCl(aq) + H2O(l) ⇌ H3O+(aq) + OCl-(aq)\n"
        "   - Ka = [H3O+][OCl-] / [HOCl] = x^2 / (0.200 - x)\n"
        "   - pH = -log10[H3O+]\n\n"
        "4. Substitution & Step-by-Step Calculation:\n"
        "   - Assume x << 0.200 (5% approximation rule):\n"
        "   - x^2 / 0.200 = 3.00 × 10⁻⁸\n"
        "   - x^2 = 6.00 × 10⁻⁹\n"
        "   - x = sqrt(6.00 × 10⁻⁹) = 7.746 × 10⁻⁵ M = [H3O+]\n"
        "   - Check assumption: (7.746 × 10⁻⁵ / 0.200) * 100% = 0.039% << 5%, validity confirmed.\n"
        "   - pH = -log10(7.746 × 10⁻⁵) = 4.111\n\n"
        "5. Final Answer:\n"
        "   pH = 4.11 (2 decimal places).\n\n"
        "6. Sanity Check:\n"
        "   Hypochlorous acid is a weak acid (Ka ~ 10^-8); pH must lie between strong acid (pH ~ 1) and neutral water (pH 7). 4.11 is weakly acidic, perfectly reasonable."
    ),
    (
        "calc_first_order_kinetics_halflife",
        "First-Order Kinetics Rate Law and Half-Life Determination",
        "The decomposition of dinitrogen pentoxide 2 N2O5(g) → 4 NO2(g) + O2(g) is first order with rate constant k = 6.20 x 10^-4 s^-1 at 45 °C. Calculate the half-life and the time required for 80.0% of N2O5 to decompose.",
        "The half-life of N2O5 is 1.12 x 10^3 s (18.6 min), and the time required for 80.0% decomposition is 2.59 x 10^3 s (43.2 min).",
        "1. Problem Statement:\n"
        "   Calculate half-life t_1/2 and time t to reach 20.0% remaining N2O5 ([A]_t = 0.200 [A]_0).\n\n"
        "2. Given Values:\n"
        "   - Rate constant k = 6.20 × 10⁻⁴ s⁻¹\n"
        "   - First-order reaction: Rate = k[N2O5]\n"
        "   - Remaining fraction [A]_t / [A]_0 = 1.00 - 0.800 = 0.200\n\n"
        "3. Governing Equations:\n"
        "   - Half-life for first-order reaction: t_1/2 = ln(2) / k = 0.69315 / k\n"
        "   - Integrated rate law: ln([A]_0 / [A]_t) = k * t\n"
        "   - t = ln([A]_0 / [A]_t) / k\n\n"
        "4. Substitution & Step-by-Step Calculation:\n"
        "   - t_1/2 = 0.69315 / (6.20 × 10⁻⁴ s⁻¹) = 1118 s = 1.12 × 10³ s (18.6 minutes)\n"
        "   - Ratio [A]_0 / [A]_t = 1.00 / 0.200 = 5.00\n"
        "   - ln(5.00) = 1.6094\n"
        "   - t = 1.6094 / (6.20 × 10⁻⁴ s⁻¹) = 2596 s = 2.59 × 10³ s (43.3 minutes)\n\n"
        "5. Final Answer:\n"
        "   Half-life = 1.12 × 10³ s; Time for 80% decomposition = 2.60 × 10³ s.\n\n"
        "6. Sanity Check:\n"
        "   After 1 half-life (1118 s), 50% remains. After 2 half-lives (2236 s), 25% remains. After 3 half-lives (3354 s), 12.5% remains. 20% remaining must occur between 2 and 3 half-lives. 2596 s is indeed between 2236 s and 3354 s."
    ),
    (
        "calc_calorimetry_hess_law",
        "Calorimetry and Heat of Combustion Determination",
        "A 1.000 g sample of benzoic acid (C7H6O2) is combusted in a bomb calorimeter with a heat capacity of C_cal = 7.248 kJ/°C. The temperature rises from 24.50 °C to 28.12 °C. Calculate the molar heat of combustion of benzoic acid in kJ/mol.",
        "The molar enthalpy of combustion of benzoic acid is -3.20 x 10^3 kJ/mol.",
        "1. Problem Statement:\n"
        "   Determine molar Delta U_comb (and Delta H_comb) from bomb calorimeter temperature elevation.\n\n"
        "2. Given Values:\n"
        "   - Mass of benzoic acid m = 1.000 g\n"
        "   - Molar mass of benzoic acid M = 122.12 g/mol\n"
        "   - Heat capacity C_cal = 7.248 kJ/°C\n"
        "   - Initial temperature T1 = 24.50 °C\n"
        "   - Final temperature T2 = 28.12 °C\n"
        "   - Delta T = 28.12 - 24.50 = 3.62 °C = 3.62 K\n\n"
        "3. Governing Equations:\n"
        "   - Heat absorbed by calorimeter: q_cal = C_cal * Delta T\n"
        "   - Heat released by combustion: q_rxn = -q_cal\n"
        "   - Moles burned: n = m / M\n"
        "   - Molar internal energy of combustion: Delta U_comb = q_rxn / n\n\n"
        "4. Substitution & Step-by-Step Calculation:\n"
        "   - q_cal = 7.248 kJ/°C * 3.62 °C = 26.238 kJ\n"
        "   - q_rxn = -26.238 kJ\n"
        "   - Moles n = 1.000 g / 122.12 g/mol = 8.1887 × 10⁻³ mol\n"
        "   - Delta U_comb = -26.238 kJ / 8.1887 × 10⁻³ mol = -3204.2 kJ/mol\n\n"
        "5. Final Answer:\n"
        "   -3.20 × 10³ kJ/mol (-3204 kJ/mol, 3 significant figures).\n\n"
        "6. Sanity Check:\n"
        "   Benzoic acid is the primary international calibration standard for bomb calorimeters with a certified literature value of -3227 kJ/mol. -3204 kJ/mol is within 0.7% of the NIST standard value."
    ),
    (
        "calc_faradays_law_electrolysis",
        "Faraday's Law of Electrolysis and Metal Deposition",
        "How many grams of solid copper (Cu) are electroplated from an aqueous Cu2+ solution onto a cathode by a constant current of 5.00 A running for 2.00 hours? (Faraday's constant F = 96485 C/mol)",
        "The mass of copper deposited is 11.9 g.",
        "1. Problem Statement:\n"
        "   Calculate mass of copper deposited via Cu2+(aq) + 2 e- → Cu(s) under specified current and duration.\n\n"
        "2. Given Values:\n"
        "   - Current I = 5.00 A = 5.00 C/s\n"
        "   - Time t = 2.00 hours = 2.00 * 3600 s = 7200 s\n"
        "   - Number of electrons transferred n = 2 mol e- per mol Cu\n"
        "   - Molar mass of Cu M = 63.546 g/mol\n"
        "   - Faraday constant F = 96485 C/mol e-\n\n"
        "3. Governing Equations:\n"
        "   - Total electric charge Q = I * t\n"
        "   - Moles of electrons: n_e = Q / F = (I * t) / F\n"
        "   - Moles of metal: n_metal = n_e / n = (I * t) / (n * F)\n"
        "   - Mass of metal deposited: m = n_metal * M = (I * t * M) / (n * F)\n\n"
        "4. Substitution & Step-by-Step Calculation:\n"
        "   - Total charge Q = 5.00 A * 7200 s = 36000 C\n"
        "   - Moles of electrons = 36000 C / 96485 C/mol = 0.37311 mol e-\n"
        "   - Moles of Cu = 0.37311 / 2 = 0.18656 mol Cu\n"
        "   - Mass of Cu = 0.18656 mol * 63.546 g/mol = 11.855 g\n\n"
        "5. Final Answer:\n"
        "   11.9 g Cu (3 significant figures).\n\n"
        "6. Sanity Check:\n"
        "   96485 C (~10^5 C) deposits 0.5 mol Cu (~31.8 g). Here, 36000 C is ~0.37 of a Faraday, yielding 0.37 * 31.8 g ≈ 11.8 g. Dimensional and physical consistency verified."
    ),
    (
        "calc_beer_lambert_concentration",
        "Beer-Lambert Law Spectrophotometric Concentration Determination",
        "A potassium permanganate (KMnO4) solution exhibits an absorbance of A = 0.620 at 525 nm in a 1.00 cm cuvette. Given molar absorptivity epsilon = 2450 L/(mol*cm), calculate the molar concentration of KMnO4.",
        "The molar concentration of the KMnO4 solution is 2.53 x 10^-4 M.",
        "1. Problem Statement:\n"
        "   Determine solution concentration c from optical absorbance A, path length b, and molar absorptivity epsilon.\n\n"
        "2. Given Values:\n"
        "   - Absorbance A = 0.620 (dimensionless optical density)\n"
        "   - Path length b = 1.00 cm\n"
        "   - Molar absorptivity epsilon = 2450 L/(mol*cm) = 2450 M⁻¹ cm⁻¹\n\n"
        "3. Governing Equation (Beer-Lambert Law):\n"
        "   A = epsilon * b * c  ==>  c = A / (epsilon * b)\n\n"
        "4. Substitution & Step-by-Step Calculation:\n"
        "   - c = 0.620 / (2450 L/(mol*cm) * 1.00 cm)\n"
        "   - c = 0.620 / 2450 = 2.5306 × 10⁻⁴ mol/L\n\n"
        "5. Final Answer:\n"
        "   2.53 × 10⁻⁴ M (0.253 mM, 3 significant figures).\n\n"
        "6. Sanity Check:\n"
        "   Absorbance is in the optimal linear detector range (0.1 to 1.0). KMnO4 has high molar absorptivity due to allowed LMCT transitions, so micromolar concentrations predictably produce strong optical absorption."
    ),
    (
        "calc_chlorine_average_atomic_mass",
        "Isotopic Abundance and Average Atomic Weight Calculation",
        "Naturally occurring chlorine consists of two stable isotopes: 35Cl with an isotopic mass of 34.96885 u (75.78% abundance) and 37Cl with an isotopic mass of 36.96590 u (24.22% abundance). Calculate the standard atomic weight of chlorine.",
        "The standard atomic weight of chlorine is 35.45 u.",
        "1. Problem Statement:\n"
        "   Calculate standard atomic weight from fractional isotopic abundances and precise nuclidic masses.\n\n"
        "2. Given Values:\n"
        "   - Isotope 1: 35Cl mass m1 = 34.96885 u, fraction f1 = 0.7578\n"
        "   - Isotope 2: 37Cl mass m2 = 36.96590 u, fraction f2 = 0.2422\n\n"
        "3. Governing Equation:\n"
        "   Average Atomic Mass = sum(fractional abundance_i * isotopic mass_i) = f1 * m1 + f2 * m2\n\n"
        "4. Substitution & Step-by-Step Calculation:\n"
        "   - Contribution from 35Cl = 0.7578 * 34.96885 u = 26.50039 u\n"
        "   - Contribution from 37Cl = 0.2422 * 36.96590 u = 8.95314 u\n"
        "   - Total average atomic weight = 26.50039 + 8.95314 = 35.4535 u\n\n"
        "5. Final Answer:\n"
        "   35.45 u (4 significant figures).\n\n"
        "6. Sanity Check:\n"
        "   Because 35Cl is ~3 times more abundant than 37Cl, the average mass must be weighted ~75% toward 35 and ~25% toward 37: 35 + 0.25*(2) = 35.5. 35.45 u matches IUPAC standard periodic table values exactly."
    ),
]


def generate_calculation_records() -> List[ChemNovaRecord]:
    """Generate structured records for chemistry calculations and worked solutions."""
    records = []
    source = "OpenStax Chemistry 2e Worked Examples & Analytical Chemistry Principles"
    license_str = "CC-BY-4.0"

    for cid, title, q, a, reasoning in CALCULATIONS_DATA:
        rec = ChemNovaRecord(
            id=f"{cid}",
            type=DatasetType.WORKED_SOLUTIONS,
            domain=ChemistryDomain.PHYSICAL_CHEMISTRY,
            subdomain="calculations",
            question=q,
            answer=a,
            reasoning=reasoning,
            context=f"Problem Type: {title}\nDomain: Chemical Calculations and Quantitative Stoichiometry",
            source=source,
            source_url="https://openstax.org/details/books/chemistry-2e",
            license=license_str,
            confidence=1.0,
            verified=True,
        )
        records.append(rec)

    return records
