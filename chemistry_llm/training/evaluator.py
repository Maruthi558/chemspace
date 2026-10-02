"""Evaluation, chemistry validation, and sample generation during training."""

import logging
import math
import re
from typing import Any, Dict, List, Optional, Tuple
import torch
import torch.nn as nn
from torch.utils.data import DataLoader

from chemistry_llm.tokenizer.tokenizer import ChemNovaTokenizer
from chemistry_llm.training.loss import CausalLanguageModelLoss

logger = logging.getLogger("chemistry_llm.training.evaluator")

# Chemistry validation patterns
FORMULA_PATTERN = re.compile(r"^[A-Z][a-z]?\d*(?:[A-Z][a-z]?\d*)*$")


def validate_chemistry_string(text: str) -> Dict[str, Any]:
    """Inspect generated text for basic chemical notation validity (Directive 17)."""
    text = text.strip()
    # Check parenthetical balance
    balanced_parens = text.count("(") == text.count(")")
    balanced_brackets = text.count("[") == text.count("]")

    # Check SMILES validity via RDKit if available, else structural heuristic
    smiles_valid = None
    try:
        from rdkit import Chem
        m = Chem.MolFromSmiles(text)
        smiles_valid = (m is not None)
    except Exception:
        # Fallback heuristic: check for typical SMILES characters
        if re.match(r"^[A-Za-z0-9@+\-\[\]\(\)\\\/=#%:]+$", text):
            smiles_valid = balanced_parens and balanced_brackets

    return {
        "text": text,
        "balanced_parentheses": balanced_parens,
        "balanced_brackets": balanced_brackets,
        "smiles_valid": smiles_valid,
    }


def evaluate_model(
    model: nn.Module,
    dataloader: DataLoader,
    device: torch.device,
    loss_fn: Optional[CausalLanguageModelLoss] = None,
    max_batches: Optional[int] = None,
) -> Tuple[float, float]:
    """Calculate validation loss and perplexity across dataloader without gradients."""
    model.eval()
    if loss_fn is None:
        loss_fn = CausalLanguageModelLoss(ignore_index=-100)

    total_loss = 0.0
    total_tokens = 0
    batches_evaluated = 0

    with torch.no_grad():
        for i, batch in enumerate(dataloader):
            if max_batches is not None and i >= max_batches:
                break

            input_ids = batch["input_ids"].to(device)
            targets = batch.get("targets", batch.get("labels")).to(device)
            attention_mask = batch.get("attention_mask")
            if attention_mask is not None:
                attention_mask = attention_mask.to(device)

            logits, _ = model(input_ids, attention_mask=attention_mask)
            loss, _ = loss_fn(logits, targets)

            # Count non-ignored tokens
            non_ignored = (targets != loss_fn.ignore_index).sum().item()
            total_loss += loss.item() * max(non_ignored, 1)
            total_tokens += max(non_ignored, 1)
            batches_evaluated += 1

    if total_tokens == 0:
        return 0.0, 1.0

    mean_loss = total_loss / total_tokens
    try:
        perplexity = math.exp(min(mean_loss, 100.0))
    except (OverflowError, ValueError):
        perplexity = float("inf")

    return mean_loss, perplexity


def generate_samples(
    model: nn.Module,
    tokenizer: ChemNovaTokenizer,
    prompts: List[str],
    device: torch.device,
    max_new_tokens: int = 32,
    temperature: float = 0.8,
) -> List[Dict[str, Any]]:
    """Generate sample responses for fixed chemistry prompts during evaluation (Directive 16)."""
    model.eval()
    results = []

    for prompt in prompts:
        token_ids = tokenizer.encode(prompt, add_special_tokens=True)
        input_tensor = torch.tensor([token_ids], dtype=torch.long, device=device)

        generated_ids = list(token_ids)

        with torch.no_grad():
            for _ in range(max_new_tokens):
                # Crop to context window if needed
                curr_input = input_tensor[:, -512:]
                logits, _ = model(curr_input)
                next_token_logits = logits[0, -1, :] / max(temperature, 1e-4)

                # Greedy or top-k sample
                probs = torch.softmax(next_token_logits, dim=-1)
                next_token = torch.argmax(probs).item()

                generated_ids.append(next_token)
                input_tensor = torch.tensor([generated_ids], dtype=torch.long, device=device)

                if next_token == tokenizer.eos_token_id:
                    break

        completion = tokenizer.decode(generated_ids)
        validation_info = validate_chemistry_string(completion)

        results.append({
            "prompt": prompt,
            "completion": completion,
            "validation": validation_info,
        })

    return results
