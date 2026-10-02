"""CLI Evaluation Tool for ChemNova-LLM Checkpoints (Directive 21).

Loads a trained model checkpoint and computes:
- Validation loss
- Perplexity
- Sample chemistry prompt completions
- Basic chemistry format verification
- Model configuration and parameter statistics
"""

import argparse
import json
import logging
from pathlib import Path
import sys
import torch

from chemistry_llm.model.language_model import ChemNovaLanguageModel
from chemistry_llm.config.model_config import ChemNovaModelConfig
from chemistry_llm.tokenizer.tokenizer import ChemNovaTokenizer
from chemistry_llm.training.checkpoint import load_checkpoint
from chemistry_llm.training.dataloader import create_dataloader
from chemistry_llm.training.dataset import TokenizedNPZDataset
from chemistry_llm.training.evaluator import evaluate_model, generate_samples, validate_chemistry_string

# Configure UTF-8 stdout for Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("chemistry_llm.training.evaluate")

DEFAULT_PROMPTS = [
    "What is water?",
    "Write the molecular formula of carbon dioxide.",
    "What is the difference between an acid and a base?",
    "What is the molecular formula of benzene?",
    "Explain what a covalent bond is.",
    "SMILES for ethanol:",
]


def parse_args():
    parser = argparse.ArgumentParser(description="Evaluate a trained ChemNova-LLM checkpoint")
    parser.add_argument(
        "--checkpoint",
        type=str,
        default="chemistry_llm/checkpoints/best_model",
        help="Path to checkpoint directory containing checkpoint.pt",
    )
    parser.add_argument(
        "--dataset",
        type=str,
        default="chemistry_llm/data/tokenized/validation/tokenized_arrays.npz",
        help="Path to evaluation tokenized .npz dataset",
    )
    parser.add_argument("--batch-size", type=int, default=4, help="Evaluation batch size")
    parser.add_argument("--device", type=str, default="cpu", help="Device (cpu or cuda)")
    return parser.parse_args()


def main():
    args = parse_args()
    chk_path = Path(args.checkpoint)
    if not (chk_path / "checkpoint.pt").exists():
        # Fall back to latest if best_model does not exist
        latest_path = Path("chemistry_llm/checkpoints/latest")
        if (latest_path / "checkpoint.pt").exists():
            chk_path = latest_path
        else:
            logger.error("No valid checkpoint found at '%s' or '%s'!", args.checkpoint, latest_path)
            sys.exit(1)

    device = torch.device(args.device)
    tokenizer = ChemNovaTokenizer()

    # Load architecture config from checkpoint or default
    cfg_file = chk_path / "config.json"
    if cfg_file.exists():
        model_config = ChemNovaModelConfig.from_json(cfg_file)
    else:
        model_config = ChemNovaModelConfig(vocab_size=tokenizer.vocab_size)

    # Initialize model and load weights
    model = ChemNovaLanguageModel(model_config).to(device)
    chk_meta = load_checkpoint(chk_path, model, device=device)

    # Load dataset
    val_dataset = TokenizedNPZDataset(args.dataset)
    val_loader = create_dataloader(val_dataset, batch_size=args.batch_size, shuffle=False)

    # Evaluate loss and perplexity
    val_loss, val_ppl = evaluate_model(model, val_loader, device=device)

    # Sample generations
    sample_results = generate_samples(
        model=model,
        tokenizer=tokenizer,
        prompts=DEFAULT_PROMPTS,
        device=device,
        max_new_tokens=32,
    )

    print("\n" + "=" * 65)
    print("           CHEMNOVA-LLM MODEL EVALUATION REPORT")
    print("=" * 65)
    print(f" Checkpoint Evaluated:    {chk_path}")
    print(f" Checkpoint Step / Epoch: Step {chk_meta.get('step', 0)}, Epoch {chk_meta.get('epoch', 0)}")
    print(f" Model Parameters:        {model.get_num_params():,}")
    print(f" Model Architecture:      d_model={model_config.d_model}, n_layers={model_config.n_layers}, n_heads={model_config.n_heads}")
    print(f" Vocabulary Size:         {model_config.vocab_size:,}")
    print(f" Evaluation Dataset:      {args.dataset} ({len(val_dataset)} windows)")
    print(f" Validation Loss:         {val_loss:.4f}")
    print(f" Validation Perplexity:   {val_ppl:.2f}")
    print("-" * 65)
    print(" SAMPLE CHEMISTRY PROMPT GENERATIONS:")
    for i, s in enumerate(sample_results, 1):
        print(f" [{i}] Prompt:      {s['prompt']}")
        print(f"     Completion:  {s['completion'].strip()[:80]}")
        valid_info = s["validation"]
        print(f"     Syntax Check: Parens={valid_info['balanced_parentheses']}, Brackets={valid_info['balanced_brackets']}, SMILES_Valid={valid_info['smiles_valid']}")
    print("=" * 65)


if __name__ == "__main__":
    main()
