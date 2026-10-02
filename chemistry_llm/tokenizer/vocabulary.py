"""Vocabulary definitions and trainable dictionary foundation for ChemNova Tokenizer."""

from typing import Dict, List, Optional, Union
from pathlib import Path
import json
from .special_tokens import SPECIAL_TOKENS, PAD_TOKEN, UNK_TOKEN

# Periodic Table Elements (1-118)
ELEMENTS: List[str] = [
    "H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne",
    "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar", "K", "Ca",
    "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn",
    "Ga", "Ge", "As", "Se", "Br", "Kr", "Rb", "Sr", "Y", "Zr",
    "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn",
    "Sb", "Te", "I", "Xe", "Cs", "Ba", "La", "Ce", "Pr", "Nd",
    "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb",
    "Lu", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg",
    "Tl", "Pb", "Bi", "Po", "At", "Rn", "Fr", "Ra", "Ac", "Th",
    "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm",
    "Md", "No", "Lr", "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds",
    "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og"
]

# Greek Letters in Chemistry & Spectroscopy
GREEK_LETTERS: List[str] = [
    "α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ", "λ", "μ",
    "ν", "ξ", "ο", "π", "ρ", "σ", "τ", "υ", "φ", "χ", "ψ", "ω",
    "Α", "Β", "Γ", "Δ", "Ε", "Ζ", "Η", "Θ", "Ι", "Κ", "Λ", "Μ",
    "Ν", "Ξ", "Ο", "Π", "Ρ", "Σ", "Τ", "Υ", "Φ", "Χ", "Ψ", "Ω"
]

# Scientific & Chemical Symbols
CHEMICAL_SYMBOLS: List[str] = [
    "°", "±", "×", "÷", "→", "⇌", "⇄", "↔", "↑", "↓", "•", "·", "‰",
    "Å", "℃", "℉", "∇", "∂", "∫", "≈", "≠", "≤", "≥", "≡", "∝", "∞",
    "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹", "⁰", "⁺", "⁻",
    "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉", "₀"
]

# Scientific Units in Chemistry
CHEMISTRY_UNITS: List[str] = [
    "g/mol", "mol/L", "kJ/mol", "kcal/mol", "cm^-1", "ppm", "nm", "pm",
    "mL", "mg", "kg", "mol", "mmol", "μmol", "nmol", "pmol",
    "M", "mM", "μM", "nM", "pM", "K", "°C", "eV", "Hz", "MHz", "GHz",
    "bar", "atm", "Pa", "kPa", "Torr", "J", "kJ", "cal", "kcal", "s", "min", "h"
]

# Common Chemical Formulas and Functional Groups
COMMON_FORMULAS: List[str] = [
    "H2O", "CO2", "CH4", "NH3", "O2", "N2", "H2", "HCl", "NaCl", "NaOH",
    "H2SO4", "HNO3", "CH3", "CH2", "COOH", "OH", "NH2", "NO2", "SO4", "PO4",
    "CO3", "HCO3", "C6H12O6", "C2H5OH", "CH3COOH", "C6H6", "C2H4", "C2H2",
    "Fe2O3", "Al2O3", "CaCO3", "MgSO4", "KMnO4", "K2Cr2O7", "CuSO4"
]

# Common Chemistry Terminology
CHEMISTRY_TERMS: List[str] = [
    "atom", "molecule", "element", "compound", "proton", "neutron", "electron",
    "nucleus", "orbital", "valence", "bond", "bonding", "covalent", "ionic",
    "metallic", "hydrogen", "dipole", "electronegativity", "acid", "base",
    "pH", "pKa", "pKb", "salt", "buffer", "oxidation", "reduction", "redox",
    "reaction", "reactant", "product", "catalyst", "activation", "energy",
    "enthalpy", "entropy", "Gibbs", "equilibrium", "constant", "rate",
    "kinetics", "thermodynamics", "organic", "inorganic", "physical",
    "analytical", "biochemistry", "spectroscopy", "NMR", "IR", "infrared",
    "UV-Vis", "mass", "spectrometry", "chromatography", "HPLC", "GC",
    "titration", "solubility", "precipitation", "solute", "solvent",
    "concentration", "molarity", "molality", "stoichiometry", "yield",
    "mechanism", "nucleophile", "electrophile", "isomer", "chirality",
    "enantiomer", "diastereomer", "stereochemistry", "resonance", "hybridization",
    "sp", "sp2", "sp3", "sigma", "pi", "ligand", "complex", "coordination",
    "transition", "metal", "periodic", "table", "group", "period", "formula",
    "weight", "molar", "density", "melting", "boiling", "point", "isomerism"
]

