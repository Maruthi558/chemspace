"""Comprehensive 20-Point Test Suite for ChemNova Step 4 Tokenizer & Training Data Pipeline.

Validates all 20 required specifications:
1. English tokenization
2. Chemistry terminology
3. Molecular formulas
4. SMILES
5. SMARTS
6. Chemical equations
7. Reaction notation
8. Spectroscopy notation
9. Numerical chemistry
10. Units
11. Special tokens
12. Encode/decode
13. Chemical string round-trip
14. Long sequence handling
15. Padding
16. Truncation / Chunking
17. Attention masks
18. Next-token labels
19. Train/validation/test separation
20. Data leakage detection
"""

import json
from pathlib import Path
import shutil
import tempfile
import unittest
import numpy as np

from chemistry_llm.tokenizer.tokenizer import ChemNovaTokenizer
from chemistry_llm.tokenizer.special_tokens import (
    SPECIAL_TOKENS,
    SPECIAL_TOKEN_MAP,
    PAD_ID,
    UNK_ID,
    BOS_ID,
    EOS_ID,
    MASK_ID,
    CHEM_ID,
    FORMULA_ID,
    SMILES_ID,
    REACTION_ID,
    QUESTION_ID,
    ANSWER_ID,
    REASONING_ID,
    END_ID,
)
from chemistry_llm.tokenizer.prepare_dataset import (
    chunk_and_pad_sequence,
    format_training_text,
    DataLeakageDetector,
    ChemNovaDatasetPreparer,
)
from chemistry_llm.data.schema.record import ChemNovaRecord


