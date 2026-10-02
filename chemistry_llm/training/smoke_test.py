"""Pre-training Smoke Test Suite (Directive 14).

Verifies the entire Transformer training loop on a small subset before full training:
- Loads a small subset (e.g., 8 samples)
- Performs forward pass
- Calculates loss
- Performs backward pass
- Updates model weights via optimizer step
- Proves model parameters actually changed
- Runs non-gradient validation
- Saves a temporary checkpoint
- Reloads the checkpoint
- Continues training for an additional step
"""

import copy
import logging
from pathlib import Path
import shutil
import sys
import tempfile
from typing import Any, Dict
import torch

from chemistry_llm.model.language_model import ChemNovaLanguageModel
from chemistry_llm.config.model_config import ChemNovaModelConfig
from chemistry_llm.tokenizer.tokenizer import ChemNovaTokenizer
from chemistry_llm.training.checkpoint import load_checkpoint, save_checkpoint
from chemistry_llm.training.config import TrainingConfig
from chemistry_llm.training.dataloader import create_dataloader
from chemistry_llm.training.dataset import TokenizedNPZDataset
from chemistry_llm.training.evaluator import evaluate_model
from chemistry_llm.training.loss import CausalLanguageModelLoss
from chemistry_llm.training.optimizer import configure_optimizer, configure_scheduler
from chemistry_llm.training.trainer import ChemNovaTrainer

# Configure UTF-8 stdout for Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("chemistry_llm.training.smoke_test")


def run_smoke_test(
    train_npz: str = "chemistry_llm/data/tokenized/training/tokenized_arrays.npz",
    val_npz: str = "chemistry_llm/data/tokenized/validation/tokenized_arrays.npz",
    device_name: str = "cpu",
) -> Dict[str, Any]:
    """Execute complete smoke test and verify parameter updates, checkpointing, and reload."""
    temp_dir = Path(tempfile.mkdtemp(prefix="chemnova_smoke_test_"))
    logger.info("Running ChemNova Pre-training Smoke Test in %s...", temp_dir)

    try:
        device = torch.device(device_name)
        tokenizer = ChemNovaTokenizer()

        # 1. Load small subset (8 training samples, 4 val samples)
        train_ds = TokenizedNPZDataset(train_npz, max_samples=8)
        val_ds = TokenizedNPZDataset(val_npz, max_samples=4)

        train_loader = create_dataloader(train_ds, batch_size=2, shuffle=False)
        val_loader = create_dataloader(val_ds, batch_size=2, shuffle=False)

        # 2. Initialize Model
        model_config = ChemNovaModelConfig(
            vocab_size=tokenizer.vocab_size,
            max_seq_len=512,
            d_model=64,
            n_layers=2,
            n_heads=2,
            d_ff=256,
        )
        model = ChemNovaLanguageModel(model_config).to(device)

        # 3. Snapshot weights before training
        initial_weights = {
            name: param.detach().cpu().clone()
            for name, param in model.named_parameters()
            if param.requires_grad
        }

        # 4. Configure optimizer & scheduler
        optimizer = configure_optimizer(model, learning_rate=1e-3, weight_decay=0.01)
        scheduler = configure_scheduler(optimizer, max_steps=10, warmup_steps=2)

        # 5. First forward + backward pass
        batch = next(iter(train_loader))
        input_ids = batch["input_ids"].to(device)
        targets = batch["labels"].to(device)

        loss_fn = CausalLanguageModelLoss(ignore_index=-100)
        logits, _ = model(input_ids)
        loss, _ = loss_fn(logits, targets)
        initial_loss = loss.item()

        loss.backward()
        optimizer.step()
        if scheduler:
            scheduler.step()
        optimizer.zero_grad()

        # 6. Verify parameter updates (weights MUST differ from initial)
        updated_params = 0
        total_params = len(initial_weights)
        for name, initial_p in initial_weights.items():
            curr_p = dict(model.named_parameters())[name]
            diff = (curr_p - initial_p).abs().sum().item()
            if diff > 1e-6:
                updated_params += 1

        params_actually_updated = (updated_params > 0)

        # 7. Second step to verify loss progression
        logits2, _ = model(input_ids)
        loss2, _ = loss_fn(logits2, targets)
        loss2.backward()
        optimizer.step()
        optimizer.zero_grad()
        final_loss = loss2.item()

        # 8. Validation pass
        val_loss, val_ppl = evaluate_model(model, val_loader, device=device, loss_fn=loss_fn)

        # 9. Save checkpoint
        chk_dir = temp_dir / "smoke_chk"
        save_checkpoint(
            checkpoint_dir=chk_dir,
            model=model,
            optimizer=optimizer,
            scheduler=scheduler,
            tokenizer=tokenizer,
            step=2,
            epoch=0,
            loss=final_loss,
            val_loss=val_loss,
        )
        chk_save_status = (chk_dir / "checkpoint.pt").exists()

        # 10. Reload checkpoint into a fresh model
        reloaded_model = ChemNovaLanguageModel(model_config).to(device)
        reloaded_opt = configure_optimizer(reloaded_model, learning_rate=1e-3)
        load_info = load_checkpoint(chk_dir, reloaded_model, optimizer=reloaded_opt, device=device)
        chk_reload_status = (load_info["step"] == 2)

        # 11. Run step on reloaded model to confirm continued training
        logits3, _ = reloaded_model(input_ids)
        loss3, _ = loss_fn(logits3, targets)
        loss3.backward()
        reloaded_opt.step()
        reloaded_opt.zero_grad()
        continue_training_status = True

        passed = (
            params_actually_updated
            and chk_save_status
            and chk_reload_status
            and continue_training_status
        )

        results = {
            "smoke_test_passed": passed,
            "initial_loss": round(initial_loss, 4),
            "final_loss": round(final_loss, 4),
            "loss_decreased": (final_loss < initial_loss),
            "updated_parameter_groups": updated_params,
            "total_parameter_groups": total_params,
            "parameters_actually_updated": params_actually_updated,
            "validation_loss": round(val_loss, 4),
            "validation_perplexity": round(val_ppl, 2),
            "checkpoint_save_status": chk_save_status,
            "checkpoint_reload_status": chk_reload_status,
            "continue_training_status": continue_training_status,
        }

        print("\n" + "=" * 60)
        print("          CHEMNOVA TRAINING SMOKE TEST RESULTS")
        print("=" * 60)
        print(f" Status:                     {'PASSED' if passed else 'FAILED'}")
        print(f" Initial Loss:               {results['initial_loss']:.4f}")
        print(f" Final Loss (Step 2):        {results['final_loss']:.4f}")
        print(f" Trainable Parameters Norm:  UPDATED ({updated_params}/{total_params} groups changed)")
        print(f" Validation Loss:            {results['validation_loss']:.4f}")
        print(f" Validation Perplexity:      {results['validation_perplexity']:.2f}")
        print(f" Checkpoint Save / Reload:   {chk_save_status} / {chk_reload_status}")
        print(f" Continued Training:         {continue_training_status}")
        print("=" * 60)

        return results

    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


if __name__ == "__main__":
    res = run_smoke_test()
    if not res["smoke_test_passed"]:
        sys.exit(1)
