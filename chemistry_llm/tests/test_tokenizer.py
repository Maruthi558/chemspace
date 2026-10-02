"""Tests for ChemNova Local Chemistry Tokenizer."""

import unittest
from chemistry_llm.tokenizer.tokenizer import ChemNovaTokenizer
from chemistry_llm.tokenizer.special_tokens import (
    PAD_TOKEN, UNK_TOKEN, BOS_TOKEN, EOS_TOKEN, USER_TOKEN, ASSISTANT_TOKEN, CHEMISTRY_TOKEN,
    PAD_ID, UNK_ID, BOS_ID, EOS_ID, USER_ID, ASSISTANT_ID, CHEMISTRY_ID
)


class TestChemNovaTokenizer(unittest.TestCase):

    def setUp(self):
        self.tokenizer = ChemNovaTokenizer()

    def test_special_tokens(self):
        """Verify special token IDs and roundtrip fidelity."""
        self.assertEqual(self.tokenizer.vocab[PAD_TOKEN], PAD_ID)
        self.assertEqual(self.tokenizer.vocab[UNK_TOKEN], UNK_ID)
        self.assertEqual(self.tokenizer.vocab[BOS_TOKEN], BOS_ID)
        self.assertEqual(self.tokenizer.vocab[EOS_TOKEN], EOS_ID)
        self.assertEqual(self.tokenizer.vocab[USER_TOKEN], USER_ID)
        self.assertEqual(self.tokenizer.vocab[ASSISTANT_TOKEN], ASSISTANT_ID)
        self.assertEqual(self.tokenizer.vocab[CHEMISTRY_TOKEN], CHEMISTRY_ID)

    def test_english_text_encode_decode(self):
        """Verify encoding and decoding of standard English text."""
        text = "Hello chemistry world"
        tokens = self.tokenizer.tokenize(text)
        self.assertTrue(len(tokens) > 0)
        ids = self.tokenizer.encode(text)
        decoded = self.tokenizer.decode(ids)
        self.assertIn("Hello", decoded)
        self.assertIn("chemistry", decoded)

    def test_chemical_formulas(self):
        """Verify chemical formulas tokenization and preservation."""
        formulas = ["H2O", "C6H12O6", "NaCl", "H2SO4", "CO2"]
        for form in formulas:
            ids = self.tokenizer.encode(form)
            decoded = self.tokenizer.decode(ids)
            self.assertEqual(decoded, form)

    def test_smiles_notation(self):
        """Verify SMILES notation handling."""
        smiles = "CC(=O)Oc1ccccc1C(=O)O"
        ids = self.tokenizer.encode(smiles)
        decoded = self.tokenizer.decode(ids)
        self.assertEqual(decoded, smiles)

    def test_greek_letters_and_units(self):
        """Verify Greek letters and scientific units in chemistry."""
        text = "α-carbon with 18.015 g/mol at 300 K with λ = 254 nm and ΔH in kJ/mol"
        ids = self.tokenizer.encode(text)
        decoded = self.tokenizer.decode(ids)
        self.assertIn("α", decoded)
        self.assertIn("g/mol", decoded)
        self.assertIn("kJ/mol", decoded)
        self.assertIn("λ", decoded)

    def test_padding_and_truncation(self):
        """Verify sequence padding and truncation."""
        text = "What is an atom?"
        ids = self.tokenizer.encode(text, max_length=16, padding=True)
        self.assertEqual(len(ids), 16)
        self.assertEqual(ids[-1], PAD_ID)


if __name__ == "__main__":
    unittest.main()
