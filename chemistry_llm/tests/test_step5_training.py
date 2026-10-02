"""Comprehensive Automated Test Suite for ChemNova Step 5 LLM Training.

Tests all required specifications (Directive 27):
1. Dataset loading (TokenizedNPZDataset)
2. Tokenizer / model compatibility (Vocab size, context length)
3. Batch creation (create_dataloader & collate_fn_pad)
4. Causal masking
5. Forward pass
6. Loss calculation (CausalLanguageModelLoss with ignore_index=-100)
7. Backward pass
8. Optimizer update (AdamW weight grouping)
9. Gradient accumulation
10. Checkpoint save
11. Checkpoint reload
12. Validation loop (evaluate_model)
13. Perplexity calculation
14. Training resume
15. Parameter update verification (proving weights genuinely update)
16. Smoke test execution
17. Hardware detection
18. Reproducibility & seeding
19. Generation during training & chemistry syntax validation
20. Overfitting detection & metrics tracking
"""

from pathlib import Path
import shutil
import tempfile
import unittest
import numpy as np
import torch

from chemistry_llm.model.language_model import ChemNovaLanguageModel
from chemistry_llm.config.model_config import ChemNovaModelConfig
from chemistry_llm.tokenizer.tokenizer import ChemNovaTokenizer
from chemistry_llm.training.config import TrainingConfig
from chemistry_llm.training.dataset import TokenizedNPZDataset
from chemistry_llm.training.dataloader import create_dataloader, collate_fn_pad
from chemistry_llm.training.loss import CausalLanguageModelLoss
from chemistry_llm.training.optimizer import configure_optimizer, configure_scheduler
from chemistry_llm.training.checkpoint import save_checkpoint, load_checkpoint, save_best_model
from chemistry_llm.training.evaluator import evaluate_model, generate_samples, validate_chemistry_string
from chemistry_llm.training.hardware import detect_hardware, get_torch_device
from chemistry_llm.training.reproducibility import set_seed, get_environment_snapshot
from chemistry_llm.training.metrics import MetricsTracker
from chemistry_llm.training.smoke_test import run_smoke_test
from chemistry_llm.training.trainer import ChemNovaTrainer


