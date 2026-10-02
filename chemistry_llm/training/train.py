"""CLI Entry Point for ChemNova-LLM Transformer Language Model Training.

Supports:
- python -m chemistry_llm.training.train --smoke-test
- python -m chemistry_llm.training.train --epochs 3 --batch-size 4 --gradient-accumulation 4
- python -m chemistry_llm.training.train --config path/to/config.json
- python -m chemistry_llm.training.train --validate-only --checkpoint path/to/checkpoint
"""

import argparse
import logging
from pathlib import Path
import sys
from typing import Optional
import torch

from chemistry_llm.model.language_model import ChemNovaLanguageModel
from chemistry_llm.config.model_config import ChemNovaModelConfig
from chemistry_llm.tokenizer.tokenizer import ChemNovaTokenizer
from chemistry_llm.training.checkpoint import load_checkpoint
from chemistry_llm.training.config import TrainingConfig
from chemistry_llm.training.dataloader import create_dataloader
from chemistry_llm.training.dataset import TokenizedNPZDataset
from chemistry_llm.training.hardware import detect_hardware, get_torch_device
from chemistry_llm.training.optimizer import configure_optimizer, configure_scheduler
from chemistry_llm.training.reproducibility import set_seed
from chemistry_llm.training.smoke_test import run_smoke_test
from chemistry_llm.training.trainer import ChemNovaTrainer

# Configure UTF-8 stdout for Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("chemistry_llm.training.train")


def parse_args():
    parser = argparse.ArgumentParser(description="Train ChemNova Transformer Language Model from scratch")
    parser.add_argument("--config", type=str, default=None, help="Path to JSON configuration file")
    parser.add_argument("--smoke-test", action="store_true", help="Run pre-training smoke test and exit")
    parser.add_argument("--validate-only", action="store_true", help="Run validation only on checkpoint and exit")
    parser.add_argument("--checkpoint", type=str, default=None, help="Path to checkpoint directory to load")
    parser.add_argument("--device", type=str, default="auto", help="Compute device: auto, cpu, or cuda")
    parser.add_argument("--batch-size", type=int, default=None, help="Micro batch size")
    parser.add_argument("--gradient-accumulation", type=int, default=None, help="Gradient accumulation steps")
    parser.add_argument("--learning-rate", type=float, default=None, help="Peak learning rate")
    parser.add_argument("--epochs", type=int, default=None, help="Total training epochs")
    parser.add_argument("--max-steps", type=int, default=None, help="Max global optimizer steps")
    parser.add_argument("--resume", action="store_true", help="Resume training from checkpoint")
    parser.add_argument("--early-stopping", action="store_true", help="Enable validation early stopping")
    parser.add_argument("--early-stopping-patience", type=int, default=5, help="Early stopping patience")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    return parser.parse_args()


