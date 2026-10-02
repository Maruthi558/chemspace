"""Intent classification router for ChemNova Chemistry AI.

Determines whether incoming user messages are greetings, chemistry questions,
calculations, concept queries, molecule/formula lookups, laboratory tool requests,
or general non-chemistry inquiries.
"""

from enum import Enum
import re
from typing import Dict, List, Optional, Tuple


class IntentType(str, Enum):
    """Categorized user intent types."""
    GREETING = "greeting"
    CHEMISTRY = "chemistry"
    CHEMISTRY_CALCULATION = "chemistry_calculation"
    CHEMISTRY_CONCEPT = "chemistry_concept"
    CHEMISTRY_MOLECULE = "chemistry_molecule"
    CHEMISTRY_TOOL = "chemistry_tool"
    GENERAL_NON_CHEMISTRY = "general_non_chemistry"


# Core Chemistry Vocabulary Patterns for Classification
CHEM_KEYWORDS = {
    # Fundamental concepts
    "atom", "atoms", "atomic", "molecule", "molecules", "molecular", "element", "elements",
    "compound", "compounds", "proton", "protons", "neutron", "neutrons", "electron", "electrons",
    "nucleus", "orbital", "orbitals", "valence", "bond", "bonds", "bonding", "covalent",
    "ionic", "metallic", "hydrogen bond", "electronegativity", "dipole",
    # Reactions & thermodynamics
    "acid", "acids", "base", "bases", "alkali", "salt", "ph", "pka", "pkb", "buffer",
    "oxidation", "reduction", "redox", "reaction", "reactions", "reactant", "reactants",
    "product", "products", "catalyst", "catalysts", "catalysis", "activation energy",
    "enthalpy", "entropy", "gibbs", "equilibrium", "le chatelier", "kinetics", "rate law",
    "stoichiometry", "yield", "limiting reactant",
    # Branches & Techniques
    "organic chemistry", "inorganic chemistry", "physical chemistry", "analytical chemistry",
    "biochemistry", "spectroscopy", "spectrometric", "nmr", "h-nmr", "c-nmr", "infrared",
    "ir", "ftir", "uv-vis", "mass spectrometry", "mass spec", "chromatography", "hplc", "gc",
    "titration", "solubility", "precipitation", "precipitate", "solution", "solute", "solvent",
    "concentration", "molarity", "molality", "periodic table",
    # Organic structures
    "alkane", "alkene", "alkyne", "aromatic", "benzene", "alcohol", "aldehyde", "ketone",
    "carboxylic acid", "ester", "ether", "amine", "amide", "hydroxyl", "carbonyl", "carboxyl",
    "aspirin", "glucose", "ethanol", "methane", "caffeine", "water", "ammonia", "ozone",
}

# Elements and common formulas regex
ELEMENT_NAMES = [
    "hydrogen", "helium", "lithium", "beryllium", "boron", "carbon", "nitrogen", "oxygen",
    "fluorine", "neon", "sodium", "magnesium", "aluminum", "silicon", "phosphorus", "sulfur",
    "chlorine", "argon", "potassium", "calcium", "scandium", "titanium", "vanadium", "chromium",
    "manganese", "iron", "cobalt", "nickel", "copper", "zinc", "gallium", "germanium",
    "arsenic", "selenium", "bromine", "krypton", "silver", "gold", "mercury", "lead", "uranium"
]

COMMON_FORMULA_PATTERNS = [
    r"\bH2O\b", r"\bCO2\b", r"\bCH4\b", r"\bNH3\b", r"\bNaCl\b", r"\bHCl\b",
    r"\bNaOH\b", r"\bH2SO4\b", r"\bHNO3\b", r"\bC6H12O6\b", r"\bC2H5OH\b",
    r"\bO2\b", r"\bN2\b", r"\bH2\b", r"\bCl2\b", r"\bCaCO3\b"
]


class ChemistryRouter:
    """Classifies user messages to guide downstream chemistry AI behaviors."""

    def __init__(self):
        self._greetings_pattern = re.compile(
            r"^(hi|hello|hey|howdy|greetings|good\s+(morning|afternoon|evening|day)|sup|what\'?s\s+up|yo)\b[!?.]*$",
            re.IGNORECASE,
        )
        self._tool_pattern = re.compile(
            r"\b(draw|sketch|render|visualize|chemdraw|rdkit|simulate|predict\s+reaction|plot\s+spectrum|generate\s+3d)\b",
            re.IGNORECASE,
        )
        self._calc_pattern = re.compile(
            r"\b(molecular\s+weight|molar\s+mass|atomic\s+mass|calculate\s+(ph|poh|mw|moles|mass|concentration|yield)|how\s+many\s+moles|formula\s+weight|molar\s+weight)\b",
            re.IGNORECASE,
        )
        self._formula_pattern = re.compile(
            r"\b(molecular\s+formula|chemical\s+formula|empirical\s+formula|formula\s+of|structure\s+of|smiles\s+of)\b",
            re.IGNORECASE,
        )
        self._concept_pattern = re.compile(
            r"\b(what\s+is|explain|describe|define|how\s+does|difference\s+between|why\s+is|principles?\s+of)\b",
            re.IGNORECASE,
        )

    def route(self, message: str) -> Tuple[IntentType, float]:
        """Classify message into an IntentType with confidence score.

        Returns:
            Tuple[IntentType, float]: (detected_intent, confidence)
        """
        if not message or not message.strip():
            return IntentType.GREETING, 0.5

        text = message.strip()
        text_lower = text.lower()

        # 1. Greetings (clean standalone or polite greeting)
        if self._greetings_pattern.match(text_lower):
            return IntentType.GREETING, 0.99

        # 2. Chemistry Laboratory / Tool Requests
        if self._tool_pattern.search(text_lower):
            # Check if mentions a molecule or chemical task
            return IntentType.CHEMISTRY_TOOL, 0.95

        # 3. Chemistry Calculations
        if self._calc_pattern.search(text_lower):
            return IntentType.CHEMISTRY_CALCULATION, 0.95

        # 4. Molecule / Formula lookups
        if self._formula_pattern.search(text_lower):
            return IntentType.CHEMISTRY_MOLECULE, 0.92

        # 5. Check presence of chemistry keywords, elements, or formulas
        has_chem_keyword = any(kw in text_lower for kw in CHEM_KEYWORDS)
        has_element_name = any(re.search(rf"\b{elem}\b", text_lower) for elem in ELEMENT_NAMES)
        has_formula = any(re.search(pat, text, re.IGNORECASE) for pat in COMMON_FORMULA_PATTERNS)

        if has_chem_keyword or has_element_name or has_formula:
            # Differentiate concept questions from general chemistry
            if self._concept_pattern.search(text_lower):
                return IntentType.CHEMISTRY_CONCEPT, 0.90
            return IntentType.CHEMISTRY, 0.88

        # 6. General Non-Chemistry check
        return IntentType.GENERAL_NON_CHEMISTRY, 0.85

    def is_chemistry_related(self, intent: IntentType) -> bool:
        """Check if an intent belongs to the Chemistry domain."""
        return intent in {
            IntentType.CHEMISTRY,
            IntentType.CHEMISTRY_CALCULATION,
            IntentType.CHEMISTRY_CONCEPT,
            IntentType.CHEMISTRY_MOLECULE,
            IntentType.CHEMISTRY_TOOL,
        }
