"""Instruction Formatting and Response Loss Masking for Step 6.

Standardizes prompt-response templating and tokenization:
- Templates: <SYSTEM>, <QUESTION>, <ANSWER>, <SOLUTION_STEPS>, <FINAL_ANSWER>
- Response Loss Masking: labels for prompt tokens are set to -100 (ignored in loss),
  ensuring gradient updates strictly train response generation.
"""

from typing import Dict, List, Optional, Tuple
import torch

from chemistry_llm.instruction_data.schema import ChemistryInstructionExample
from chemistry_llm.tokenizer.tokenizer import ChemNovaTokenizer

DEFAULT_SYSTEM_PROMPT = "You are ChemNova, a chemistry-focused AI assistant."


def format_instruction_text(
    example: ChemistryInstructionExample,
    system_prompt: str = DEFAULT_SYSTEM_PROMPT,
) -> Tuple[str, str]:
    """Format an instruction example into separate prompt and response strings.
    
    Returns:
        (prompt_text, response_text)
    """
    # Build prompt
    prompt_parts = [f"<SYSTEM>\n{system_prompt}\n</SYSTEM>"]
    if example.input and example.input.strip():
        prompt_parts.append(f"<CONTEXT>\n{example.input.strip()}\n</CONTEXT>")
    prompt_parts.append(f"<QUESTION>\n{example.instruction.strip()}\n</QUESTION>")
    prompt_text = "\n".join(prompt_parts) + "\n"

    # Build response
    output_text = example.output.strip()
    if "<SOLUTION_STEPS>" in output_text and "<FINAL_ANSWER>" in output_text:
        response_text = output_text + "<EOS>"
    else:
        response_text = f"<ANSWER>\n{output_text}\n</ANSWER><EOS>"

    return prompt_text, response_text


def tokenize_instruction_example(
    example: ChemistryInstructionExample,
    tokenizer: ChemNovaTokenizer,
    max_length: int = 512,
    mask_prompt: bool = True,
    system_prompt: str = DEFAULT_SYSTEM_PROMPT,
) -> Dict[str, torch.Tensor]:
    """Tokenize instruction example with causal LM labels and prompt masking.
    
    Returns:
        dict containing 'input_ids', 'attention_mask', and 'labels'
    """
    prompt_str, response_str = format_instruction_text(example, system_prompt=system_prompt)

    prompt_ids = tokenizer.encode(f"<BOS>{prompt_str}")
    response_ids = tokenizer.encode(response_str)

    full_ids = prompt_ids + response_ids
    if len(full_ids) > max_length:
        # Truncate response if sequence exceeds max_length
        full_ids = full_ids[:max_length]
        if full_ids[-1] != tokenizer.vocab.get("<EOS>", 3):
            full_ids[-1] = tokenizer.vocab.get("<EOS>", 3)

    seq_len = len(full_ids)
    input_ids = torch.tensor(full_ids[:-1], dtype=torch.long)
    targets = torch.tensor(full_ids[1:], dtype=torch.long)

    # For next-token prediction, targets are shifted by 1.
    # We want labels to ignore prompt tokens.
    labels = targets.clone()
    if mask_prompt:
        # Prompt tokens end at len(prompt_ids) in full_ids.
        # In targets (which starts at index 1 of full_ids), prompt tokens occupy up to index len(prompt_ids) - 1.
        prompt_cutoff = min(len(prompt_ids) - 1, len(labels))
        labels[:prompt_cutoff] = -100

    attention_mask = torch.ones_like(input_ids)

    return {
        "input_ids": input_ids,
        "attention_mask": attention_mask,
        "labels": labels,
    }
