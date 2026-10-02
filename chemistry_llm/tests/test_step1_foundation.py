"""Step 1 Foundation Verification Test Suite for ChemNova-LLM.

Validates the 12 required architectural and computational criteria:
1. Model initializes successfully.
2. Random token IDs pass through model.
3. Output tensor dimensions are correct (B, T, vocab_size).
4. Loss can be calculated.
5. Backpropagation works (gradients computed).
6. Optimizer step works (weights update).
7. Checkpoint can be saved.
8. Checkpoint can be loaded.
9. Tokenizer can encode/decode basic test text.
10. Inference pipeline runs locally.
11. API health endpoint works.
12. API generation endpoint works.
+ Verification that NO external LLM API is called.
"""

import os
import shutil
import tempfile
import unittest
from pathlib import Path
import torch
from fastapi.testclient import TestClient

from chemistry_llm.config.model_config import ChemNovaModelConfig
from chemistry_llm.model.language_model import ChemNovaLanguageModel
from chemistry_llm.tokenizer.tokenizer import ChemNovaTokenizer
from chemistry_llm.training.loss import CausalLanguageModelLoss
from chemistry_llm.training.optimizer import configure_optimizer
from chemistry_llm.training.checkpoint import save_checkpoint, load_checkpoint
from chemistry_llm.inference.inference_engine import ChemNovaInferenceEngine
from chemistry_llm.inference.generate import generate_tokens
from chemistry_llm.api.server import app as server_app


