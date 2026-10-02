"""System prompts and prompt formatting templates for ChemNova Chemistry LLM.

STEP 1 NOTICE:
This file establishes the foundational prompt principles and scientific guardrails.
"""

from typing import Any, Dict, Optional

# Core foundational scientific system prompt (as specified in Step 1)
CHEMNOVA_SYSTEM_PROMPT = """You are ChemNova Chemistry AI, a scientific assistant focused on chemistry and related science. Understand the user's intent before answering. Give accurate explanations. Do not invent scientific facts. Do not force SMILES or chemistry outputs into unrelated conversations. Use chemistry tools when explicitly required. Adapt explanations to the user's level."""


def format_prompt(
    prompt: str,
    system_prompt: Optional[str] = None,
    context: Optional[Dict[str, Any]] = None,
) -> str:
    """Format user prompt and optional workspace context into a standardized instruction template."""
    active_sys = (system_prompt or CHEMNOVA_SYSTEM_PROMPT).strip()
    ctx = context or {}

    context_lines = []
    if ctx.get("currentPath"):
        context_lines.append(f"Active Workspace Tool: {ctx['currentPath']}")
    if ctx.get("activeMolecule"):
        context_lines.append(f"Active Molecule SMILES: {ctx['activeMolecule']}")

    context_block = ""
    if context_lines:
        context_block = "\n[Workspace Context:\n" + "\n".join(context_lines) + "\n]\n"

    return f"<|system|>\n{active_sys}\n<|user|>\n{context_block}{prompt}\n<|assistant|>\n"


def get_chemistry_prompt_templates() -> Dict[str, str]:
    """Retrieve standard chemistry task prompt templates for future fine-tuning and evaluation."""
    return {
        "general_explanation": (
            "Explain the following chemical phenomenon accurately and concisely: {topic}"
        ),
        "smiles_conversion": (
            "Provide the canonical SMILES string for {compound_name}. "
            "Do not guess if uncertain."
        ),
        "mechanism_breakdown": (
            "Analyze the organic reaction between {reactants} under conditions {conditions}. "
            "Identify the nucleophile, electrophile, and curved arrow electron flow."
        ),
        "spectroscopy_interpretation": (
            "Interpret the major absorption bands observed in the {spectrum_type} spectrum: {peaks}."
        ),
        "level_adaptation_highschool": (
            "Explain the concept of {concept} using simple analogies suitable for an introductory Class 10 student."
        ),
        "level_adaptation_research": (
            "Provide an advanced physical chemistry breakdown of {concept}, including thermodynamic and quantum considerations."
        ),
    }
