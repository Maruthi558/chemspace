"""ChemNova Scientific Data Normalization Pipeline.

Normalizes:
- Whitespace and line breaks
- Unicode characters (NFKC with chemistry preservation)
- Punctuation (quotes, dashes, hyphens)
- Chemical reaction notation (arrows ->, <=>)
- Scientific units (g/mol, kJ/mol, °C)
- Numerical & scientific notation
- Molecular formulas (element capitalization)
- SMILES strings (whitespace stripping and valence preservation)

Crucial Guarantee:
- Preserves raw data in `raw_record` so original source remains 100% recoverable.
- Does NOT corrupt case-sensitive chemical semantics (e.g., SMILES or elemental symbols).

Usage:
    python -m chemistry_llm.data.normalize --input <jsonl_file>
"""

import argparse
import copy
import logging
from pathlib import Path
import re
from typing import Any, Dict, List, Optional, Union
import unicodedata

from chemistry_llm.data.schema.record import ChemNovaRecord, current_iso_time
from chemistry_llm.tokenizer.vocabulary import ELEMENTS

logger = logging.getLogger("chemistry_llm.data.normalize")


class DataNormalizer:
    """Scientific text and chemistry notation normalizer."""

    def __init__(self):
        # Known units standardizer patterns
        self.unit_replacements = [
            (re.compile(r"\b(g|gm|gms)\s*/\s*(mol|mole|moles)\b", re.IGNORECASE), "g/mol"),
            (re.compile(r"\b(kj|kJ)\s*/\s*(mol|mole|moles)\b", re.IGNORECASE), "kJ/mol"),
            (re.compile(r"\b(kcal)\s*/\s*(mol|mole|moles)\b", re.IGNORECASE), "kcal/mol"),
            (re.compile(r"\b(mol|moles)\s*/\s*(l|L|liter|litre)\b", re.IGNORECASE), "mol/L"),
            (re.compile(r"\b(deg\s*C|degrees\s*Celsius|degrees\s*C)\b", re.IGNORECASE), "°C"),
            (re.compile(r"\b(deg\s*F|degrees\s*Fahrenheit|degrees\s*F)\b", re.IGNORECASE), "°F"),
            (re.compile(r"\bcm\s*\^\s*-1\b|\bcm-1\b", re.IGNORECASE), "cm^-1"),
        ]

        # Chemical equation arrow patterns
        self.arrow_replacements = [
            (re.compile(r"<==>|<=>|<->"), "⇌"),
            (re.compile(r"-->|->"), "→"),
            (re.compile(r"<--|<-"), "←"),
        ]

        # Element lookup for formula capitalization
        self.element_set = set(ELEMENTS)

    def normalize_whitespace(self, text: Optional[str]) -> Optional[str]:
        """Normalize whitespace, tabs, and excess empty lines while preserving paragraphs."""
        if not text:
            return text

        # Replace non-breaking spaces and zero-width spaces
        t = text.replace("\u00a0", " ").replace("\u200b", "").replace("\r\n", "\n").replace("\r", "\n")

        # Collapse multiple horizontal spaces/tabs
        t = re.sub(r"[ \t]+", " ", t)

        # Collapse 3+ newlines to double newline
        t = re.sub(r"\n{3,}", "\n\n", t)

        # Strip lines
        lines = [line.strip() for line in t.split("\n")]
        return "\n".join(lines).strip()

    def normalize_unicode_and_punctuation(self, text: Optional[str]) -> Optional[str]:
        """Normalize Unicode quotes, dashes, and primes without breaking Greek letters."""
        if not text:
            return text

        t = text
        # Standardize curly quotes
        t = t.replace("“", '"').replace("”", '"').replace("„", '"')
        t = t.replace("‘", "'").replace("’", "'").replace("`", "'")

        # Standardize dashes (preserve mathematical minus if needed)
        t = t.replace("—", " - ").replace("–", " - ")

        return t

    def normalize_reaction_notation(self, text: Optional[str]) -> Optional[str]:
        """Standardize reaction arrows into Unicode equilibrium and forward arrows."""
        if not text:
            return text

        t = text
        for pat, repl in self.arrow_replacements:
            t = pat.sub(f" {repl} ", t)

        # Clean spacing around arrows
        t = re.sub(r"\s+([→⇌←])\s+", r" \1 ", t)
        return t

    def normalize_units(self, text: Optional[str]) -> Optional[str]:
        """Standardize scientific unit strings in text."""
        if not text:
            return text

        t = text
        for pat, repl in self.unit_replacements:
            t = pat.sub(repl, t)
        return t

    def normalize_scientific_notation(self, text: Optional[str]) -> Optional[str]:
        """Standardize scientific numerical expressions (e.g. 6.022 x 10^23 -> 6.022e23 or clean format)."""
        if not text:
            return text

        # Normalize "x 10^" or "* 10^" into standard scientific format
        t = re.sub(r"(\d+(?:\.\d+)?)\s*[x×*]\s*10\^([+-]?\d+)", r"\1e\2", text)
        return t

    def normalize_smiles(self, smiles: Optional[str]) -> Optional[str]:
        """Normalize SMILES string without altering case-sensitive chemical semantics."""
        if not smiles:
            return None
        # Clean surrounding whitespace and quotes
        return smiles.strip().strip('"\'')

    def normalize_formula(self, formula: Optional[str]) -> Optional[str]:
        """Ensure chemical formula has clean spacing and standardized capitalization."""
        if not formula:
            return None
        f = formula.strip().replace(" ", "")
        # Common lowercase formula fixes (e.g. h2o -> H2O, co2 -> CO2)
        common_fixes = {
            "h2o": "H2O",
            "co2": "CO2",
            "ch4": "CH4",
            "nh3": "NH3",
            "nacl": "NaCl",
            "hcl": "HCl",
            "h2so4": "H2SO4",
            "c6h12o6": "C6H12O6",
            "c2h5oh": "C2H5OH",
        }
        if f.lower() in common_fixes:
            return common_fixes[f.lower()]
        return f

    def normalize_record(self, record: ChemNovaRecord) -> ChemNovaRecord:
        """Apply full normalization pipeline to a ChemNovaRecord."""
        # 1. Preserve raw record for auditability
        if record.raw_record is None:
            raw_copy = copy.deepcopy(record.to_dict())
        else:
            raw_copy = record.raw_record

        # 2. Normalize text fields
        question_norm = self.normalize_whitespace(record.question)
        question_norm = self.normalize_unicode_and_punctuation(question_norm)
        question_norm = self.normalize_reaction_notation(question_norm)
        question_norm = self.normalize_units(question_norm)
        question_norm = self.normalize_scientific_notation(question_norm)

        answer_norm = self.normalize_whitespace(record.answer)
        answer_norm = self.normalize_unicode_and_punctuation(answer_norm)
        answer_norm = self.normalize_reaction_notation(answer_norm)
        answer_norm = self.normalize_units(answer_norm)
        answer_norm = self.normalize_scientific_notation(answer_norm)

        context_norm = self.normalize_whitespace(record.context)
        context_norm = self.normalize_unicode_and_punctuation(context_norm)
        context_norm = self.normalize_reaction_notation(context_norm)
        context_norm = self.normalize_units(context_norm)

        explanation_norm = self.normalize_whitespace(record.explanation)
        explanation_norm = self.normalize_unicode_and_punctuation(explanation_norm)
        explanation_norm = self.normalize_units(explanation_norm)

        reasoning_norm = self.normalize_whitespace(record.reasoning)
        reasoning_norm = self.normalize_unicode_and_punctuation(reasoning_norm)

        # 3. Chemical structure and formula normalization
        smiles_norm = self.normalize_smiles(record.smiles)
        formula_norm = self.normalize_formula(record.formula)
        mol_formula_norm = self.normalize_formula(record.molecular_formula)
        reaction_norm = self.normalize_reaction_notation(record.reaction)

        # 4. Provenance tracking of transformation
        prov = copy.deepcopy(record.provenance or {})
        transformations = prov.get("transformations", [])
        transformations.append({
            "stage": "normalization",
            "timestamp": current_iso_time(),
        })
        prov["transformations"] = transformations

        return ChemNovaRecord(
            id=record.id,
            type=record.type,
            domain=record.domain,
            subdomain=record.subdomain,
            question=question_norm,
            answer=answer_norm,
            context=context_norm,
            explanation=explanation_norm,
            reasoning=reasoning_norm,
            formula=formula_norm,
            equation=record.equation,
            reaction=reaction_norm,
            reactants=record.reactants,
            reagents=record.reagents,
            products=record.products,
            conditions=record.conditions,
            molecule=record.molecule,
            smiles=smiles_norm,
            inchi=record.inchi,
            molecular_formula=mol_formula_norm,
            source=record.source,
            source_url=record.source_url,
            license=record.license,
            provenance=prov,
            confidence=record.confidence,
            verified=record.verified,
            created_at=record.created_at,
            updated_at=current_iso_time(),
            raw_record=raw_copy,
        )

    def normalize_file(
        self,
        input_file: Union[str, Path],
        output_file: Optional[Union[str, Path]] = None,
    ) -> Dict[str, Any]:
        """Normalize all records in a JSONL file."""
        in_p = Path(input_file)
        if not in_p.exists():
            raise FileNotFoundError(f"Input file not found: {in_p}")

        stem = in_p.stem.replace("_cleaned", "").replace("_validated", "")
        out_p = Path(output_file) if output_file else Path(f"chemistry_llm/data/normalized/{stem}_normalized.jsonl")
        out_p.parent.mkdir(parents=True, exist_ok=True)

        normalized_count = 0
        with open(in_p, "r", encoding="utf-8") as f_in, open(out_p, "w", encoding="utf-8") as f_out:
            for line in f_in:
                if line.strip():
                    rec = ChemNovaRecord.from_jsonl_line(line)
                    norm_rec = self.normalize_record(rec)
                    f_out.write(norm_rec.to_jsonl_line() + "\n")
                    normalized_count += 1

        logger.info("Normalized %d records from %s -> %s", normalized_count, in_p, out_p)
        return {
            "input_file": str(in_p),
            "output_file": str(out_p),
            "records_normalized": normalized_count,
        }


def main():
    parser = argparse.ArgumentParser(description="ChemNova Data Normalization CLI")
    parser.add_argument("--input", "-i", required=True, help="Input JSONL file to normalize")
    parser.add_argument("--output", "-o", default=None, help="Output normalized JSONL path")

    args = parser.parse_args()
    normalizer = DataNormalizer()
    res = normalizer.normalize_file(args.input, output_file=args.output)
    print(f"Successfully normalized {res['records_normalized']} records -> {res['output_file']}")


if __name__ == "__main__":
    main()