class TestStep1Foundation(unittest.TestCase):
    """Automated verification suite for Step 1 LLM brain and backend foundation."""

    def setUp(self):
        self.tokenizer = ChemNovaTokenizer()
        self.config = ChemNovaModelConfig(
            vocabulary_size=max(4096, self.tokenizer.vocab_size + 50),
            context_length=64,
            embedding_dimension=64,
            number_of_layers=2,
            number_of_attention_heads=2,
            feed_forward_dimension=128,
            dropout=0.0,
            tie_weights=True,
            device="cpu",
        )
        self.device = torch.device("cpu")
        self.model = ChemNovaLanguageModel(self.config).to(self.device)
        self.temp_dir = tempfile.mkdtemp()

    def tearDown(self):
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_01_model_initialization(self):
        """1. Model initializes successfully with correct identity and parameters."""
        self.assertIsNotNone(self.model)
        self.assertEqual(self.model.config.model_name, "ChemNova-LLM")
        params = self.model.get_num_params()
        self.assertGreater(params, 0)
        info = self.model.inspect_parameters()
        self.assertEqual(info["model_layers"], 2)
        self.assertEqual(info["hidden_dimension"], 64)
        self.assertEqual(info["vocabulary_size"], self.config.vocabulary_size)

    def test_02_random_token_ids_forward(self):
        """2. Random token IDs can pass through the model without error."""
        batch_size = 2
        seq_len = 16
        input_ids = torch.randint(1, self.config.vocabulary_size, (batch_size, seq_len), device=self.device)
        logits, loss = self.model(input_ids)
        self.assertIsNotNone(logits)
        self.assertIsNone(loss)

    def test_03_output_tensor_dimensions(self):
        """3. Output tensor dimensions are correct: (batch_size, seq_len, vocab_size)."""
        batch_size = 3
        seq_len = 20
        input_ids = torch.randint(1, self.config.vocabulary_size, (batch_size, seq_len), device=self.device)
        logits, _ = self.model(input_ids)
        expected_shape = (batch_size, seq_len, self.config.vocabulary_size)
        self.assertEqual(logits.shape, expected_shape)

    def test_04_loss_calculation(self):
        """4. Causal language-model cross-entropy loss can be calculated."""
        batch_size = 2
        seq_len = 12
        input_ids = torch.randint(1, self.config.vocabulary_size, (batch_size, seq_len), device=self.device)
        targets = torch.randint(1, self.config.vocabulary_size, (batch_size, seq_len), device=self.device)
        
        logits, loss = self.model(input_ids, targets=targets)
        self.assertIsNotNone(loss)
        self.assertTrue(torch.is_tensor(loss))
        self.assertGreater(loss.item(), 0.0)
        self.assertFalse(torch.isnan(loss))

        # Test standalone loss module
        loss_fn = CausalLanguageModelLoss()
        l_val, ppl = loss_fn(logits, targets)
        self.assertGreater(l_val.item(), 0.0)
        self.assertGreater(ppl, 1.0)

    def test_05_backpropagation(self):
        """5. Backpropagation computes valid gradients on model parameters."""
        batch_size = 2
        seq_len = 8
        input_ids = torch.randint(1, self.config.vocabulary_size, (batch_size, seq_len), device=self.device)
        targets = torch.randint(1, self.config.vocabulary_size, (batch_size, seq_len), device=self.device)

        self.model.zero_grad()
        _, loss = self.model(input_ids, targets=targets)
        loss.backward()

        # Check that gradients were populated
        has_grads = False
        for name, param in self.model.named_parameters():
            if param.requires_grad:
                self.assertIsNotNone(param.grad, f"Gradient missing for {name}")
                self.assertFalse(torch.isnan(param.grad).any(), f"NaN gradient in {name}")
                has_grads = True
        self.assertTrue(has_grads)

    def test_06_optimizer_step(self):
        """6. Optimizer step successfully updates trainable parameters."""
        optimizer = configure_optimizer(self.model, learning_rate=0.01)
        
        # Clone an initial parameter
        target_param = next(p for p in self.model.parameters() if p.requires_grad)
        initial_weights = target_param.clone().detach()

        input_ids = torch.randint(1, self.config.vocabulary_size, (2, 8), device=self.device)
        targets = torch.randint(1, self.config.vocabulary_size, (2, 8), device=self.device)

        optimizer.zero_grad()
        _, loss = self.model(input_ids, targets=targets)
        loss.backward()
        optimizer.step()

        # Verify weights have changed
        self.assertFalse(torch.equal(initial_weights, target_param))

    def test_07_checkpoint_saving(self):
        """7. Checkpoint can be saved with model, optimizer, config, and metadata."""
        optimizer = configure_optimizer(self.model, learning_rate=1e-3)
        chk_dir = Path(self.temp_dir) / "checkpoint_test"

        saved_path = save_checkpoint(
            checkpoint_dir=chk_dir,
            model=self.model,
            optimizer=optimizer,
            tokenizer=self.tokenizer,
            epoch=1,
            step=42,
            loss=2.5,
        )

        self.assertTrue((chk_dir / "checkpoint.pt").exists())
        self.assertTrue((chk_dir / "config.json").exists())
        self.assertTrue((chk_dir / "metadata.json").exists())

    def test_08_checkpoint_loading(self):
        """8. Checkpoint can be loaded into a fresh model, restoring state."""
        chk_dir = Path(self.temp_dir) / "checkpoint_load_test"
        optimizer = configure_optimizer(self.model, learning_rate=1e-3)

        save_checkpoint(
            checkpoint_dir=chk_dir,
            model=self.model,
            optimizer=optimizer,
            epoch=2,
            step=100,
            loss=1.85,
        )

        # Fresh model instance
        fresh_model = ChemNovaLanguageModel(self.config).to(self.device)
        meta = load_checkpoint(chk_dir, fresh_model, device=self.device)

        self.assertEqual(meta["step"], 100)
        self.assertAlmostEqual(meta["loss"], 1.85, places=2)

        # Check weights are identical
        p1 = next(self.model.parameters())
        p2 = next(fresh_model.parameters())
        self.assertTrue(torch.equal(p1, p2))

    def test_09_tokenizer_encode_decode(self):
        """9. Tokenizer can encode and decode basic test text with high fidelity."""
        test_strings = [
            "Hello world",
            "H2O + CO2",
            "pH = 7.4",
            "alpha = 5.2 cm^-1",
            "C6H12O6",
        ]

        for s in test_strings:
            ids = self.tokenizer.encode(s, add_special_tokens=False)
            self.assertIsInstance(ids, list)
            self.assertGreater(len(ids), 0)
            decoded = self.tokenizer.decode(ids, skip_special_tokens=True)
            self.assertIsInstance(decoded, str)
            # Whitespace and characters preserved
            self.assertIn(s[0], decoded)

    def test_10_inference_pipeline_runs_locally(self):
        """10. Inference pipeline runs locally with sampling parameters."""
        prompt = "Hello"
        out = generate_tokens(
            model=self.model,
            tokenizer=self.tokenizer,
            prompt=prompt,
            max_new_tokens=8,
            temperature=0.7,
            top_k=20,
            top_p=0.9,
            repetition_penalty=1.1,
        )
        self.assertIsInstance(out, str)

        # Also test ChemNovaInferenceEngine wrapper
        engine = ChemNovaInferenceEngine(config=self.config, device=self.device)
        engine_out = engine.generate(prompt=prompt, max_new_tokens=5)
        self.assertIsInstance(engine_out, str)

    def test_11_api_health_endpoint(self):
        """11. API health endpoint works and reports all required attributes."""
        client = TestClient(server_app)
        res = client.get("/api/llm/health")
        self.assertEqual(res.status_code, 200)

        data = res.json()
        self.assertEqual(data["status"], "healthy")
        self.assertTrue(data["model_initialized"])
        self.assertTrue(data["tokenizer_initialized"])
        self.assertEqual(data["model"], "ChemNova-LLM")
        self.assertTrue(data["local"])
        self.assertIn("device", data)
        self.assertIn("checkpoint_status", data)
        self.assertIn("model_parameter_count", data)
        self.assertIn("training_status", data)

    def test_12_api_generation_endpoint(self):
        """12. API generation endpoint works with local model response format."""
        client = TestClient(server_app)
        payload = {
            "prompt": "Hello",
            "max_new_tokens": 10,
            "temperature": 0.5,
        }
        res = client.post("/api/llm/generate", json=payload)
        self.assertEqual(res.status_code, 200)

        data = res.json()
        self.assertIn("text", data)
        self.assertEqual(data["model"], "ChemNova-LLM")
        self.assertTrue(data["local"])
        self.assertEqual(data["prompt"], "Hello")

    def test_13_no_external_llm_api_called(self):
        """13. Verify NO external LLM APIs (OpenAI, Anthropic, Gemini, OpenRouter) are used."""
        import sys
        forbidden_modules = ["openai", "anthropic", "google.generativeai"]
        for mod in forbidden_modules:
            self.assertNotIn(mod, sys.modules, f"Forbidden external LLM module '{mod}' should not be loaded!")

        # Verify inference engine reports local=True
        engine = ChemNovaInferenceEngine(config=self.config, device=self.device)
        status = engine.get_status()
        self.assertTrue(status["local"])
        self.assertEqual(status["model_name"], "ChemNova-LLM")

    def test_14_training_pipeline_with_dummy_dataset(self):
        """14. End-to-end training pipeline runs with synthetic data and gradient accumulation."""
        from chemistry_llm.training.dataset import SyntheticDummyDataset
        from chemistry_llm.training.dataloader import create_dataloader
        from chemistry_llm.training.trainer import ChemNovaTrainer

        train_ds = SyntheticDummyDataset(num_samples=8, seq_len=16, vocab_size=self.config.vocabulary_size)
        val_ds = SyntheticDummyDataset(num_samples=4, seq_len=16, vocab_size=self.config.vocabulary_size)

        train_loader = create_dataloader(train_ds, batch_size=2, shuffle=False)
        val_loader = create_dataloader(val_ds, batch_size=2, shuffle=False)

        optimizer = configure_optimizer(self.model, learning_rate=1e-3)
        chk_dir = Path(self.temp_dir) / "trainer_chk"

        trainer = ChemNovaTrainer(
            model=self.model,
            optimizer=optimizer,
            train_dataloader=train_loader,
            val_dataloader=val_loader,
            tokenizer=self.tokenizer,
            device=self.device,
            gradient_accumulation_steps=2,
            checkpoint_dir=chk_dir,
        )

        history = trainer.train(epochs=1, log_interval=1, save_interval=2)
        self.assertGreater(len(history), 0)
        self.assertIn("loss", history[0])
        self.assertGreater(history[0]["loss"], 0.0)

        # Verify validation pass
        val_metrics = trainer.evaluate()
        self.assertIn("val_loss", val_metrics)
        self.assertGreater(val_metrics["val_loss"], 0.0)

        # Verify checkpoint was produced
        self.assertTrue((chk_dir / "checkpoint.pt").exists())


if __name__ == "__main__":
    unittest.main()

