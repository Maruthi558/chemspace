"""Before / After Comparison: Step 5 Base Model vs Step 6 Instruction Model."""

import json
import logging
from pathlib import Path
from typing import Any, Dict, List

import torch

from chemistry_llm.evaluation.benchmark_set import BENCHMARK_ITEMS
from chemistry_llm.evaluation.evaluator import generate_response
from chemistry_llm.model.config import ChemNovaModelConfig
from chemistry_llm.model.transformer import ChemNovaTransformerLM
from chemistry_llm.tokenizer.tokenizer import ChemNovaTokenizer
from chemistry_llm.training.checkpoint import load_checkpoint

logger = logging.getLogger("chemistry_llm.compare")


def load_model_from_checkpoint(checkpoint_dir: str, tokenizer: ChemNovaTokenizer) -> ChemNovaTransformerLM:
    """Helper to instantiate and load model weights from a checkpoint directory."""
    cfg = ChemNovaModelConfig(
        vocabulary_size=tokenizer.vocab_size,
        context_length=512,
        embedding_dimension=128,
        number_of_layers=4,
        number_of_attention_heads=4,
        feed_forward_dimension=512,
    )
    model = ChemNovaTransformerLM(cfg)
    load_checkpoint(checkpoint_dir, model=model, device=torch.device("cpu"))
    model.eval()
    return model


def compare_base_vs_instruction(
    base_checkpoint: str = "chemistry_llm/checkpoints/best_model",
    instruction_checkpoint: str = "chemistry_llm/instruction_checkpoints/best_model",
    output_path: str = "chemistry_llm/instruction_data/statistics/base_vs_instruction_comparison.json",
) -> List[Dict[str, Any]]:
    """Run comparative evaluation between Step 5 Base Model and Step 6 Instruction Model."""
    tokenizer = ChemNovaTokenizer()

    logger.info("Loading Step 5 Base Model from %s...", base_checkpoint)
    base_model = load_model_from_checkpoint(base_checkpoint, tokenizer)

    logger.info("Loading Step 6 Instruction Model from %s...", instruction_checkpoint)
    instruction_model = load_model_from_checkpoint(instruction_checkpoint, tokenizer)

    comparison_results = []

    print("\n" + "=" * 90)
    print("      CHEMNOVA STEP 5 (BASE) VS STEP 6 (INSTRUCTION) COMPARISON")
    print("=" * 90)

    for item in BENCHMARK_ITEMS:
        if item.context:
            prompt_str = f"<SYSTEM>\nYou are ChemNova, a chemistry-focused AI assistant.\n</SYSTEM>\n<CONTEXT>\n{item.context}\n</CONTEXT>\n<QUESTION>\n{item.question}\n</QUESTION>\n<ANSWER>\n"
        else:
            prompt_str = f"<SYSTEM>\nYou are ChemNova, a chemistry-focused AI assistant.\n</SYSTEM>\n<QUESTION>\n{item.question}\n</QUESTION>\n<ANSWER>\n"

        base_out = generate_response(base_model, tokenizer, prompt_str, max_new_tokens=48)
        inst_out = generate_response(instruction_model, tokenizer, prompt_str, max_new_tokens=48)

        record = {
            "category_code": item.category_code,
            "category_name": item.category_name,
            "question": item.question,
            "base_model_output": base_out.strip(),
            "instruction_model_output": inst_out.strip(),
            "reference_answer": item.reference_answer,
        }
        comparison_results.append(record)

        print(f"[{item.category_code}] {item.category_name}: {item.question}")
        print(f"    Base Model:        '{base_out.strip()[:65]}'")
        print(f"    Instruction Model: '{inst_out.strip()[:65]}'")
        print(f"    Reference:         '{item.reference_answer[:65]}'")
        print("-" * 90)

    # Save to disk
    out_file = Path(output_path)
    out_file.parent.mkdir(parents=True, exist_ok=True)
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(comparison_results, f, indent=2)

    logger.info("Saved comparison results to %s", out_file)
    return comparison_results


if __name__ == "__main__":
    compare_base_vs_instruction()
