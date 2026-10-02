"""Deterministic Chemistry Intent Detection and Tool Router for ChemNova AI Suite.

Flow:
User Request
  ↓
Intent & Entity Extraction
  ↓
Context Disambiguation (e.g. resolving "its", "the molecule")
  ↓
Deterministic Routing Rule Engine
  ↓
ToolCall or [NO_TOOL]
  ↓
Sequential Multi-Tool Execution & Loop Protection
"""

import logging
import re
from typing import Any, Dict, List, Optional, Tuple

from chemistry_llm.tools.registry import ToolRegistry
from chemistry_llm.tools.schema import ToolCall, ToolResult

logger = logging.getLogger("chemistry_llm.tool_router")

# Standard chemical name to SMILES dictionary
COMMON_NAMES_TO_SMILES = {
    "water": "O",
    "ethanol": "CCO",
    "acetone": "CC(=O)C",
    "benzene": "c1ccccc1",
    "aspirin": "CC(=O)Oc1ccccc1C(=O)O",
    "caffeine": "CN1C=NC2=C1C(=O)N(C(=O)N2C)C",
    "acetic acid": "CC(=O)O",
    "methane": "C",
    "propane": "CCC",
    "glucose": "C(C1C(C(C(C(O1)O)O)O)O)O",
    "paracetamol": "CC(=O)NC1=CC=C(O)C=C1",
    "acetaminophen": "CC(=O)NC1=CC=C(O)C=C1",
    "carbon dioxide": "O=C=O",
    "hydrochloric acid": "Cl",
    "sulfuric acid": "OS(=O)(=O)O",
    "phenol": "Oc1ccccc1",
    "toluene": "Cc1ccccc1",
}

ENGLISH_STOPWORDS = {
    "what", "is", "are", "the", "of", "in", "to", "for", "with", "a", "an", "and", "or",
    "how", "why", "who", "which", "where", "tell", "me", "its", "calculate", "find",
    "determine", "predict", "analyze", "draw", "sketch", "show", "give", "expected",
    "features", "molecular", "weight", "formula", "properties", "property", "descriptors",
    "spectrum", "spectra", "reaction", "reactions", "product", "products", "retrosynthesis",
    "pathway", "canvas", "structure", "structures", "compound", "compounds", "molecule",
    "molecules", "electronic", "quantum", "energy", "energies", "calculation", "calculations",
    "gap", "band", "homo", "lumo", "method", "basis", "set", "cost", "estimate", "this",
    "that", "these", "those", "from", "canonical", "validate", "valid", "check", "value",
    "would", "look", "like", "between", "bond", "bonds", "atom", "atoms", "could", "you",
    "please", "can", "help", "good", "morning", "hello", "hi", "hey",
    "ir", "nmr", "ms", "uv", "vis", "epr", "xps", "xrd", "hplc", "gc", "raman", "ftir"
}