# Core English Common Vocabulary Words
COMMON_ENGLISH_WORDS: List[str] = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
    "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
    "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
    "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
    "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
    "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
    "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
    "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
    "is", "are", "was", "were", "been", "has", "had", "does", "did", "doing",
    "what", "why", "where", "how", "explain", "describe", "calculate", "define",
    "hello", "hi", "hey", "help", "thanks", "thank", "please", "yes", "no",
    "chemistry", "science", "scientific", "laboratory", "solution", "structure",
    "ChemNova", "ChemSpace", "assistant", "system", "question", "answer", "result"
]


class Vocabulary:
    """Trainable and serializable vocabulary container for ChemNova-LLM."""

    def __init__(self, initial_tokens: Optional[List[str]] = None):
        self.token_to_id: Dict[str, int] = {}
        self.id_to_token: Dict[int, str] = {}

        # Always add special tokens first
        for tok in SPECIAL_TOKENS:
            self.add_token(tok)

        if initial_tokens:
            for tok in initial_tokens:
                self.add_token(tok)

    def add_token(self, token: str) -> int:
        if token not in self.token_to_id:
            idx = len(self.token_to_id)
            self.token_to_id[token] = idx
            self.id_to_token[idx] = token
            return idx
        return self.token_to_id[token]

    def add_tokens(self, tokens: List[str]) -> List[int]:
        return [self.add_token(t) for t in tokens]

    def get_id(self, token: str, default: Optional[int] = None) -> int:
        if default is None:
            default = self.token_to_id.get(UNK_TOKEN, 1)
        return self.token_to_id.get(token, default)

    def get_token(self, idx: int, default: Optional[str] = None) -> str:
        if default is None:
            default = UNK_TOKEN
        return self.id_to_token.get(idx, default)

    def __len__(self) -> int:
        return len(self.token_to_id)

    def __contains__(self, token: str) -> bool:
        return token in self.token_to_id

    def to_dict(self) -> Dict[str, int]:
        return dict(self.token_to_id)

    @classmethod
    def from_dict(cls, data: Dict[str, int]) -> "Vocabulary":
        vocab = cls(initial_tokens=[])
        vocab.token_to_id = {k: int(v) for k, v in data.items()}
        vocab.id_to_token = {int(v): k for k, v in data.items()}
        return vocab

    def save_json(self, path: Union[str, Path]) -> None:
        p = Path(path)
        p.parent.mkdir(parents=True, exist_ok=True)
        with open(p, "w", encoding="utf-8") as f:
            json.dump(self.token_to_id, f, ensure_ascii=False, indent=2)

    @classmethod
    def load_json(cls, path: Union[str, Path]) -> "Vocabulary":
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return cls.from_dict(data)


def build_base_vocabulary() -> Dict[str, int]:
    """Construct deterministic base vocabulary for ChemNova tokenizer."""
    vocab: Dict[str, int] = {}

    # 1. Special tokens first
    for token in SPECIAL_TOKENS:
        if token not in vocab:
            vocab[token] = len(vocab)

    # 2. Printable ASCII characters (32..126)
    for code in range(32, 127):
        ch = chr(code)
        if ch not in vocab:
            vocab[ch] = len(vocab)

    # Control whitespace characters
    for ch in ["\n", "\t", "\r"]:
        if ch not in vocab:
            vocab[ch] = len(vocab)

    # 3. Greek Letters
    for ch in GREEK_LETTERS:
        if ch not in vocab:
            vocab[ch] = len(vocab)

    # 4. Chemical & Mathematical Symbols
    for ch in CHEMICAL_SYMBOLS:
        if ch not in vocab:
            vocab[ch] = len(vocab)

    # 5. Elements
    for elem in ELEMENTS:
        if elem not in vocab:
            vocab[elem] = len(vocab)

    # 6. Units
    for unit in CHEMISTRY_UNITS:
        if unit not in vocab:
            vocab[unit] = len(vocab)

    # 7. Common Formulas & Functional Groups
    for form in COMMON_FORMULAS:
        if form not in vocab:
            vocab[form] = len(vocab)

    # 8. Chemistry Terminology
    for term in CHEMISTRY_TERMS:
        if term not in vocab:
            vocab[term] = len(vocab)
        term_title = term.title()
        if term_title not in vocab:
            vocab[term_title] = len(vocab)

    # 9. Common English Words
    for word in COMMON_ENGLISH_WORDS:
        if word not in vocab:
            vocab[word] = len(vocab)
        word_title = word.title()
        if word_title not in vocab:
            vocab[word_title] = len(vocab)

    return vocab
