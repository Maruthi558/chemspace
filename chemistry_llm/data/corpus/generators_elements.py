"""Periodic table and element corpus generator.

Generates complete, rigorous scientific records for chemical elements,
isotopes, periodic trends, and fundamental ions.
"""

from typing import List, Dict, Any
from chemistry_llm.data.schema.types import DatasetType, ChemistryDomain, LicenseStatus
from chemistry_llm.data.schema.record import ChemNovaRecord

# Periodic table element metadata: [Z, Symbol, Name, Mass, Config, Group, Period, Category, Phase, EN, MP(K), BP(K), Density(g/cm3)]
ELEMENTS_DATA = [
    # Period 1
    (1, "H", "Hydrogen", 1.008, "1s1", 1, 1, "Nonmetal", "Gas", 2.20, 14.01, 20.28, 0.00008988),
    (2, "He", "Helium", 4.0026, "1s2", 18, 1, "Noble Gas", "Gas", None, 0.95, 4.22, 0.0001785),
    # Period 2
    (3, "Li", "Lithium", 6.94, "[He] 2s1", 1, 2, "Alkali Metal", "Solid", 0.98, 453.69, 1615.0, 0.534),
    (4, "Be", "Beryllium", 9.0122, "[He] 2s2", 2, 2, "Alkaline Earth Metal", "Solid", 1.57, 1560.0, 2742.0, 1.85),
    (5, "B", "Boron", 10.81, "[He] 2s2 2p1", 13, 2, "Metalloid", "Solid", 2.04, 2349.0, 4200.0, 2.34),
    (6, "C", "Carbon", 12.011, "[He] 2s2 2p2", 14, 2, "Nonmetal", "Solid", 2.55, 3823.0, 4098.0, 2.267),
    (7, "N", "Nitrogen", 14.007, "[He] 2s2 2p3", 15, 2, "Nonmetal", "Gas", 3.04, 63.15, 77.36, 0.0012506),
    (8, "O", "Oxygen", 15.999, "[He] 2s2 2p4", 16, 2, "Nonmetal", "Gas", 3.44, 54.36, 90.20, 0.001429),
    (9, "F", "Fluorine", 18.998, "[He] 2s2 2p5", 17, 2, "Halogen", "Gas", 3.98, 53.53, 85.03, 0.001696),
    (10, "Ne", "Neon", 20.180, "[He] 2s2 2p6", 18, 2, "Noble Gas", "Gas", None, 24.56, 27.07, 0.0009002),
    # Period 3
    (11, "Na", "Sodium", 22.990, "[Ne] 3s1", 1, 3, "Alkali Metal", "Solid", 0.93, 370.87, 1156.0, 0.971),
    (12, "Mg", "Magnesium", 24.305, "[Ne] 3s2", 2, 3, "Alkaline Earth Metal", "Solid", 1.31, 923.0, 1363.0, 1.738),
    (13, "Al", "Aluminium", 26.982, "[Ne] 3s2 3p1", 13, 3, "Post-Transition Metal", "Solid", 1.61, 933.47, 2792.0, 2.70),
    (14, "Si", "Silicon", 28.085, "[Ne] 3s2 3p2", 14, 3, "Metalloid", "Solid", 1.90, 1687.0, 3538.0, 2.329),
    (15, "P", "Phosphorus", 30.974, "[Ne] 3s2 3p3", 15, 3, "Nonmetal", "Solid", 2.19, 317.30, 550.0, 1.823),
    (16, "S", "Sulfur", 32.06, "[Ne] 3s2 3p4", 16, 3, "Nonmetal", "Solid", 2.58, 388.36, 717.8, 2.07),
    (17, "Cl", "Chlorine", 35.45, "[Ne] 3s2 3p5", 17, 3, "Halogen", "Gas", 3.16, 171.6, 239.11, 0.003214),
    (18, "Ar", "Argon", 39.948, "[Ne] 3s2 3p6", 18, 3, "Noble Gas", "Gas", None, 83.80, 87.30, 0.0017837),
    # Period 4
    (19, "K", "Potassium", 39.098, "[Ar] 4s1", 1, 4, "Alkali Metal", "Solid", 0.82, 336.53, 1032.0, 0.862),
    (20, "Ca", "Calcium", 40.078, "[Ar] 4s2", 2, 4, "Alkaline Earth Metal", "Solid", 1.00, 1115.0, 1757.0, 1.54),
    (21, "Sc", "Scandium", 44.956, "[Ar] 3d1 4s2", 3, 4, "Transition Metal", "Solid", 1.36, 1814.0, 3109.0, 2.989),
    (22, "Ti", "Titanium", 47.867, "[Ar] 3d2 4s2", 4, 4, "Transition Metal", "Solid", 1.54, 1941.0, 3560.0, 4.54),
    (23, "V", "Vanadium", 50.942, "[Ar] 3d3 4s2", 5, 4, "Transition Metal", "Solid", 1.63, 2183.0, 3680.0, 6.11),
    (24, "Cr", "Chromium", 51.996, "[Ar] 3d5 4s1", 6, 4, "Transition Metal", "Solid", 1.66, 2180.0, 2944.0, 7.15),
    (25, "Mn", "Manganese", 54.938, "[Ar] 3d5 4s2", 7, 4, "Transition Metal", "Solid", 1.55, 1519.0, 2334.0, 7.44),
    (26, "Fe", "Iron", 55.845, "[Ar] 3d6 4s2", 8, 4, "Transition Metal", "Solid", 1.83, 1811.0, 3134.0, 7.874),
    (27, "Co", "Cobalt", 58.933, "[Ar] 3d7 4s2", 9, 4, "Transition Metal", "Solid", 1.88, 1768.0, 3200.0, 8.86),
    (28, "Ni", "Nickel", 58.693, "[Ar] 3d8 4s2", 10, 4, "Transition Metal", "Solid", 1.91, 1728.0, 3186.0, 8.912),
    (29, "Cu", "Copper", 63.546, "[Ar] 3d10 4s1", 11, 4, "Transition Metal", "Solid", 1.90, 1357.77, 2835.0, 8.96),
    (30, "Zn", "Zinc", 65.38, "[Ar] 3d10 4s2", 12, 4, "Transition Metal", "Solid", 1.65, 692.68, 1180.0, 7.134),
    (31, "Ga", "Gallium", 69.723, "[Ar] 3d10 4s2 4p1", 13, 4, "Post-Transition Metal", "Solid", 1.81, 302.91, 2673.0, 5.907),
    (32, "Ge", "Germanium", 72.630, "[Ar] 3d10 4s2 4p2", 14, 4, "Metalloid", "Solid", 2.01, 1211.40, 3106.0, 5.323),
    (33, "As", "Arsenic", 74.922, "[Ar] 3d10 4s2 4p3", 15, 4, "Metalloid", "Solid", 2.18, 1090.0, 887.0, 5.776),
    (34, "Se", "Selenium", 78.971, "[Ar] 3d10 4s2 4p4", 16, 4, "Nonmetal", "Solid", 2.55, 494.0, 958.0, 4.809),
    (35, "Br", "Bromine", 79.904, "[Ar] 3d10 4s2 4p5", 17, 4, "Halogen", "Liquid", 2.96, 265.8, 332.0, 3.122),
    (36, "Kr", "Krypton", 83.798, "[Ar] 3d10 4s2 4p6", 18, 4, "Noble Gas", "Gas", 3.00, 115.79, 119.93, 0.003733),
    # Period 5
    (37, "Rb", "Rubidium", 85.468, "[Kr] 5s1", 1, 5, "Alkali Metal", "Solid", 0.82, 312.46, 961.0, 1.532),
    (38, "Sr", "Strontium", 87.62, "[Kr] 5s2", 2, 5, "Alkaline Earth Metal", "Solid", 0.95, 1050.0, 1655.0, 2.64),
    (39, "Y", "Yttrium", 88.906, "[Kr] 4d1 5s2", 3, 5, "Transition Metal", "Solid", 1.22, 1799.0, 3609.0, 4.469),
    (40, "Zr", "Zirconium", 91.224, "[Kr] 4d2 5s2", 4, 5, "Transition Metal", "Solid", 1.33, 2128.0, 4682.0, 6.506),
    (41, "Nb", "Niobium", 92.906, "[Kr] 4d4 5s1", 5, 5, "Transition Metal", "Solid", 1.60, 2750.0, 5017.0, 8.57),
    (42, "Mo", "Molybdenum", 95.95, "[Kr] 4d5 5s1", 6, 5, "Transition Metal", "Solid", 2.16, 2896.0, 4912.0, 10.22),
    (43, "Tc", "Technetium", 98.0, "[Kr] 4d5 5s2", 7, 5, "Transition Metal", "Solid", 1.90, 2430.0, 4538.0, 11.5),
    (44, "Ru", "Ruthenium", 101.07, "[Kr] 4d7 5s1", 8, 5, "Transition Metal", "Solid", 2.20, 2607.0, 4423.0, 12.37),
    (45, "Rh", "Rhodium", 102.91, "[Kr] 4d8 5s1", 9, 5, "Transition Metal", "Solid", 2.28, 2237.0, 3968.0, 12.41),
    (46, "Pd", "Palladium", 106.42, "[Kr] 4d10", 10, 5, "Transition Metal", "Solid", 2.20, 1828.05, 3236.0, 12.02),
    (47, "Ag", "Silver", 107.868, "[Kr] 4d10 5s1", 11, 5, "Transition Metal", "Solid", 1.93, 1234.93, 2435.0, 10.501),
    (48, "Cd", "Cadmium", 112.41, "[Kr] 4d10 5s2", 12, 5, "Transition Metal", "Solid", 1.69, 594.22, 1040.0, 8.69),
    (49, "In", "Indium", 114.82, "[Kr] 4d10 5s2 5p1", 13, 5, "Post-Transition Metal", "Solid", 1.78, 429.75, 2345.0, 7.31),
    (50, "Sn", "Tin", 118.71, "[Kr] 4d10 5s2 5p2", 14, 5, "Post-Transition Metal", "Solid", 1.96, 505.08, 2875.0, 7.287),
    (51, "Sb", "Antimony", 121.76, "[Kr] 4d10 5s2 5p3", 15, 5, "Metalloid", "Solid", 2.05, 903.78, 1860.0, 6.685),
    (52, "Te", "Tellurium", 127.60, "[Kr] 4d10 5s2 5p4", 16, 5, "Metalloid", "Solid", 2.10, 722.66, 1261.0, 6.232),
    (53, "I", "Iodine", 126.904, "[Kr] 4d10 5s2 5p5", 17, 5, "Halogen", "Solid", 2.66, 386.85, 457.4, 4.93),
    (54, "Xe", "Xenon", 131.29, "[Kr] 4d10 5s2 5p6", 18, 5, "Noble Gas", "Gas", 2.60, 161.40, 165.03, 0.005887),
    # Period 6 & 7 Key Elements
    (55, "Cs", "Cesium", 132.905, "[Xe] 6s1", 1, 6, "Alkali Metal", "Solid", 0.79, 301.59, 944.0, 1.93),
    (56, "Ba", "Barium", 137.327, "[Xe] 6s2", 2, 6, "Alkaline Earth Metal", "Solid", 0.89, 1000.0, 2170.0, 3.594),
    (57, "La", "Lanthanum", 138.905, "[Xe] 5d1 6s2", 3, 6, "Lanthanide", "Solid", 1.10, 1193.0, 3737.0, 6.145),
    (58, "Ce", "Cerium", 140.116, "[Xe] 4f1 5d1 6s2", 3, 6, "Lanthanide", "Solid", 1.12, 1068.0, 3716.0, 6.77),
    (73, "Ta", "Tantalum", 180.948, "[Xe] 4f14 5d3 6s2", 5, 6, "Transition Metal", "Solid", 1.50, 3290.0, 5731.0, 16.69),
    (74, "W", "Tungsten", 183.84, "[Xe] 4f14 5d4 6s2", 6, 6, "Transition Metal", "Solid", 2.36, 3695.0, 5828.0, 19.25),
    (75, "Re", "Rhenium", 186.207, "[Xe] 4f14 5d5 6s2", 7, 6, "Transition Metal", "Solid", 1.90, 3459.0, 5869.0, 21.02),
    (76, "Os", "Osmium", 190.23, "[Xe] 4f14 5d6 6s2", 8, 6, "Transition Metal", "Solid", 2.20, 3306.0, 5285.0, 22.59),
    (77, "Ir", "Iridium", 192.217, "[Xe] 4f14 5d7 6s2", 9, 6, "Transition Metal", "Solid", 2.20, 2719.0, 4701.0, 22.56),
    (78, "Pt", "Platinum", 195.084, "[Xe] 4f14 5d9 6s1", 10, 6, "Transition Metal", "Solid", 2.28, 2041.4, 4098.0, 21.45),
    (79, "Au", "Gold", 196.967, "[Xe] 4f14 5d10 6s1", 11, 6, "Transition Metal", "Solid", 2.54, 1337.33, 3129.0, 19.282),
    (80, "Hg", "Mercury", 200.592, "[Xe] 4f14 5d10 6s2", 12, 6, "Transition Metal", "Liquid", 2.00, 234.32, 629.88, 13.5336),
    (81, "Tl", "Thallium", 204.38, "[Xe] 4f14 5d10 6s2 6p1", 13, 6, "Post-Transition Metal", "Solid", 1.62, 577.0, 1746.0, 11.85),
    (82, "Pb", "Lead", 207.2, "[Xe] 4f14 5d10 6s2 6p2", 14, 6, "Post-Transition Metal", "Solid", 1.87, 600.61, 2022.0, 11.34),
    (83, "Bi", "Bismuth", 208.980, "[Xe] 4f14 5d10 6s2 6p3", 15, 6, "Post-Transition Metal", "Solid", 2.02, 544.7, 1837.0, 9.78),
    (90, "Th", "Thorium", 232.038, "[Rn] 6d2 7s2", 3, 7, "Actinide", "Solid", 1.30, 2115.0, 5061.0, 11.72),
    (92, "U", "Uranium", 238.029, "[Rn] 5f3 6d1 7s2", 3, 7, "Actinide", "Solid", 1.38, 1405.3, 4404.0, 18.95),
    (94, "Pu", "Plutonium", 244.0, "[Rn] 5f6 7s2", 3, 7, "Actinide", "Solid", 1.28, 912.5, 3505.0, 19.86),
]