class ToolRouter:
    """Deterministic Chemistry Tool Router with Context Tracking & Loop Protection."""

    MAX_TOOL_CALLS_PER_TURN = 3

    def __init__(self, registry: Optional[ToolRegistry] = None):
        self.registry = registry or ToolRegistry()
        self.conversation_memory: Dict[str, Dict[str, Any]] = {}

    def extract_chemical_entity(self, text: str, conversation_id: Optional[str] = None) -> Optional[str]:
        """Extract explicit SMILES or common chemical name, falling back to conversation context."""
        lower_text = text.lower().strip()

        # 1. Explicit pattern after colon or keywords (e.g., "Analyze this: invalid_smiles", "SMILES: CCO")
        explicit_match = re.search(r"(?:analyze\s+this|smiles|structure|molecule|compound|analyze)\s*[:=]\s*([^\s,;?!]+)", text, re.IGNORECASE)
        if explicit_match:
            candidate = explicit_match.group(1).strip("()[]\"'")
            if candidate:
                return candidate

        # 2. Match common names
        for name, smiles in COMMON_NAMES_TO_SMILES.items():
            if re.search(rf"\b{re.escape(name)}\b", lower_text):
                return smiles

        # 3. Contextual Reference ("its", "the molecule", "this compound")
        if conversation_id and conversation_id in self.conversation_memory:
            if any(pronoun in lower_text for pronoun in ["its", "this molecule", "the molecule", "this compound", "it"]):
                prev_smiles = self.conversation_memory[conversation_id].get("last_smiles")
                if prev_smiles:
                    return prev_smiles

        # 4. Look for candidate tokens among words excluding stopwords
        words = text.replace(",", " ").replace("?", " ").replace("!", " ").replace(":", " ").replace(";", " ").split()
        for w in words:
            clean_w = w.strip("()[]\"'")
            if not clean_w or clean_w.lower() in ENGLISH_STOPWORDS:
                continue
            # If word contains chemical characters or valid SMILES syntax
            if any(c in clean_w for c in "CONSPFClBrI123456789=#-"):
                if re.match(r"^[A-Za-z0-9\(\)\[\]\=\#\-\+\@\:\.\\\/_]+$", clean_w):
                    return clean_w

        return None

    def route_query(
        self,
        query: str,
        conversation_id: Optional[str] = None,
    ) -> List[ToolCall]:
        """Determine whether tools are required and return ordered list of ToolCalls."""
        lower = query.lower().strip()
        tool_calls: List[ToolCall] = []

        # 1. Non-Tool Questions: Greetings, Broad Concepts, Ambiguity
        if lower in {"hello", "hi", "hey", "good morning", "good evening", "greetings"}:
            return []

        if any(lower.startswith(prefix) for prefix in [
            "what is a covalent bond",
            "explain what a covalent bond",
            "what is an atom",
            "who are you",
            "what is chemistry"
        ]):
            return []

        # Ambiguous question requiring clarification first (e.g. "What happens with acetone?", "What happens to this?")
        if re.search(r"what happens (?:to|with)\b", lower) and not any(k in lower for k in ["ir", "nmr", "weight", "draw"]):
            return []

        # Extract entity
        smiles = self.extract_chemical_entity(query, conversation_id=conversation_id)

        # 2. RDKit Molecular Properties / SMILES Validation
        needs_props = any(w in lower for w in [
            "molecular weight", "mol weight", "formula", "logp", "tpsa",
            "lipinski", "rotatable", "descriptors", "heavy atoms"
        ])
        needs_smiles_val = "validate" in lower or ("analyze this:" in lower) or ("analyze this" in lower and not any(k in lower for k in ["spectrum", "ir", "nmr"]))
        needs_canonical = "canonical" in lower and "smiles" in lower

        if (needs_props or needs_smiles_val or needs_canonical) and smiles:
            op = "calculate_molecular_properties" if needs_props else "validate_smiles"
            if needs_canonical:
                op = "canonicalize_smiles"
            tool_calls.append(ToolCall(tool="rdkit", operation=op, arguments={"smiles": smiles}))

        # 3. ChemDraw 2D Sketch / 3D Conformer
        needs_draw = any(w in lower for w in ["draw", "sketch", "canvas", "render 2d"])
        needs_3d = any(w in lower for w in ["3d conformer", "3d structure", "conformation", "generate 3d"])

        if (needs_draw or needs_3d) and smiles:
            op = "generate_3d_conformer" if needs_3d else "parse_molecule"
            tool_calls.append(ToolCall(tool="chemdraw", operation=op, arguments={"smiles": smiles}))

        # 4. Spectroscopy Analysis (IR, NMR, Mass Spec, UV-Vis)
        needs_spec = any(w in lower for w in [
            "ir spectrum", "infrared", "absorption band", "nmr", "chemical shift",
            "mass spec", "mass spectrometry", "uv-vis", "spectroscopy", "spectrum", "ir features"
        ])
        if needs_spec:
            op = "lookup_ir_bands" if "ir band" in lower else "predict_spectra"
            tool_calls.append(ToolCall(tool="spectroscopy", operation=op, arguments={"smiles": smiles or "CCO"}))

        # 5. IBM RXN Reaction & Retrosynthesis
        needs_reaction = any(w in lower for w in ["predict reaction", "reaction product", "predict the product", "what product is formed", "predict this reaction"])
        needs_retro = any(w in lower for w in ["retrosynthesis", "retrosynthetic", "synthetic pathway", "how to synthesize"])

        if needs_reaction or needs_retro:
            op = "predict_retrosynthesis" if needs_retro else "predict_reaction"
            args = {"target_smiles": smiles or "CCO"} if needs_retro else {"reactants_smiles": smiles or "CC(=O)O.c1ccccc1"}
            tool_calls.append(ToolCall(tool="ibm_rxn", operation=op, arguments=args))

        # 6. Quantum Chemistry Engine
        needs_quantum = any(w in lower for w in [
            "homo", "lumo", "band gap", "dft", "hartree", "quantum property", "quantum calculation", "calculate this quantum"
        ])
        if needs_quantum:
            tool_calls.append(
                ToolCall(
                    tool="quantum",
                    operation="calculate_electronic_properties",
                    arguments={"smiles": smiles or "CCO", "method": "DFT (B3LYP)", "basis_set": "6-31G(d)"},
                )
            )

        # Update conversation context if valid chemical entity found
        if smiles and conversation_id:
            if conversation_id not in self.conversation_memory:
                self.conversation_memory[conversation_id] = {}
            self.conversation_memory[conversation_id]["last_smiles"] = smiles

        # Loop protection: limit max calls per turn
        return tool_calls[: self.MAX_TOOL_CALLS_PER_TURN]