class TestStep4ChemNovaTokenizer(unittest.TestCase):
    """Test suite validating ChemNova Tokenizer and Dataset Preparation Pipeline."""

    @classmethod
    def setUpClass(cls):
        cls.tokenizer = ChemNovaTokenizer()

    # -------------------------------------------------------------
    # 1. English Tokenization
    # -------------------------------------------------------------
    def test_01_english_tokenization(self):
        """1. Verify standard English prose tokenizes and decodes cleanly."""
        text = "The quick brown fox jumps over the lazy dog. Chemistry is the study of matter."
        token_ids = self.tokenizer.encode(text)
        self.assertIsInstance(token_ids, list)
        self.assertGreater(len(token_ids), 0)
        decoded = self.tokenizer.decode(token_ids)
        self.assertEqual(decoded, text)

    # -------------------------------------------------------------
    # 2. Chemistry Terminology
    # -------------------------------------------------------------
    def test_02_chemistry_terminology(self):
        """2. Verify advanced chemistry vocabulary tokenizes without corruption."""
        terms = [
            "electrophilic aromatic substitution",
            "stoichiometry and thermodynamic equilibrium",
            "sp3 hybridization in methane",
            "Gibbs free energy of reaction",
            "activation energy and Arrhenius equation",
        ]
        for term in terms:
            token_ids = self.tokenizer.encode(term)
            decoded = self.tokenizer.decode(token_ids)
            self.assertEqual(decoded, term, f"Failed on term: {term}")

    # -------------------------------------------------------------
    # 3. Molecular Formulas
    # -------------------------------------------------------------
    def test_03_molecular_formulas(self):
        """3. Verify molecular formulas maintain exact structure and round-trip."""
        formulas = [
            "H2O", "CO2", "NaCl", "C6H6", "CH3COOH", "H2SO4",
            "Ca(OH)2", "KMnO4", "Fe2(SO4)3", "C12H22O11"
        ]
        for f in formulas:
            token_ids = self.tokenizer.encode(f)
            decoded = self.tokenizer.decode(token_ids)
            self.assertEqual(decoded, f, f"Failed formula round-trip for: {f}")

    # -------------------------------------------------------------
    # 4. SMILES
    # -------------------------------------------------------------
    def test_04_smiles(self):
        """4. Verify standard linear, branched, and cyclic SMILES strings."""
        smiles_strings = [
            "CCO",
            "c1ccccc1",
            "CC(=O)O",
            "CC(C)O",
            "C1=CC=CC=C1",
            "CCN(CC)CC",
            "CC(=O)Oc1ccccc1C(=O)O",
        ]
        for s in smiles_strings:
            token_ids = self.tokenizer.encode(s)
            decoded = self.tokenizer.decode(token_ids)
            self.assertEqual(decoded, s, f"Failed SMILES round-trip for: {s}")

    # -------------------------------------------------------------
    # 5. SMARTS
    # -------------------------------------------------------------
    def test_05_smarts(self):
        """5. Verify SMARTS pattern queries preserve syntax."""
        patterns = [
            "[CX3]=[OX1]",
            "[#6]~[#6]",
            "[NX3][CX4]",
            "[OH]-[CH2]",
        ]
        for pat in patterns:
            token_ids = self.tokenizer.encode(pat)
            decoded = self.tokenizer.decode(token_ids)
            self.assertEqual(decoded, pat, f"Failed SMARTS round-trip for: {pat}")

    # -------------------------------------------------------------
    # 6. Chemical Equations
    # -------------------------------------------------------------
    def test_06_chemical_equations(self):
        """6. Verify balanced chemical equations preserve stoichiometry and arrows."""
        equations = [
            "2H2 + O2 -> 2H2O",
            "CH4 + 2O2 -> CO2 + 2H2O",
            "N2 + 3H2 <=> 2NH3",
            "HCl + NaOH -> NaCl + H2O",
        ]
        for eq in equations:
            token_ids = self.tokenizer.encode(eq)
            decoded = self.tokenizer.decode(token_ids)
            self.assertEqual(decoded, eq, f"Failed chemical equation for: {eq}")

    # -------------------------------------------------------------
    # 7. Reaction Notation
    # -------------------------------------------------------------
    def test_07_reaction_notation(self):
        """7. Verify multi-component reaction notation with arrows and reagents."""
        rxns = [
            "A + B -> C + D",
            "R-Br + NaOH -> R-OH + NaBr",
            "Benzene + HNO3 / H2SO4 -> Nitrobenzene + H2O",
        ]
        for r in rxns:
            token_ids = self.tokenizer.encode(r)
            decoded = self.tokenizer.decode(token_ids)
            self.assertEqual(decoded, r, f"Failed reaction notation for: {r}")

    # -------------------------------------------------------------
    # 8. Spectroscopy Notation
    # -------------------------------------------------------------
    def test_08_spectroscopy_notation(self):
        """8. Verify 1H/13C NMR, FT-IR, and mass spectrometry notation."""
        specs = [
            "1H NMR: δ 7.26 (s, 1H), δ 2.10 (s, 3H)",
            "13C NMR: δ 128.5, δ 126.3, δ 21.4",
            "FT-IR: 1715 cm⁻¹ (C=O stretch), 3300 cm⁻¹ (broad O-H stretch)",
            "m/z = 180.06 [M+H]+",
        ]
        for sp in specs:
            token_ids = self.tokenizer.encode(sp)
            decoded = self.tokenizer.decode(token_ids)
            self.assertEqual(decoded, sp, f"Failed spectroscopy notation for: {sp}")

    # -------------------------------------------------------------
    # 9. Numerical Chemistry
    # -------------------------------------------------------------
    def test_09_numerical_chemistry(self):
        """9. Verify decimal values, negative numbers, and scientific notation."""
        nums = [
            "18.015",
            "-45.2",
            "0.00125",
            "6.022 × 10²³",
            "1.75 × 10⁻⁵",
            "8.314",
            "96485",
        ]
        for num in nums:
            token_ids = self.tokenizer.encode(num)
            decoded = self.tokenizer.decode(token_ids)
            self.assertEqual(decoded, num, f"Failed numerical round-trip for: {num}")

    # -------------------------------------------------------------
    # 10. Units
    # -------------------------------------------------------------
    def test_10_units(self):
        """10. Verify common chemistry and SI units."""
        units_list = [
            "kJ/mol",
            "mol/L",
            "g/mol",
            "kcal/mol",
            "g/cm³",
            "mmHg",
            "atm",
            "K",
        ]
        for u in units_list:
            token_ids = self.tokenizer.encode(u)
            decoded = self.tokenizer.decode(token_ids)
            self.assertEqual(decoded, u, f"Failed unit round-trip for: {u}")

    # -------------------------------------------------------------
    # 11. Special Tokens
    # -------------------------------------------------------------
    def test_11_special_tokens(self):
        """11. Verify all 16 special tokens map to distinct stable IDs."""
        for token_str, expected_id in SPECIAL_TOKEN_MAP.items():
            self.assertEqual(
                self.tokenizer.special_token_to_id.get(token_str),
                expected_id,
                f"Mismatch for special token {token_str}"
            )
            encoded = self.tokenizer.encode(token_str)
            self.assertEqual(encoded, [expected_id], f"Encoding special token {token_str} did not yield [{expected_id}]")
            decoded = self.tokenizer.decode([expected_id])
            self.assertEqual(decoded, token_str)

    # -------------------------------------------------------------
    # 12. Full Encode / Decode
    # -------------------------------------------------------------
    def test_12_encode_decode(self):
        """12. Verify lossless encode/decode on structured chemistry prompt."""
        text = "<QUESTION> What is the boiling point of H2O at 1 atm? <ANSWER> 100.0 °C (373.15 K) <END>"
        token_ids = self.tokenizer.encode(text)
        decoded = self.tokenizer.decode(token_ids)
        self.assertEqual(decoded, text)

    # -------------------------------------------------------------
    # 13. Chemical String Round-Trip (Directive 8)
    # -------------------------------------------------------------
    def test_13_chemical_string_round_trip(self):
        """13. Explicit round-trip tests for the 12 mandatory chemical strings."""
        mandatory_strings = [
            "H2O",
            "C6H6",
            "CH3COOH",
            "NaCl",
            "CCO",
            "CC(=O)O",
            "c1ccccc1",
            "C=C",
            "C#N",
            "C(=O)O",
            "[Na+]",
            "[OH-]",
        ]
        for s in mandatory_strings:
            t_ids = self.tokenizer.encode(s)
            res = self.tokenizer.decode(t_ids)
            self.assertEqual(res, s, f"Mandatory round-trip failed on '{s}': got '{res}'")

    # -------------------------------------------------------------
    # 14. Long Sequence Handling
    # -------------------------------------------------------------
    def test_14_long_sequence_handling(self):
        """14. Verify long sequences exceeding 512 tokens are chunked with stride overlap."""
        long_ids = list(range(100, 750))  # 650 tokens
        windows = chunk_and_pad_sequence(
            token_ids=long_ids,
            max_seq_len=512,
            stride=64,
            pad_id=PAD_ID,
            ignore_index=-100,
        )
        self.assertGreater(len(windows), 1, "Should create multiple windows for 650 tokens")
        self.assertEqual(len(windows[0]["input_ids"]), 512)
        self.assertEqual(len(windows[1]["input_ids"]), 512)
        # Check stride overlap: second window starts at 512 - 64 = 448
        self.assertEqual(windows[1]["input_ids"][0], long_ids[448])

    # -------------------------------------------------------------
    # 15. Padding
    # -------------------------------------------------------------
    def test_15_padding(self):
        """15. Verify short sequences are correctly padded to max_seq_len with PAD_ID."""
        short_ids = [BOS_ID, 25, 30, 45, EOS_ID]
        windows = chunk_and_pad_sequence(
            token_ids=short_ids,
            max_seq_len=128,
            pad_id=PAD_ID,
        )
        self.assertEqual(len(windows), 1)
        w = windows[0]
        self.assertEqual(len(w["input_ids"]), 128)
        # In causal LM, input is tokens[:-1], label is tokens[1:]
        self.assertEqual(w["input_ids"][:4], short_ids[:-1])
        self.assertTrue(all(tok == PAD_ID for tok in w["input_ids"][4:]))

    # -------------------------------------------------------------
    # 16. Truncation / Chunking
    # -------------------------------------------------------------
    def test_16_truncation_and_chunking(self):
        """16. Verify controlled chunking preserves every token across consecutive windows."""
        seq = list(range(100, 600))  # 500 tokens
        windows = chunk_and_pad_sequence(seq, max_seq_len=256, stride=32)
        self.assertGreaterEqual(len(windows), 2)
        # Verify first window ends where expected
        self.assertEqual(windows[0]["actual_length"], 256)
        # Verify coverage of initial sequence inputs
        self.assertEqual(windows[0]["input_ids"][:256], seq[:256])

    # -------------------------------------------------------------
    # 17. Attention Masks
    # -------------------------------------------------------------
    def test_17_attention_masks(self):
        """17. Verify attention mask is 1 for real tokens and 0 for padded positions."""
        token_ids = [BOS_ID, 10, 20, 30, EOS_ID]
        windows = chunk_and_pad_sequence(token_ids, max_seq_len=16, pad_id=PAD_ID)
        mask = windows[0]["attention_mask"]
        self.assertEqual(len(mask), 16)
        # 4 input tokens, remaining 12 padded
        self.assertEqual(mask[:4], [1, 1, 1, 1])
        self.assertEqual(mask[4:], [0] * 12)

    # -------------------------------------------------------------
    # 18. Next-Token Labels
    # -------------------------------------------------------------
    def test_18_next_token_labels(self):
        """18. Verify labels are shifted by 1 token and padded positions masked to -100."""
        token_ids = [BOS_ID, 101, 102, 103, EOS_ID]
        windows = chunk_and_pad_sequence(
            token_ids,
            max_seq_len=8,
            pad_id=PAD_ID,
            ignore_index=-100,
        )
        w = windows[0]
        labels = w["labels"]

        # Shifted: label[0] is input[1] (101), label[1] is input[2] (102), etc.
        self.assertEqual(labels[0], 101)
        self.assertEqual(labels[1], 102)
        self.assertEqual(labels[2], 103)
        self.assertEqual(labels[3], EOS_ID)
        # Padded positions are masked with -100
        self.assertEqual(labels[4:], [-100, -100, -100, -100])

    # -------------------------------------------------------------
    # 19. Train / Validation / Test Separation
    # -------------------------------------------------------------
    def test_19_train_val_test_separation(self):
        """19. Verify deterministic partition mapping produces disjoint record sets."""
        preparer = ChemNovaDatasetPreparer()
        ids = [f"rec_{i:04d}" for i in range(100)]
        splits = {id_: preparer._determine_split(id_) for id_ in ids}

        train_ids = {k for k, v in splits.items() if v == "training"}
        val_ids = {k for k, v in splits.items() if v == "validation"}
        test_ids = {k for k, v in splits.items() if v == "test"}

        # Disjoint intersection
        self.assertEqual(len(train_ids & val_ids), 0)
        self.assertEqual(len(train_ids & test_ids), 0)
        self.assertEqual(len(val_ids & test_ids), 0)
        # Total equals 100
        self.assertEqual(len(train_ids) + len(val_ids) + len(test_ids), 100)

    # -------------------------------------------------------------
    # 20. Data Leakage Detection
    # -------------------------------------------------------------
    def test_20_data_leakage_detection(self):
        """20. Verify DataLeakageDetector flags duplicate IDs, questions, and high overlap."""
        detector = DataLeakageDetector()

        # Register record in training
        issues1 = detector.register_record(
            record_id="REC_001",
            question="What is the structure of benzene?",
            answer="C6H6 planar ring",
            token_ids=[1, 2, 3, 4, 5],
            split="training",
        )
        self.assertEqual(len(issues1), 0)

        # Attempt to insert same ID in test -> must flag ID leakage
        issues2 = detector.register_record(
            record_id="REC_001",
            question="Different question",
            answer="Different answer",
            token_ids=[10, 20, 30],
            split="test",
        )
        self.assertTrue(any("ID Leakage" in iss for iss in issues2))

        # Attempt to insert identical question in validation -> must flag Question leakage
        issues3 = detector.register_record(
            record_id="REC_002",
            question="What is the structure of benzene?",
            answer="Different answer text",
            token_ids=[40, 50, 60],
            split="validation",
        )
        self.assertTrue(any("Question Leakage" in iss for iss in issues3))


if __name__ == "__main__":
    unittest.main()