def generate_element_records() -> List[ChemNovaRecord]:
    """Generate structured records for chemical elements."""
    records = []
    source = "IUPAC Periodic Table & NIST Physical Reference Data"
    license_str = "CC-BY-4.0"

    for z, sym, name, mass, cfg, grp, per, cat, phase, en, mp, bp, dens in ELEMENTS_DATA:
        en_str = f"{en:.2f}" if en else "Not applicable (Noble gas / unmeasured)"
        mp_c = round(mp - 273.15, 1) if mp else "N/A"
        bp_c = round(bp - 273.15, 1) if bp else "N/A"

        context = (
            f"Element: {name} (Symbol: {sym}, Atomic Number Z = {z})\n"
            f"Standard Atomic Weight: {mass} u\n"
            f"Ground State Electron Configuration: {cfg}\n"
            f"Periodic Classification: Group {grp}, Period {per}, Category: {cat}\n"
            f"Physical Phase at STP: {phase}\n"
            f"Electronegativity (Pauling Scale): {en_str}\n"
            f"Melting Point: {mp} K ({mp_c} °C)\n"
            f"Boiling Point: {bp} K ({bp_c} °C)\n"
            f"Density: {dens} g/cm³"
        )

        q = f"What are the atomic structure, electron configuration, and fundamental physical properties of {name} ({sym})?"
        a = (
            f"{name} ({sym}, atomic number {z}) has a standard atomic weight of {mass} u. "
            f"Its ground-state electron configuration is {cfg}. Located in Group {grp} and Period {per}, "
            f"it is classified as a {cat}. At standard temperature and pressure, {name} exists in the {phase.lower()} phase "
            f"with a density of {dens} g/cm³. Its Pauling electronegativity is {en_str}, with a melting point of {mp} K "
            f"({mp_c} °C) and a boiling point of {bp} K ({bp_c} °C)."
        )

        rec = ChemNovaRecord(
            id=f"elem_{z:03d}_{sym.lower()}",
            type=DatasetType.ELEMENT_INFORMATION,
            domain=ChemistryDomain.INORGANIC_CHEMISTRY,
            subdomain="periodic_table",
            question=q,
            answer=a,
            context=context,
            formula=sym,
            molecular_formula=sym,
            source=source,
            source_url="https://iupac.org/what-we-do/periodic-table-of-elements/",
            license=license_str,
            confidence=1.0,
            verified=True,
        )
        records.append(rec)

    return records


