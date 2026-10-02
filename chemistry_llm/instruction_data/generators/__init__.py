"""Chemistry Instruction Generators Package for Step 6."""

from typing import List
from chemistry_llm.instruction_data.schema import ChemistryInstructionExample
from .fundamentals import generate_fundamentals_instructions, generate_general_chemistry_instructions
from .organic_mechanisms import generate_organic_instructions
from .calculations import generate_calculation_instructions
from .spectroscopy_molecules import generate_spectroscopy_molecule_instructions
from .uncertainty_hypothetical import generate_uncertainty_hypothetical_instructions
from .conversation_safety import generate_conversation_safety_instructions
from .advanced_domains import generate_advanced_domain_instructions


def generate_all_instruction_examples() -> List[ChemistryInstructionExample]:
    """Collect all curated chemistry instruction examples across all scientific domains."""
    all_examples: List[ChemistryInstructionExample] = []
    all_examples.extend(generate_fundamentals_instructions())
    all_examples.extend(generate_general_chemistry_instructions())
    all_examples.extend(generate_organic_instructions())
    all_examples.extend(generate_calculation_instructions())
    all_examples.extend(generate_spectroscopy_molecule_instructions())
    all_examples.extend(generate_uncertainty_hypothetical_instructions())
    all_examples.extend(generate_conversation_safety_instructions())
    all_examples.extend(generate_advanced_domain_instructions())
    return all_examples


__all__ = [
    "generate_all_instruction_examples",
    "generate_fundamentals_instructions",
    "generate_general_chemistry_instructions",
    "generate_organic_instructions",
    "generate_calculation_instructions",
    "generate_spectroscopy_molecule_instructions",
    "generate_uncertainty_hypothetical_instructions",
    "generate_conversation_safety_instructions",
]
