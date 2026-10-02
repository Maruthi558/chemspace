"""Chemistry Query Analyzer and Entity Parser for RAG Retrieval."""

from dataclasses import dataclass, field
import re
from typing import Any, Dict, List, Optional, Set

from chemistry_llm.rag.normalization.normalizer import ChemicalNormalizer


@dataclass
class AnalyzedQuery:
    """Analyzed chemistry query with classified intent and extracted entities."""

    raw_query: str
    normalized_query: str
    intent: str  # molecular_property, reaction_mechanism, spectroscopy, history_discovery, concept, current_research
    chemical_entities: List[str] = field(default_factory=list)
    smiles: Optional[str] = None
    technique: Optional[str] = None
    subdomain: Optional[str] = None
    metadata_filters: Dict[str, Any] = field(default_factory=dict)
    expanded_terms: List[str] = field(default_factory=list)
    requires_web_research: bool = False


class ChemistryQueryAnalyzer:
    """Understands chemistry queries, extracts SMILES/formulas, and infers search filters."""

    def __init__(self):
        self.normalizer = ChemicalNormalizer()

    def analyze(self, query: str) -> AnalyzedQuery:
        """Parse user query into structured search intent and filters."""
        raw = (query or "").strip()
        norm_text = self.normalizer.normalize_text(raw)
        lower = norm_text.lower()

        # 1. Intent Detection
        intent = "concept"
        subdomain = "general"
        filters: Dict[str, Any] = {}
        technique = None
        requires_web = False

        if any(w in lower for w in ["latest", "recent", "newest", "current research", "2025", "2026", "breakthrough"]):
            intent = "current_research"
            requires_web = True
        elif any(w in lower for w in ["ir ", "infrared", "nmr", "mass spec", "uv-vis", "raman", "xps", "peak", "absorption"]):
            intent = "spectroscopy"
            subdomain = "analytical"
            if "ir" in lower or "infrared" in lower:
                technique = "IR"
            elif "nmr" in lower:
                technique = "NMR"
            elif "mass" in lower or "m/z" in lower:
                technique = "MS"
            elif "uv" in lower:
                technique = "UV-Vis"
        elif any(w in lower for w in ["mechanism", "reaction", "synthesize", "synthesis", "catalyst", "product", "pathway"]):
            intent = "reaction_mechanism"
            subdomain = "organic"
        elif any(w in lower for w in ["molecular weight", "formula", "smiles", "structure", "logp", "tpsa"]):
            intent = "molecular_property"
            subdomain = "cheminformatics"
        elif any(w in lower for w in ["who discovered", "who synthesized", "nobel", "history", "named after"]):
            intent = "history_discovery"

        # 2. Extract Chemical Entities
        entities = self.normalizer.extract_chemical_entities(norm_text)
        detected_smiles = None
        for ent in entities:
            if any(c in ent for c in "CONSPFClBrI") and any(c in ent for c in "=#[@+123456789"):
                detected_smiles = ent
                break
        if not detected_smiles and entities:
            detected_smiles = entities[0]

        # 3. Query Expansion
        expanded = [norm_text]
        if intent == "spectroscopy" and technique:
            expanded.append(f"{technique} spectroscopy absorption bands signals")
        elif intent == "reaction_mechanism":
            expanded.append("reaction mechanism intermediates transition state reagents")
        elif intent == "molecular_property" and detected_smiles:
            expanded.append(f"molecular properties structure formula {detected_smiles}")

        if subdomain != "general":
            filters["domain"] = "chemistry"

        return AnalyzedQuery(
            raw_query=raw,
            normalized_query=norm_text,
            intent=intent,
            chemical_entities=entities,
            smiles=detected_smiles,
            technique=technique,
            subdomain=subdomain,
            metadata_filters=filters,
            expanded_terms=expanded,
            requires_web_research=requires_web,
        )
