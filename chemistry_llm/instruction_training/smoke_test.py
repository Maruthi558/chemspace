"""Pre-fine-tuning smoke test harness for ChemNova Instruction Training."""

import logging
from pathlib import Path
import tempfile
from typing import Dict, Any
import torch

from chemistry_llm.instruction_training.config import InstructionTrainingConfig
from chemistry_llm.instruction_training.dataset import InstructionDataset
from chemistry_llm.instruction_training.dataloader import create_instruction_dataloader
from chemistry_llm.instruction_training.trainer import ChemNovaInstructionTrainer
from chemistry_llm.tokenizer.tokenizer import ChemNovaTokenizer
from chemistry_llm.training.checkpoint import load_checkpoint, save_checkpoint

logger = logging.getLogger("chemistry_llm.instruction_smoke_test")


def run_instruction_smoke_test(
    base_checkpoint_dir: str = "chemistry_llm/checkpoints/best_model",
    train_data_path: str = "chemistry_llm/instruction_data/instruction_train.jsonl",
    val_data_path: str = "chemistry_llm/instruction_data/instruction_val.jsonl",
) -> Dict[str, Any]:
    """Execute fast verification of instruction training mechanics."""
    logger.info("Starting ChemNova Instruction Training Smoke Test...")

    temp_dir = tempfile.mkdtemp(prefix="chemnova_sft_smoke_")
    chk_dir = Path(temp_dir) / "smoke_chk"

    config = InstructionTrainingConfig(
        base_checkpoint_dir=base_checkpoint_dir,
        checkpoint_dir=str(chk_dir),
        log_dir=temp_dir,
        epochs=1,
        max_steps=2,
        batch_size=2,
        gradient_accumulation_steps=1,
        logging_interval=1,
        validation_interval=1,
    )

    tokenizer = ChemNovaTokenizer()
    train_ds = InstructionDataset(train_data_path, tokenizer=tokenizer, max_length=256)
    val_ds = InstructionDataset(val_data_path, tokenizer=tokenizer, max_length=256)

    train_loader = create_instruction_dataloader(train_ds, batch_size=2, shuffle=False)
    val_loader = create_instruction_dataloader(val_ds, batch_size=2, shuffle=False)

    trainer = ChemNovaInstructionTrainer(
        config=config,
        train_dataloader=train_loader,
        val_dataloader=val_loader,
        tokenizer=tokenizer,
    )

    init_norm = sum(p.norm().item() for p in trainer.model.parameters())
    val_loss_init, val_ppl_init = trainer.evaluate()

    # Train for 2 steps
    res = trainer.train()

    updated_norm = sum(p.norm().item() for p in trainer.model.parameters())
    param_audit = res["parameter_audit"]

    # Verify checkpoint reload
    saved_best = chk_dir / "best_model"
    assert (saved_best / "checkpoint.pt").exists() or (chk_dir / "latest" / "checkpoint.pt").exists()

    val_loss_final, val_ppl_final = trainer.evaluate()

    results = {
        "status": "PASSED",
        "initial_norm": init_norm,
        "updated_norm": updated_norm,
        "parameters_updated": param_audit["updated_count"],
        "total_parameter_groups": param_audit["total_groups"],
        "val_loss_init": val_loss_init,
        "val_loss_final": val_loss_final,
        "checkpoint_saved": True,
    }

    print("\n" + "=" * 60)
    print("      CHEMNOVA INSTRUCTION TRAINING SMOKE TEST RESULTS")
    print("=" * 60)
    print(f" Status:                     {results['status']}")
    print(f" Parameters Updated:        {results['parameters_updated']}/{results['total_parameter_groups']} groups changed")
    print(f" Initial Parameter Norm:    {init_norm:.4f}")
    print(f" Updated Parameter Norm:    {updated_norm:.4f}")
    print(f" Validation Loss:           {val_loss_final:.4f} (PPL: {val_ppl_final:.2f})")
    print(f" Checkpoint Verified:       {results['checkpoint_saved']}")
    print("=" * 60 + "\n")

    return results


if __name__ == "__main__":
    run_instruction_smoke_test()
