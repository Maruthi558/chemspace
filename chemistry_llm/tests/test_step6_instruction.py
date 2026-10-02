"""Unit Test Suite for Step 6: ChemNova Chemistry Instruction & Reasoning Training."""

import json
from pathlib import Path
import tempfile
import unittest
import torch

from chemistry_llm.evaluation.benchmark_set import BENCHMARK_ITEMS
from chemistry_llm.evaluation.evaluator import evaluate_benchmark_item, generate_response
from chemistry_llm.instruction_data.generators import generate_all_instruction_examples
from chemistry_llm.instruction_data.pipeline import InstructionDataPipeline
from chemistry_llm.instruction_data.schema import ChemistryInstructionExample, example_from_dict
from chemistry_llm.instruction_training.config import InstructionTrainingConfig
from chemistry_llm.instruction_training.dataset import InstructionDataset
from chemistry_llm.instruction_training.dataloader import create_instruction_dataloader
from chemistry_llm.instruction_training.formatting import format_instruction_text, tokenize_instruction_example
from chemistry_llm.instruction_training.smoke_test import run_instruction_smoke_test
from chemistry_llm.instruction_training.trainer import ChemNovaInstructionTrainer
from chemistry_llm.model.config import ChemNovaModelConfig
from chemistry_llm.model.transformer import ChemNovaTransformerLM
from chemistry_llm.tokenizer.tokenizer import ChemNovaTokenizer
from chemistry_llm.training.checkpoint import load_checkpoint, save_checkpoint