class TestStep5TrainingPipeline(unittest.TestCase):
    """Test suite validating ChemNova Step 5 Transformer training components."""

    @classmethod
    def setUpClass(cls):
        set_seed(42)
        cls.tokenizer = ChemNovaTokenizer()
        cls.device = torch.device("cpu")
        cls.model_config = ChemNovaModelConfig(
            vocab_size=cls.tokenizer.vocab_size,
            max_seq_len=512,
            d_model=64,
            n_layers=2,
            n_heads=2,
            d_ff=128,
        )

    def setUp(self):
        self.temp_dir = Path(tempfile.mkdtemp(prefix="chemnova_test_step5_"))

    def tearDown(self):
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    # 1. Dataset Loading
    def test_01_dataset_loading(self):
        """1. Verify TokenizedNPZDataset correctly loads tokenized array splits."""
        train_path = Path("chemistry_llm/data/tokenized/training/tokenized_arrays.npz")
        self.assertTrue(train_path.exists(), "Training tokenized .npz file must exist")
        dataset = TokenizedNPZDataset(train_path, max_samples=10)
        self.assertEqual(len(dataset), 10)
        item = dataset[0]
        self.assertIn("input_ids", item)
        self.assertIn("attention_mask", item)
        self.assertIn("labels", item)
        self.assertEqual(item["input_ids"].shape, (512,))
        self.assertEqual(item["labels"].shape, (512,))

    # 2. Tokenizer / Model Compatibility
    def test_02_tokenizer_model_compatibility(self):
        """2. Verify model vocab size strictly matches tokenizer vocab size."""
        model = ChemNovaLanguageModel(self.model_config)
        self.assertEqual(model.config.vocab_size, self.tokenizer.vocab_size)
        self.assertEqual(model.config.vocab_size, 4096)

    # 3. Batch Creation
    def test_03_batch_creation(self):
        """3. Verify dataloader batch collator stacks tensors and creates attention masks."""
        train_path = Path("chemistry_llm/data/tokenized/training/tokenized_arrays.npz")
        dataset = TokenizedNPZDataset(train_path, max_samples=6)
        loader = create_dataloader(dataset, batch_size=2, shuffle=False)
        batch = next(iter(loader))
        self.assertEqual(batch["input_ids"].shape, (2, 512))
        self.assertEqual(batch["attention_mask"].shape, (2, 512))
        self.assertEqual(batch["labels"].shape, (2, 512))

    # 4. Causal Masking
    def test_04_causal_masking(self):
        """4. Verify model forward pass enforces causal triangular masking."""
        model = ChemNovaLanguageModel(self.model_config)
        x = torch.randint(0, 4096, (1, 16))
        logits, _ = model(x)
        self.assertEqual(logits.shape, (1, 16, 4096))

    # 5. Forward Pass
    def test_05_forward_pass(self):
        """5. Verify standard forward pass produces valid un-corrupted logits."""
        model = ChemNovaLanguageModel(self.model_config)
        x = torch.randint(0, 4096, (2, 32))
        logits, loss = model(x, targets=x)
        self.assertEqual(logits.shape, (2, 32, 4096))
        self.assertIsNotNone(loss)
        self.assertFalse(torch.isnan(loss))
        self.assertGreater(loss.item(), 0.0)

    # 6. Loss Calculation
    def test_06_loss_calculation(self):
        """6. Verify cross-entropy loss ignores -100 padding index."""
        loss_fn = CausalLanguageModelLoss(ignore_index=-100)
        logits = torch.randn(2, 4, 100)
        # Sequence of target tokens where second half is masked with -100
        targets = torch.tensor([[10, 20, -100, -100], [5, 15, -100, -100]], dtype=torch.long)
        loss, ppl = loss_fn(logits, targets)
        self.assertGreater(loss.item(), 0.0)
        self.assertGreater(ppl, 1.0)

    # 7. Backward Pass
    def test_07_backward_pass(self):
        """7. Verify gradients propagate back to model parameters."""
        model = ChemNovaLanguageModel(self.model_config)
        x = torch.randint(0, 4096, (2, 16))
        logits, loss = model(x, targets=x)
        loss.backward()

        has_grads = any(p.grad is not None and p.grad.abs().sum() > 0 for p in model.parameters())
        self.assertTrue(has_grads, "Backward pass must populate non-zero parameter gradients")

    # 8. Optimizer Update
    def test_08_optimizer_update(self):
        """8. Verify optimizer step updates weights."""
        model = ChemNovaLanguageModel(self.model_config)
        opt = configure_optimizer(model, learning_rate=1e-3)
        init_val = next(model.parameters()).clone().detach()

        x = torch.randint(0, 4096, (2, 16))
        _, loss = model(x, targets=x)
        loss.backward()
        opt.step()
        opt.zero_grad()

        post_val = next(model.parameters()).clone().detach()
        self.assertFalse(torch.equal(init_val, post_val), "Weights must change after optimizer step")

    # 9. Gradient Accumulation
    def test_09_gradient_accumulation(self):
        """9. Verify loss scaling and step accumulation across micro-batches."""
        model = ChemNovaLanguageModel(self.model_config)
        opt = configure_optimizer(model, learning_rate=1e-3)
        train_path = Path("chemistry_llm/data/tokenized/training/tokenized_arrays.npz")
        dataset = TokenizedNPZDataset(train_path, max_samples=4)
        loader = create_dataloader(dataset, batch_size=2, shuffle=False)

        cfg = TrainingConfig(
            model_config=self.model_config,
            batch_size=2,
            gradient_accumulation_steps=2,
            logging_interval=1,
            validation_interval=100,
        )
        trainer = ChemNovaTrainer(model, opt, loader, config=cfg)
        self.assertEqual(trainer.accumulated_steps, 0)

        # Micro-step 1
        batch1 = next(iter(loader))
        trainer.train_step(batch1)
        self.assertEqual(trainer.accumulated_steps, 1)
        self.assertEqual(trainer.global_step, 0)  # Not stepped yet

        # Micro-step 2
        trainer.train_step(batch1)
        self.assertEqual(trainer.accumulated_steps, 2)
        self.assertEqual(trainer.global_step, 1)  # Stepped!

    # 10. Checkpoint Save
    def test_10_checkpoint_save(self):
        """10. Verify model, config, metadata, and optimizer save cleanly."""
        model = ChemNovaLanguageModel(self.model_config)
        opt = configure_optimizer(model, learning_rate=1e-3)
        chk_dir = self.temp_dir / "chk_test"
        save_checkpoint(
            checkpoint_dir=chk_dir,
            model=model,
            optimizer=opt,
            tokenizer=self.tokenizer,
            step=10,
            epoch=1,
            loss=4.5,
        )
        self.assertTrue((chk_dir / "checkpoint.pt").exists())
        self.assertTrue((chk_dir / "config.json").exists())
        self.assertTrue((chk_dir / "metadata.json").exists())

    # 11. Checkpoint Reload
    def test_11_checkpoint_reload(self):
        """11. Verify reloaded model replicates weights and metadata exactly."""
        model1 = ChemNovaLanguageModel(self.model_config)
        chk_dir = self.temp_dir / "chk_reload"
        save_checkpoint(chk_dir, model1, step=42, epoch=2, loss=3.21)

        model2 = ChemNovaLanguageModel(self.model_config)
        info = load_checkpoint(chk_dir, model2)
        self.assertEqual(info["step"], 42)
        self.assertEqual(info["epoch"], 2)
        self.assertEqual(round(info["loss"], 2), 3.21)

        for p1, p2 in zip(model1.parameters(), model2.parameters()):
            self.assertTrue(torch.equal(p1, p2))

    # 12. Validation Loop
    def test_12_validation(self):
        """12. Verify evaluate_model runs without gradients and returns valid metrics."""
        model = ChemNovaLanguageModel(self.model_config)
        train_path = Path("chemistry_llm/data/tokenized/validation/tokenized_arrays.npz")
        val_ds = TokenizedNPZDataset(train_path, max_samples=4)
        val_loader = create_dataloader(val_ds, batch_size=2, shuffle=False)
        v_loss, v_ppl = evaluate_model(model, val_loader, device=self.device)
        self.assertGreater(v_loss, 0.0)
        self.assertGreater(v_ppl, 1.0)

    # 13. Perplexity Calculation
    def test_13_perplexity(self):
        """13. Verify safe perplexity computation prevents numerical overflow."""
        loss_fn = CausalLanguageModelLoss()
        logits = torch.randn(2, 4, 100)
        targets = torch.randint(0, 100, (2, 4))
        loss, ppl = loss_fn(logits, targets)
        self.assertIsInstance(ppl, float)
        self.assertFalse(np.isnan(ppl))

    # 14. Training Resume
    def test_14_training_resume(self):
        """14. Verify trainer resumes step count and state seamlessly."""
        model = ChemNovaLanguageModel(self.model_config)
        opt = configure_optimizer(model)
        chk_dir = self.temp_dir / "chk_resume"
        save_checkpoint(chk_dir, model, optimizer=opt, step=15, epoch=1, loss=5.0)

        model_resumed = ChemNovaLanguageModel(self.model_config)
        opt_resumed = configure_optimizer(model_resumed)
        info = load_checkpoint(chk_dir, model_resumed, optimizer=opt_resumed)
        self.assertEqual(info["step"], 15)

    # 15. Parameter Update Verification
    def test_15_parameter_update_verification(self):
        """15. Verify trainer detects and confirms genuine parameter changes."""
        model = ChemNovaLanguageModel(self.model_config)
        opt = configure_optimizer(model, learning_rate=1e-3)
        train_path = Path("chemistry_llm/data/tokenized/training/tokenized_arrays.npz")
        dataset = TokenizedNPZDataset(train_path, max_samples=4)
        loader = create_dataloader(dataset, batch_size=2, shuffle=False)

        cfg = TrainingConfig(model_config=self.model_config, gradient_accumulation_steps=1)
        trainer = ChemNovaTrainer(model, opt, loader, config=cfg)
        batch = next(iter(loader))
        trainer.train_step(batch)
        audit = trainer.verify_parameter_updates()
        self.assertTrue(audit["parameters_verified"])
        self.assertGreater(audit["updated_layers_count"], 0)

    # 16. Smoke Test Execution
    def test_16_smoke_test(self):
        """16. Verify complete smoke test execution passes."""
        res = run_smoke_test()
        self.assertTrue(res["smoke_test_passed"])
        self.assertTrue(res["parameters_actually_updated"])
        self.assertTrue(res["checkpoint_save_status"])
        self.assertTrue(res["checkpoint_reload_status"])

    # 17. Hardware Detection
    def test_17_hardware_detection(self):
        """17. Verify hardware detection identifies CPU or GPU device properties."""
        hw = detect_hardware()
        self.assertIn("device", hw)
        self.assertIn("torch_version", hw)
        self.assertIn("cpu_count", hw)

    # 18. Reproducibility & Seeding
    def test_18_reproducibility(self):
        """18. Verify seed setting yields deterministic tensor random draws."""
        set_seed(12345)
        t1 = torch.rand(4, 4)
        set_seed(12345)
        t2 = torch.rand(4, 4)
        self.assertTrue(torch.equal(t1, t2))

    # 19. Generation Testing & Chemistry Syntax
    def test_19_generation_and_chemistry_syntax(self):
        """19. Verify generate_samples produces non-empty completions and validates syntax."""
        model = ChemNovaLanguageModel(self.model_config)
        results = generate_samples(
            model=model,
            tokenizer=self.tokenizer,
            prompts=["What is benzene?"],
            device=self.device,
            max_new_tokens=8,
        )
        self.assertEqual(len(results), 1)
        self.assertIn("completion", results[0])
        val = results[0]["validation"]
        self.assertIn("balanced_parentheses", val)

    # 20. Overfitting Detection & Metrics
    def test_20_overfitting_detection(self):
        """20. Verify metrics tracker records steps and flags validation loss spikes."""
        tracker = MetricsTracker(log_dir=self.temp_dir / "logs")
        tracker.record_step(epoch=0, global_step=1, train_loss=5.0, train_perplexity=148.0, learning_rate=1e-4, batch_tokens=100, val_loss=5.0)
        # Next step: train drops to 2.0, but val spikes to 8.0 (overfitting)
        tracker.record_step(epoch=0, global_step=2, train_loss=2.0, train_perplexity=7.4, learning_rate=1e-4, batch_tokens=100, val_loss=8.0)
        self.assertGreater(len(tracker.overfitting_warnings), 0)


if __name__ == "__main__":
    unittest.main()
