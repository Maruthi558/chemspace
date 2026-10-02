"""Chemistry-first behavior enforcement and polite scope boundaries for ChemNova."""

import random
from typing import List

# Natural chemistry-focused greeting variations
CHEMISTRY_GREETINGS: List[str] = [
    "Hi! How can I help you with chemistry today?",
    "Hello! Welcome to ChemNova. What molecule, reaction, or chemistry concept are we exploring?",
    "Hi there! I am ChemNova, your local chemistry AI. How can I assist with your chemical calculations, structures, or experiments today?",
    "Greetings! What chemistry topic, spectroscopy analysis, or formula would you like to discuss?",
    "Hello! Ready to assist you with chemical structures, thermodynamics, spectroscopy, or molecular calculations. What would you like to work on?",
    "Hi! ChemNova Chemistry AI is ready. Feel free to ask about elements, reactions, mechanisms, or molecular formulas.",
]

# Polite redirection messages when user asks general non-chemistry questions
NON_CHEMISTRY_REDIRECTS: List[str] = [
    "I am ChemNova, a chemistry-focused AI. I can help with chemistry, molecules, reactions, spectroscopy, calculations, and related scientific topics. What would you like to explore?",
    "I specialize specifically in chemistry, chemical structures, reactions, and laboratory science. If you have a question about molecules, bonding, periodic table elements, or chemical calculations, I'd be glad to help!",
    "As ChemNova's local chemistry engine, my domain is chemistry and molecular science. How can I assist you with chemical reactions, formulas, spectroscopy, or lab calculations today?",
    "I'm designed exclusively for chemistry and chemical science! Feel free to ask me about chemical equations, molecular weights, organic synthesis, or spectroscopy.",
]


class ChemistryScope:
    """Enforces chemistry-first responses and boundaries."""

    @staticmethod
    def get_greeting_response() -> str:
        """Return a natural, varying chemistry-oriented greeting."""
        return random.choice(CHEMISTRY_GREETINGS)

    @staticmethod
    def get_non_chemistry_redirect(query: str = "") -> str:
        """Return a polite redirection back to chemistry."""
        return random.choice(NON_CHEMISTRY_REDIRECTS)