def generate_periodic_trend_records() -> List[ChemNovaRecord]:
    """Generate periodic trends knowledge records."""
    records = []
    source = "OpenStax Chemistry 2e & IUPAC Compendium of Chemical Terminology"
    license_str = "CC-BY-4.0"

    trends = [
        (
            "atomic_radius",
            "Periodic Trend in Atomic Radius",
            "Explain the periodic trends in atomic radius across periods and down groups.",
            "Atomic radius decreases across a period from left to right and increases down a group from top to bottom.",
            "Across a period (left to right), the principal quantum number n remains constant while the effective nuclear charge (Z_eff) increases as protons are added to the nucleus. This stronger electrostatic attraction pulls the electron cloud closer to the nucleus, decreasing atomic radius. Down a group (top to bottom), additional electron shells (higher principal quantum numbers n) are occupied. The inner shells shield outer valence electrons, increasing the average distance between the nucleus and valence shell, thereby expanding the atomic radius."
        ),
        (
            "first_ionization_energy",
            "Periodic Trend in First Ionization Energy (IE1)",
            "What is first ionization energy and how does it vary across the periodic table?",
            "First ionization energy (IE1) generally increases across a period from left to right and decreases down a group.",
            "Ionization energy is the minimum energy required to remove the most loosely bound valence electron from an isolated gaseous atom in its ground state: X(g) → X+(g) + e-. Across a period, increasing effective nuclear charge (Z_eff) holds valence electrons more tightly, requiring more energy to eject an electron. Exceptions occur at Group 2 to 13 (e.g., Be to B, removing a 2p electron vs a paired 2s) and Group 15 to 16 (e.g., N to O, removing a paired 2p electron with inter-electron repulsion). Down a group, valence electrons reside in higher energy levels further from the nucleus with increased shielding, decreasing the energy required for removal."
        ),
        (
            "electronegativity",
            "Periodic Trend in Pauling Electronegativity",
            "How does electronegativity vary across the periodic table and what is its origin?",
            "Electronegativity increases across a period from left to right and decreases down a group, with Fluorine having the highest value (3.98).",
            "Electronegativity is the relative measure of an atom's ability in a chemical compound to attract shared electrons toward itself in a covalent bond. Across a period, higher effective nuclear charge and smaller atomic radii allow the nucleus to attract bonding electrons more effectively. Down a group, increased atomic size and electron shielding reduce the effective nuclear pull on shared bonding pairs. Noble gases generally lack standard Pauling electronegativity values due to filled valence shells."
        ),
        (
            "electron_affinity",
            "Periodic Trend in Electron Affinity",
            "Describe the periodic trend of electron affinity and key anomalies.",
            "Electron affinity becomes more exothermic (more negative) across a period from left to right and generally less exothermic down a group, with Chlorine having the most exothermic electron affinity.",
            "Electron affinity (EA) is the energy change accompanying the addition of an electron to an isolated gaseous atom: X(g) + e- → X-(g). Across a period, increasing nuclear charge makes electron addition more favorable. Down a group, addition occurs into higher, more shielded shells, reducing attraction. An important anomaly is Fluorine vs Chlorine: Chlorine (-349 kJ/mol) has a more exothermic EA than Fluorine (-328 kJ/mol) because the small, compact 2p subshell of Fluorine suffers substantial electron-electron repulsion when accepting an additional electron."
        ),
        (
            "metallic_character",
            "Periodic Trend in Metallic Character",
            "How does metallic character vary across the periodic table?",
            "Metallic character decreases across a period from left to right and increases down a group from top to bottom.",
            "Metals readily lose valence electrons to form cations (low ionization energy, low electronegativity, high electrical and thermal conductivity). As effective nuclear charge increases across a period, valence electrons are held more tightly, reducing metallic character. Down a group, greater distance and electron shielding facilitate electron loss, increasing metallic character (e.g., in Group 14, carbon is nonmetal, silicon/germanium are metalloids, and tin/lead are post-transition metals)."
        ),
        (
            "lanthanide_contraction",
            "Lanthanide Contraction and Relativistic Effects",
            "What is the lanthanide contraction and what are its chemical consequences?",
            "The lanthanide contraction is the steady decrease in atomic and ionic radii across the lanthanide series (Z=57 to 71) caused by poor shielding of the nuclear charge by 4f electrons.",
            "Because 4f orbitals are diffused and penetrate poorly toward the nucleus, each additional proton added across the lanthanides exerts an abnormally strong electrostatic pull on outer 5d and 6s electrons. Chemical consequences: 1. Period 5 and Period 6 transition elements of the same group exhibit virtually identical atomic and ionic radii (e.g., Zr radius 160 pm vs Hf radius 159 pm; Mo vs W), making their chemical separation difficult. 2. Greatly increased density and ionization energies in 5d metals (Pt, Au, Hg). 3. Relativistic stabilization of 6s electrons explains why gold is golden rather than silvery and mercury is a liquid at room temperature."
        ),
        (
            "diagonal_relationship",
            "Diagonal Relationships in the Periodic Table",
            "Explain diagonal relationships in the periodic table with examples (Li-Mg, Be-Al, B-Si).",
            "A diagonal relationship refers to chemical similarities between diagonally adjacent elements in the second and third periods (Li/Mg, Be/Al, B/Si) due to similar charge densities (ionic charge to ionic radius ratio).",
            "Moving right across a period increases charge density and electronegativity, whereas moving down a group decreases them. These opposite effects cancel diagonally, yielding similar polarizing power: 1. Lithium and Magnesium both form normal oxides (Li2O, MgO) rather than peroxides/superoxides, decompose their carbonates thermally to oxides and CO2, and have organometallic reagents with covalent character (LiR, RMgX). 2. Beryllium and Aluminium both form amphoteric oxides and hydroxides (BeO, Al2O3) and bridged covalent halides (BeCl2, Al2Cl6). 3. Boron and Silicon both form acidic polymeric oxides and flammable gaseous hydrides."
        ),
        (
            "inert_pair_effect",
            "The Inert Pair Effect in Heavy Post-Transition Metals",
            "What is the inert pair effect and how does it influence oxidation state stability in heavy p-block elements?",
            "The inert pair effect is the thermodynamic tendency of the outermost valence s-electrons to remain unshared or un-ionized in heavy p-block elements (Tl, Pb, Bi), stabilizing an oxidation state that is two units lower than the group maximum.",
            "As principal quantum number reaches n=6, outer 6s electrons experience poor shielding from 4f and 5d subshells and relativistic mass contraction, lowering the energy of the 6s orbital and making 6s electrons resistant to bonding or ionization. Consequently: 1. Group 13: Tl(I) is far more stable than Tl(III), unlike Al(III) or Ga(III). 2. Group 14: Pb(II) is stable whereas Pb(IV) is a strong oxidizing agent (e.g., PbO2). 3. Group 15: Bi(III) is stable while Bi(V) is a ferocious oxidizer (NaBiO3)."
        ),
    ]

    for tid, title, q, a, reasoning in trends:
        rec = ChemNovaRecord(
            id=f"ptrend_{tid}",
            type=DatasetType.CHEMISTRY_CONCEPTS,
            domain=ChemistryDomain.GENERAL_CHEMISTRY,
            subdomain="periodic_trends",
            question=q,
            answer=a,
            reasoning=reasoning,
            context=f"Concept: {title}\nDomain: Periodic Properties of the Elements.",
            source=source,
            source_url="https://openstax.org/details/books/chemistry-2e",
            license=license_str,
            confidence=1.0,
            verified=True,
        )
        records.append(rec)

    return records


