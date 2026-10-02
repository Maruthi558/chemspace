"""Tests for ChemNova Chemistry AI Router and Chemistry-First Behavior."""

import unittest
from chemistry_llm.chemistry.chemistry_router import ChemistryRouter, IntentType
from chemistry_llm.chemistry.chemistry_scope import ChemistryScope
from chemistry_llm.inference.response_pipeline import get_response_pipeline


class TestChemistryRouter(unittest.TestCase):

    def setUp(self):
        self.router = ChemistryRouter()
        self.pipeline = get_response_pipeline()

    def test_greeting_route(self):
        """TEST 1: 'Hi' routes to GREETING and receives natural chemistry-focused greeting."""
        intent, conf = self.router.route("Hi")
        self.assertEqual(intent, IntentType.GREETING)

        res = self.pipeline.process("Hi")
        self.assertEqual(res.intent, "greeting")
        self.assertTrue(any(word in res.response.lower() for word in ["hi", "hello", "chemistry", "chemnova"]))

    def test_atom_concept_route(self):
        """TEST 2: 'What is an atom?' receives a chemistry-focused answer."""
        intent, conf = self.router.route("What is an atom?")
        self.assertIn(intent, [IntentType.CHEMISTRY_CONCEPT, IntentType.CHEMISTRY])

        res = self.pipeline.process("What is an atom?")
        self.assertIn("atom", res.response.lower())
        self.assertIn("proton", res.response.lower())

    def test_molecular_formula_route(self):
        """TEST 3: 'What is the molecular formula of water?' receives a chemistry answer."""
        intent, conf = self.router.route("What is the molecular formula of water?")
        self.assertIn(intent, [IntentType.CHEMISTRY_MOLECULE, IntentType.CHEMISTRY])

        res = self.pipeline.process("What is the molecular formula of water?")
        self.assertIn("H2O", res.response)

    def test_molecular_weight_calculation_route(self):
        """TEST 4: 'What is the molecular weight of water?' receives a chemistry calculation response."""
        intent, conf = self.router.route("What is the molecular weight of water?")
        self.assertEqual(intent, IntentType.CHEMISTRY_CALCULATION)

        res = self.pipeline.process("What is the molecular weight of water?")
        self.assertIn("18.015", res.response)
        self.assertIn("g/mol", res.response)

    def test_covalent_bonding_explanation(self):
        """TEST 5: 'Explain covalent bonding.' receives a chemistry explanation."""
        intent, conf = self.router.route("Explain covalent bonding.")
        self.assertIn(intent, [IntentType.CHEMISTRY_CONCEPT, IntentType.CHEMISTRY])

        res = self.pipeline.process("Explain covalent bonding.")
        self.assertIn("electron", res.response.lower())
        self.assertIn("covalent", res.response.lower())

    def test_non_chemistry_redirection(self):
        """TEST 6: 'Tell me a joke.' politely redirects toward chemistry."""
        intent, conf = self.router.route("Tell me a joke.")
        self.assertEqual(intent, IntentType.GENERAL_NON_CHEMISTRY)

        res = self.pipeline.process("Tell me a joke.")
        self.assertEqual(res.intent, "general_non_chemistry")
        # Ensure it politely redirects back to chemistry
        self.assertIn("chemistry", res.response.lower())

    def test_tool_request_route(self):
        """Verify 'Draw aspirin' routes to CHEMISTRY_TOOL with ChemDraw guidance."""
        intent, conf = self.router.route("Draw aspirin")
        self.assertEqual(intent, IntentType.CHEMISTRY_TOOL)

        res = self.pipeline.process("Draw aspirin")
        self.assertIn("ChemDraw", res.response)


if __name__ == "__main__":
    unittest.main()