class TestStep6InstructionTraining(unittest.TestCase):
    """Test suite verifying Step 6 instruction dataset, training engine, and evaluation."""

    @classmethod
    def setUpClass(cls):
        cls.tokenizer = ChemNovaTokenizer()
        cls.temp_dir = tempfile.mkdtemp(prefix="chemnova_step6_test_")

    def test_01_schema_validation(self):
        """1. Valid examples pass schema checks and invalid examples are rejected."""
        valid_ex = ChemistryInstructionExample(
            id="test_01",
            instruction="What is water?",
            output="Water is a chemical compound consisting of two hydrogen atoms and one oxygen atom (H2O).",
            domain="fundamentals",
            difficulty="introductory",
        )
        is_valid, errors = valid_ex.validate()
        self.assertTrue(is_valid, f"Validation failed with: {errors}")
        self.assertEqual(len(errors), 0)

        # Invalid example (empty output and invalid domain)
        invalid_ex = ChemistryInstructionExample(
            id="test_02",
            instruction="",
            output="",
            domain="non_existent_domain",
        )
        is_valid_inv, errors_inv = invalid_ex.validate()
        self.assertFalse(is_valid_inv)
        self.assertGreater(len(errors_inv), 0)

    def test_02_generators_breadth(self):
        """2. All instruction generators produce valid, non-empty examples covering multiple categories."""
        examples = generate_all_instruction_examples()
        self.assertGreater(len(examples), 20)

        domains = {ex.domain for ex in examples}
        self.assertIn("fundamentals", domains)
        self.assertIn("general_chemistry", domains)
        self.assertIn("organic_chemistry", domains)
        self.assertIn("calculations", domains)
        self.assertIn("spectroscopy", domains)
        self.assertIn("laboratory_safety", domains)
        self.assertIn("conversation", domains)

    def test_03_data_pipeline_and_leakage(self):
        """3. Data pipeline generates splits and guarantees zero leakage between train/val/test."""
        pipe_dir = Path(self.temp_dir) / "pipeline_test"
        pipeline = InstructionDataPipeline(base_dir=pipe_dir)
        manifest = pipeline.run_pipeline(random_seed=42)

        self.assertGreater(manifest["total_examples"], 0)
        self.assertGreater(manifest["splits"]["train"]["count"], 0)
        self.assertGreater(manifest["splits"]["validation"]["count"], 0)
        self.assertGreater(manifest["splits"]["test"]["count"], 0)

        # Verify hash disjointness
        train_lines = (pipe_dir / "instruction_train.jsonl").read_text(encoding="utf-8").strip().split("\n")
        val_lines = (pipe_dir / "instruction_val.jsonl").read_text(encoding="utf-8").strip().split("\n")
        test_lines = (pipe_dir / "instruction_test.jsonl").read_text(encoding="utf-8").strip().split("\n")

        train_hashes = {example_from_dict(json.loads(l)).compute_hash() for l in train_lines}
        val_hashes = {example_from_dict(json.loads(l)).compute_hash() for l in val_lines}
        test_hashes = {example_from_dict(json.loads(l)).compute_hash() for l in test_lines}

        self.assertEqual(len(train_hashes & val_hashes), 0)
        self.assertEqual(len(train_hashes & test_hashes), 0)
        self.assertEqual(len(val_hashes & test_hashes), 0)

    def test_04_formatting_and_response_loss_masking(self):
        """4. Instruction formatting correctly masks prompt tokens with -100 in labels."""
        ex = ChemistryInstructionExample(
            id="mask_test",
            instruction="What is helium?",
            output="Helium is a noble gas with atomic number 2.",
            domain="fundamentals",
        )
        tokenized = tokenize_instruction_example(
            example=ex,
            tokenizer=self.tokenizer,
            max_length=128,
            mask_prompt=True,
        )

        labels = tokenized["labels"]
        # Prompt portion should be masked with -100
        self.assertTrue((labels == -100).any())
        # Response portion should contain actual token IDs (> -1)
        self.assertTrue((labels != -100).any())
        self.assertEqual(tokenized["input_ids"].size(), tokenized["labels"].size())

    def test_05_dataloader_collation(self):
        """5. Batch collation correctly dynamic-pads inputs with 0 and labels with -100."""
        ds_file = Path(self.temp_dir) / "ds_test.jsonl"
        ex1 = ChemistryInstructionExample(id="1", instruction="Short", output="Ans")
        ex2 = ChemistryInstructionExample(id="2", instruction="Much longer question here", output="Longer detailed answer here")

        with open(ds_file, "w", encoding="utf-8") as f:
            f.write(json.dumps(ex1.to_dict()) + "\n")
            f.write(json.dumps(ex2.to_dict()) + "\n")

        ds = InstructionDataset(ds_file, tokenizer=self.tokenizer, max_length=128)
        loader = create_instruction_dataloader(ds, batch_size=2, shuffle=False)

        batch = next(iter(loader))
        self.assertEqual(batch["input_ids"].size(0), 2)
        self.assertEqual(batch["labels"].size(0), 2)
        # Pad positions in labels should equal -100
        self.assertIn(-100, batch["labels"].tolist()[0] + batch["labels"].tolist()[1])

    def test_06_instruction_forward_backward(self):
        """6. Forward and backward pass execute correctly with cross-entropy loss ignoring prompt."""
        cfg = ChemNovaModelConfig(
            vocabulary_size=self.tokenizer.vocab_size,
            context_length=64,
            embedding_dimension=64,
            number_of_layers=2,
            number_of_attention_heads=2,
            feed_forward_dimension=128,
        )
        model = ChemNovaTransformerLM(cfg)
        loss_fn = torch.nn.CrossEntropyLoss(ignore_index=-100)

        input_ids = torch.randint(0, 50, (2, 16))
        # Mask first 8 positions in labels
        labels = torch.randint(0, 50, (2, 16))
        labels[:, :8] = -100

        logits, _ = model(input_ids)
        loss = loss_fn(logits.view(-1, logits.size(-1)), labels.view(-1))

        self.assertFalse(torch.isnan(loss))
        self.assertGreater(loss.item(), 0.0)

        loss.backward()
        # Verify gradients exist
        has_grads = any(p.grad is not None and p.grad.norm().item() > 0 for p in model.parameters())
        self.assertTrue(has_grads)

    def test_07_parameter_update_verification(self):
        """7. Optimizer step actually modifies model parameter weights."""
        cfg = ChemNovaModelConfig(
            vocabulary_size=self.tokenizer.vocab_size,
            context_length=64,
            embedding_dimension=64,
            number_of_layers=2,
            number_of_attention_heads=2,
            feed_forward_dimension=128,
        )
        model = ChemNovaTransformerLM(cfg)
        target_param = next(model.parameters())
        initial_p = target_param.clone()

        optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3)
        input_ids = torch.randint(0, 50, (2, 16))
        labels = torch.randint(0, 50, (2, 16))
        loss_fn = torch.nn.CrossEntropyLoss()

        logits, _ = model(input_ids)
        loss = loss_fn(logits.view(-1, logits.size(-1)), labels.view(-1))
        loss.backward()
        optimizer.step()

        self.assertFalse(torch.equal(initial_p, target_param))

    def test_08_checkpoint_preservation(self):
        """8. Step 5 checkpoint is not overwritten and Step 6 checkpoints save correctly."""
        step5_chk = Path("chemistry_llm/checkpoints/best_model/checkpoint.pt")
        self.assertTrue(step5_chk.exists())
        step5_mtime = step5_chk.stat().st_mtime

        # Save an instruction checkpoint in separate directory
        sft_chk_dir = Path(self.temp_dir) / "sft_chk"
        cfg = ChemNovaModelConfig(vocabulary_size=self.tokenizer.vocab_size)
        model = ChemNovaTransformerLM(cfg)

        save_checkpoint(
            checkpoint_dir=sft_chk_dir,
            model=model,
            step=10,
            epoch=1,
            loss=4.5,
            val_loss=4.2,
        )

        self.assertTrue((sft_chk_dir / "checkpoint.pt").exists())
        # Base checkpoint remains untouched
        self.assertEqual(step5_chk.stat().st_mtime, step5_mtime)

    def test_09_benchmark_coverage(self):
        """9. Benchmark suite covers all 18 specified categories (A through R)."""
        categories = {item.category_code for item in BENCHMARK_ITEMS}
        expected_categories = set("ABCDEFGHIJKLMNOPQR")
        self.assertEqual(categories, expected_categories)

    def test_10_smoke_test_run(self):
        """10. Instruction training smoke test executes and reports PASSED status."""
        results = run_instruction_smoke_test()
        self.assertEqual(results["status"], "PASSED")
        self.assertGreater(results["parameters_updated"], 0)
        self.assertTrue(results["checkpoint_saved"])


if __name__ == "__main__":
    unittest.main()