def generate_isotopes_and_ions_records() -> List[ChemNovaRecord]:
    """Generate structured records for key isotopes and chemical ions."""
    records = []
    source = "NIST Isotope Abundance & IUPAC Inorganic Nomenclature"
    license_str = "CC-BY-4.0"

    items = [
        ("iso_h1", "Protium (1H)", "What is protium and its isotopic characteristics?", "Protium (1H) is the most abundant hydrogen isotope, consisting of 1 proton and 0 neutrons with an atomic mass of 1.007825 u and 99.9885% natural abundance.", "H", "1H"),
        ("iso_h2", "Deuterium (2H or D)", "What is deuterium and its applications in chemistry?", "Deuterium (2H or D) is a stable isotope of hydrogen containing 1 proton and 1 neutron (mass 2.0141 u, natural abundance 0.0115%). It is widely used in NMR solvent deuteration (e.g. CDCl3, D2O) and kinetic isotope effect (KIE) studies.", "H", "2H"),
        ("iso_h3", "Tritium (3H or T)", "What is tritium and its radioactive decay characteristics?", "Tritium (3H or T) is a radioactive hydrogen isotope with 1 proton and 2 neutrons (half-life 12.32 years) decaying via low-energy beta emission into Helium-3: 3H → 3He + e- + anti-nu_e.", "H", "3H"),
        ("iso_c12", "Carbon-12 (12C)", "What is Carbon-12 and its role in SI atomic mass definitions?", "Carbon-12 (12C) is the standard reference isotope for atomic mass units (daltons), defined historically as having an atomic mass of exactly 12 daltons in its unbound ground state (6 protons, 6 neutrons, 98.93% natural abundance).", "C", "12C"),
        ("iso_c13", "Carbon-13 (13C)", "What is Carbon-13 and its spectroscopic importance?", "Carbon-13 (13C) is a stable carbon isotope with 6 protons and 7 neutrons (1.109% abundance). Having nuclear spin I = 1/2, it is the active nucleus for 13C Nuclear Magnetic Resonance (NMR) spectroscopy.", "C", "13C"),
        ("iso_c14", "Carbon-14 (14C)", "Explain radiocarbon dating and the nuclear formation of Carbon-14.", "Carbon-14 (14C) is a radioactive isotope (half-life 5,730 years) produced in the upper atmosphere by cosmic neutron capture on nitrogen (14N + n → 14C + p). It is utilized for radiocarbon dating of organic archaeological artifacts up to ~50,000 years.", "C", "14C"),
        ("iso_n15", "Nitrogen-15 (15N)", "What is Nitrogen-15 and its role in biochemical labeling?", "Nitrogen-15 (15N) is a stable isotope (0.368% abundance) with nuclear spin I = 1/2, utilized extensively in multidimensional NMR spectroscopy of proteins and nucleic acids, as demonstrated in the classic Meselson-Stahl DNA replication experiment.", "N", "15N"),
        ("iso_o18", "Oxygen-18 (18O)", "What is Oxygen-18 and how is it used as an isotopic tracer?", "Oxygen-18 (18O) is a stable heavy oxygen isotope (0.205% natural abundance) used as an isotopic tracer in chemical reaction mechanism elucidation (e.g. ester hydrolysis C-O vs acyl cleavage) and paleoclimatology delta-18O ice core thermometry.", "O", "18O"),
        ("iso_cl35_cl37", "Chlorine Isotopes (35Cl and 37Cl)", "Explain the natural isotopic distribution of Chlorine and its MS signature.", "Natural chlorine consists of 35Cl (~75.78%) and 37Cl (~24.22%), yielding an approximate 3:1 isotopic ratio that produces characteristic M and M+2 doublets in mass spectrometry.", "Cl", "35Cl"),
        ("iso_u235", "Uranium-235 (235U)", "What makes Uranium-235 fissile compared to Uranium-238?", "Uranium-235 (0.72% natural abundance) is a fissile actinide isotope capable of sustaining a nuclear fission chain reaction with thermal neutrons, releasing ~200 MeV per fission event, unlike fertile Uranium-238 which requires fast neutrons.", "U", "235U"),
        ("ion_nh4", "Ammonium Cation (NH4+)", "What is the ammonium ion, its geometry, and formal charges?", "The ammonium cation (NH4+) is a polyatomic monovalent cation formed by protonation of ammonia (NH3). It has tetrahedral geometry (sp3 hybridized N) with bond angles of 109.5° and a net +1 formal charge centered on nitrogen.", "[NH4+]", "NH4+"),
        ("ion_h3o", "Hydronium Cation (H3O+)", "Describe the hydronium cation structure and Grotthuss proton hopping.", "The hydronium ion (H3O+) is the conjugate acid of water formed upon protonation. It has trigonal pyramidal geometry (sp3 hybridized O with one lone pair, bond angle ~113°) and transfers protons rapidly through aqueous networks via the Grotthuss mechanism.", "[OH3+]", "H3O+"),
        ("ion_so4", "Sulfate Dianion (SO4 2-)", "Describe the sulfate ion structure, oxidation states, and resonance.", "The sulfate dianion (SO4 2-) has tetrahedral geometry with Sulfur in the +6 oxidation state. It exhibits resonance stabilization across four equivalent S-O bonds with a formal bond order of 1.5.", "[O-]S(=O)(=O)[O-]", "SO4(2-)"),
        ("ion_no3", "Nitrate Anion (NO3-)", "Describe the planar structure and resonance hybridization of the nitrate ion.", "The nitrate anion (NO3-) has planar trigonal geometry (D3h symmetry, sp2 hybridized N, bond angles 120°) with nitrogen in the +5 oxidation state and a delocalized 6-electron pi system giving each N-O bond an order of 1.33.", "[N+](=O)([O-])[O-]", "NO3-"),
        ("ion_co3", "Carbonate Dianion (CO3 2-)", "What is the structure, hybridization, and resonance of carbonate?", "The carbonate dianion (CO3 2-) has planar trigonal geometry (sp2 hybridized C, bond angles 120°) with three equivalent C-O resonance bonds of length 1.28 Å (intermediate between single and double bonds) and Delocalized -2 charge.", "[O-]C(=O)[O-]", "CO3(2-)"),
        ("ion_po4", "Phosphate Trianion (PO4 3-)", "Explain the phosphate ion geometry, pKa values, and biological role.", "The orthophosphate anion (PO4 3-) has tetrahedral geometry (sp3 hybridized P in the +5 oxidation state) with four equivalent P-O bonds. It forms the backbone of DNA/RNA and the energy currency of life via phosphoanhydride bonds in ATP.", "[O-]P(=O)([O-])[O-]", "PO4(3-)"),
        ("ion_mno4", "Permanganate Anion (MnO4-)", "Why is the permanganate ion deeply purple despite Manganese having a d0 configuration?", "The permanganate ion (MnO4-) has tetrahedral geometry with Mn(VII) in a d0 electronic configuration. Its intense deep purple color arises from Ligand-to-Metal Charge Transfer (LMCT) transitions where electrons excite from oxygen 2p lone pairs to vacant manganese 3d orbitals.", "[O-][Mn](=O)(=O)=O", "MnO4-"),
        ("ion_cr2o7", "Dichromate Dianion (Cr2O7 2-)", "Describe the structure, bridging oxygen, and pH equilibrium of dichromate.", "The dichromate ion (Cr2O7 2-) consists of two corner-sharing CrO4 tetrahedra linked by a bent bridging oxygen (Cr-O-Cr angle ~126°), with Cr in the +6 oxidation state. In aqueous solution, it exists in pH-dependent equilibrium with yellow chromate: Cr2O7(2-) + H2O ⇌ 2 CrO4(2-) + 2 H+.", "[O-][Cr](=O)(=O)O[Cr](=O)(=O)[O-]", "Cr2O7(2-)"),
    ]

    for iid, name, q, a, smiles, formula in items:
        rec = ChemNovaRecord(
            id=f"ion_iso_{iid}",
            type=DatasetType.MOLECULAR_INFORMATION,
            domain=ChemistryDomain.INORGANIC_CHEMISTRY,
            subdomain="isotopes_and_ions",
            question=q,
            answer=a,
            smiles=smiles,
            formula=formula,
            source=source,
            source_url="https://physics.nist.gov/cgi-bin/Compositions/stand_alone.pl",
            license=license_str,
            confidence=1.0,
            verified=True,
        )
        records.append(rec)

    return records