def main():
    args = parse_args()

    # 1. Smoke test mode
    if args.smoke_test:
        logger.info("Executing Smoke Test...")
        smoke_res = run_smoke_test(device_name=args.device if args.device != "auto" else "cpu")
        if not smoke_res["smoke_test_passed"]:
            logger.error("Smoke test failed!")
            sys.exit(1)
        logger.info("Smoke test passed successfully!")
        return

    # 2. Load or initialize configuration
    if args.config and Path(args.config).exists():
        config = TrainingConfig.from_json(args.config)
        logger.info("Loaded training configuration from %s", args.config)
    else:
        config = TrainingConfig()

    # Apply CLI overrides
    if args.batch_size is not None:
        config.batch_size = args.batch_size
    if args.gradient_accumulation is not None:
        config.gradient_accumulation_steps = args.gradient_accumulation
    if args.learning_rate is not None:
        config.learning_rate = args.learning_rate
    if args.epochs is not None:
        config.epochs = args.epochs
    if args.max_steps is not None:
        config.max_steps = args.max_steps
    if args.device != "auto":
        config.device = args.device
    if args.early_stopping:
        config.early_stopping_enabled = True
    if args.checkpoint:
        config.resume_from_checkpoint = args.checkpoint

    # Set seed
    set_seed(args.seed)

    # Detect hardware
    hw_info = detect_hardware(config.device)
    device = get_torch_device(config.device)
    logger.info("Training on device: %s (%s)", device, hw_info["device_name"])

    # Load Tokenizer
    tokenizer = ChemNovaTokenizer()

    # Load Tokenized Datasets
    logger.info("Loading training dataset from %s...", config.train_data_path)
    train_dataset = TokenizedNPZDataset(config.train_data_path)
    val_dataset = TokenizedNPZDataset(config.val_data_path) if Path(config.val_data_path).exists() else None

    logger.info("Training samples: %d, Validation samples: %d", len(train_dataset), len(val_dataset) if val_dataset else 0)

    train_dataloader = create_dataloader(
        train_dataset,
        batch_size=config.batch_size,
        shuffle=True,
        pad_token_id=tokenizer.pad_token_id,
        ignore_index=-100,
        num_workers=config.number_of_workers,
    )
    val_dataloader = (
        create_dataloader(
            val_dataset,
            batch_size=config.batch_size,
            shuffle=False,
            pad_token_id=tokenizer.pad_token_id,
            ignore_index=-100,
            num_workers=config.number_of_workers,
        )
        if val_dataset
        else None
    )

    # Initialize Model
    model = ChemNovaLanguageModel(config.model_config).to(device)
    logger.info("Initialized ChemNova-LLM with %d trainable parameters", model.get_num_params())

    # Configure Optimizer and Scheduler
    optimizer = configure_optimizer(
        model,
        learning_rate=config.learning_rate,
        weight_decay=config.weight_decay,
        betas=(config.beta1, config.beta2),
        eps=config.epsilon,
    )

    total_training_steps = (len(train_dataloader) // config.gradient_accumulation_steps) * config.epochs
    if config.max_steps:
        total_training_steps = min(total_training_steps, config.max_steps)

    scheduler = configure_scheduler(
        optimizer,
        max_steps=max(total_training_steps, 10),
        warmup_steps=config.warmup_steps,
    )

    # Handle Checkpoint Resuming or Validate-Only
    if config.resume_from_checkpoint:
        logger.info("Loading checkpoint from %s...", config.resume_from_checkpoint)
        chk_info = load_checkpoint(
            checkpoint_dir=config.resume_from_checkpoint,
            model=model,
            optimizer=optimizer if not args.validate_only else None,
            scheduler=scheduler if not args.validate_only else None,
            device=device,
        )
        logger.info("Resumed from epoch %d, step %d (loss: %.4f)", chk_info["epoch"], chk_info["step"], chk_info["loss"])

    # Create Trainer
    trainer = ChemNovaTrainer(
        model=model,
        optimizer=optimizer,
        train_dataloader=train_dataloader,
        val_dataloader=val_dataloader,
        tokenizer=tokenizer,
        config=config,
        device=device,
        lr_scheduler=scheduler,
    )

    # Validate-only mode
    if args.validate_only:
        logger.info("Running evaluation pass...")
        val_loss, val_ppl = trainer.evaluate()
        print("\n" + "=" * 50)
        print("          EVALUATION ONLY RESULTS")
        print("=" * 50)
        print(f" Validation Loss:       {val_loss:.4f}")
        print(f" Validation Perplexity: {val_ppl:.2f}")
        print("=" * 50)
        return

    # Execute Training Loop
    summary = trainer.train(max_steps=config.max_steps, epochs=config.epochs)

    print("\n" + "=" * 65)
    print("             CHEMNOVA-LLM TRAINING COMPLETED")
    print("=" * 65)
    print(f" Total Steps Executed:       {summary.get('total_steps', 0)}")
    print(f" Tokens Processed:           {summary.get('total_tokens_processed', 0):,}")
    print(f" Final Training Loss:        {summary.get('final_train_loss', 0.0):.4f}")
    print(f" Final Training Perplexity:  {summary.get('final_train_perplexity', 0.0):.2f}")
    print(f" Best Validation Loss:       {summary.get('best_val_loss', 0.0):.4f}")
    print(f" Parameter Update Verified:  {summary.get('parameter_audit', {}).get('parameters_verified', False)}")
    print(f" Best Checkpoint Directory:  chemistry_llm/checkpoints/best_model")
    print(f" Latest Checkpoint:          {summary.get('final_checkpoint')}")
    print("=" * 65)


if __name__ == "__main__":
    main()
