"""Command-Line Interface for ChemNova Instruction Fine-Tuning (Step 6)."""

import argparse
import logging
from pathlib import Path
import sys

from chemistry_llm.instruction_training.config import InstructionTrainingConfig
from chemistry_llm.instruction_training.dataset import InstructionDataset
from chemistry_llm.instruction_training.dataloader import create_instruction_dataloader
from chemistry_llm.instruction_training.smoke_test import run_instruction_smoke_test
from chemistry_llm.instruction_training.trainer import ChemNovaInstructionTrainer
from chemistry_llm.tokenizer.tokenizer import ChemNovaTokenizer

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("chemistry_llm.instruction_train_cli")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="ChemNova-LLM Instruction Fine-Tuning CLI")
    parser.add_argument("--config", type=str, default=None, help="Path to JSON configuration file")
    parser.add_argument("--base-checkpoint", type=str, default="chemistry_llm/checkpoints/best_model", help="Path to Step 5 base checkpoint")
    parser.add_argument("--checkpoint-dir", type=str, default="chemistry_llm/instruction_checkpoints", help="Path to save instruction checkpoints")
    parser.add_argument("--train-data", type=str, default="chemistry_llm/instruction_data/instruction_train.jsonl", help="Path to instruction train data")
    parser.add_argument("--val-data", type=str, default="chemistry_llm/instruction_data/instruction_val.jsonl", help="Path to instruction validation data")
    parser.add_argument("--epochs", type=int, default=3, help="Number of instruction fine-tuning epochs")
    parser.add_argument("--batch-size", type=int, default=2, help="Micro batch size")
    parser.add_argument("--learning-rate", type=float, default=1.0e-4, help="Instruction fine-tuning learning rate")
    parser.add_argument("--gradient-accumulation", type=int, default=2, help="Gradient accumulation steps")
    parser.add_argument("--smoke-test", action="store_true", help="Run fast verification smoke test and exit")
    parser.add_argument("--evaluate", action="store_true", help="Run validation evaluation only on existing checkpoint")
    return parser.parse_args()


def main():
    args = parse_args()

    if args.smoke_test:
        logger.info("Executing instruction training smoke test...")
        results = run_instruction_smoke_test()
        if results["status"] == "PASSED":
            logger.info("Smoke test passed successfully!")
            sys.exit(0)
        else:
            logger.error("Smoke test failed!")
            sys.exit(1)

    if args.config:
        config = InstructionTrainingConfig.load(Path(args.config))
    else:
        config = InstructionTrainingConfig(
            base_checkpoint_dir=args.base_checkpoint,
            checkpoint_dir=args.checkpoint_dir,
            train_data_path=args.train_data,
            val_data_path=args.val_data,
            epochs=args.epochs,
            batch_size=args.batch_size,
            learning_rate=args.learning_rate,
            gradient_accumulation_steps=args.gradient_accumulation,
        )

    tokenizer = ChemNovaTokenizer()
    train_ds = InstructionDataset(config.train_data_path, tokenizer=tokenizer, max_length=config.max_length)
    val_ds = InstructionDataset(config.val_data_path, tokenizer=tokenizer, max_length=config.max_length)

    train_loader = create_instruction_dataloader(train_ds, batch_size=config.batch_size, shuffle=True)
    val_loader = create_instruction_dataloader(val_ds, batch_size=config.batch_size, shuffle=False)

    trainer = ChemNovaInstructionTrainer(
        config=config,
        train_dataloader=train_loader,
        val_dataloader=val_loader,
        tokenizer=tokenizer,
    )

    if args.evaluate:
        logger.info("Running evaluation on instruction validation split...")
        loss, ppl = trainer.evaluate()
        logger.info("Validation Loss: %.4f | Perplexity: %.2f", loss, ppl)
        return

    logger.info("Initiating full ChemNova Instruction Fine-Tuning...")
    res = trainer.train()
    logger.info(
        "Instruction training finished! Best Val Loss: %.4f | Latest Checkpoint: %s",
        res["best_val_loss"],
        res["latest_checkpoint"],
    )


if __name__ == "__main__":
    main()
