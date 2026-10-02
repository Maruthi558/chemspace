"""Tests for ChemNova Small Transformer Architecture."""

import unittest
import torch
from chemistry_llm.model.config import ChemNovaModelConfig
from chemistry_llm.model.transformer import ChemNovaTransformerLM
from chemistry_llm.model.model_loader import detect_device, init_model


class TestChemNovaTransformer(unittest.TestCase):

    def setUp(self):
        self.config = ChemNovaModelConfig(
            vocab_size=1024,
            max_seq_len=64,
            d_model=64,
            n_layers=2,
            n_heads=2,
            d_ff=256,
            dropout=0.0,
            tie_weights=True,
        )
        self.device = torch.device("cpu")
        self.model = ChemNovaTransformerLM(self.config).to(self.device)

    def test_model_initialization(self):
        """Verify model parameter count and structure."""
        num_params = self.model.get_num_params()
        self.assertTrue(num_params > 0)
        # Small educational model parameter check (< 2M params)
        self.assertLess(num_params, 2_000_000)

    def test_forward_pass_shape(self):
        """Verify forward pass output dimensions (B, T, vocab_size)."""
        batch_size = 2
        seq_len = 16
        input_ids = torch.randint(0, self.config.vocab_size, (batch_size, seq_len), device=self.device)
        logits, loss = self.model(input_ids)
        self.assertEqual(logits.shape, (batch_size, seq_len, self.config.vocab_size))
        self.assertIsNone(loss)

    def test_loss_computation(self):
        """Verify cross-entropy loss computation when targets are provided."""
        batch_size = 2
        seq_len = 16
        input_ids = torch.randint(0, self.config.vocab_size, (batch_size, seq_len), device=self.device)
        targets = torch.randint(0, self.config.vocab_size, (batch_size, seq_len), device=self.device)
        logits, loss = self.model(input_ids, targets=targets)
        self.assertIsNotNone(loss)
        self.assertGreater(loss.item(), 0.0)

    def test_weight_tying(self):
        """Verify that token embeddings and lm_head weights are shared."""
        self.assertTrue(
            torch.equal(
                self.model.lm_head.weight,
                self.model.embeddings.token_embeddings.embedding.weight,
            )
        )

    def test_device_detection(self):
        """Verify device detection runs cleanly on CPU/CUDA."""
        device = detect_device()
        self.assertIn(device.type, ["cpu", "cuda"])


if __name__ == "__main__":
    unittest.main()
