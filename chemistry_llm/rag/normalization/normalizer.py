"""Chemical Entity Normalization and Standardizer for RAG."""

import re
from typing import Dict, List, Optional, Set, Tuple

try:
    from rdkit import Chem, rdBase
    rdBase.DisableLog("rdApp.error")
    rdBase.DisableLog("rdApp.warning")
    HAS_RDKIT = True
except Exception:
    HAS_RDKIT = False

# Common chemistry notation standardizations
NOTATION_MAPPINGS = [
    (re.compile(r"\bcm\s*[-^]?\s*1\b", re.IGNORECASE), "cm⁻¹"),
    (re.compile(r"\b1H[- ]?NMR\b", re.IGNORECASE), "¹H NMR"),
    (re.compile(r"\b13C[- ]?NMR\b", re.IGNORECASE), "¹³C NMR"),
    (re.compile(r"\b19F[- ]?NMR\b", re.IGNORECASE), "¹⁹F NMR"),
    (re.compile(r"\b31P[- ]?NMR\b", re.IGNORECASE), "³¹P NMR"),
    (re.compile(r"\bdeg\s*C\b", re.IGNORECASE), "°C"),
    (re.compile(r"\bkcal\s*/\s*mol\b", re.IGNORECASE), "kcal/mol"),
    (re.compile(r"\bkJ\s*/\s*mol\b", re.IGNORECASE), "kJ/mol"),
    (re.compile(r"\bdelta\s*=\s*", re.IGNORECASE), "δ = "),
]

# Common chemical abbreviation mapping
ABBREVIATION_MAP = {
    "etoh": ("ethanol", "CCO"),
    "meoh": ("methanol", "CO"),
    "acoh": ("acetic acid", "CC(=O)O"),
    "et2o": ("diethyl ether", "CCOCC"),
    "thf": ("tetrahydrofuran", "C1CCOC1"),
    "dmf": ("dimethylformamide", "CN(C)C=O"),
    "dmso": ("dimethyl sulfoxide", "CS(=O)C"),
    "dcm": ("dichloromethane", "ClCCl"),
    "etac": ("ethyl acetate", "CCOC(=O)C"),
    "ea": ("ethyl acetate", "CCOC(=O)C"),
}


class ChemicalNormalizer:
    """Normalizes chemical formulas, SMILES, spectroscopy notations, and synonyms."""

    def __init__(self):
        self._smiles_candidate_regex = re.compile(
            r"(?<![A-Za-z0-9])([A-Z][a-z]?[\d\(\)\[\]\=\#\-\+\@\:\.\\\/]*[A-Z0-9a-z\(\)\[\]\=\#\-\+\@\:\.\\\/]+)(?![A-Za-z0-9])"
        )

    def normalize_text(self, text: str) -> str:
        """Standardize units, scientific abbreviations, and notation in text."""
        result = text
        for pattern, replacement in NOTATION_MAPPINGS:
            result = pattern.sub(replacement, result)
        return result

    def canonicalize_smiles(self, smiles: str) -> str:
        """Return canonical SMILES if valid, or original if unparseable."""
        if not smiles:
            return ""
        clean_smiles = smiles.strip()
        if HAS_RDKIT:
            try:
                mol = Chem.MolFromSmiles(clean_smiles)
                if mol is not None:
                    return Chem.MolToSmiles(mol, canonical=True)
            except Exception:
                pass
        return clean_smiles

    def extract_chemical_entities(self, text: str) -> List[str]:
        """Extract recognizable SMILES, chemical names, and abbreviations from text."""
        entities: Set[str] = set()
        lower_text = text.lower()

        # Check abbreviations
        for abbr, (full_name, smiles) in ABBREVIATION_MAP.items():
            if re.search(rf"\b{re.escape(abbr)}\b", lower_text):
                entities.add(full_name)
                entities.add(smiles)

        # Check for explicit SMILES strings
        candidates = self._smiles_candidate_regex.findall(text)
        for cand in candidates:
            cand_clean = cand.strip("(),;:.[]{}'\"")
            if len(cand_clean) >= 2 and any(c in cand_clean for c in "CONSPFClBrI"):
                if HAS_RDKIT:
                    try:
                        mol = Chem.MolFromSmiles(cand_clean)
                        if mol is not None and mol.GetNumAtoms() > 0:
                            entities.add(Chem.MolToSmiles(mol, canonical=True))
                    except Exception:
                        pass
                else:
                    if re.match(r"^[A-Za-z0-9\(\)\[\]\=\#\-\+\@\:\.\\\/]+$", cand_clean):
                        entities.add(cand_clean)

        return sorted(list(entities))
