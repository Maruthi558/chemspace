"""Dataset Loader for ChemNova Instruction Training."""

import json
from pathlib import Path
from typing import Dict, List, Union
import torch
from torch.utils.data import Dataset

from chemistry_llm.instruction_data.schema import ChemistryInstructionExample, example_from_dict
from chemistry_llm.instruction_training.formatting import tokenize_instruction_example
from chemistry_llm.tokenizer.tokenizer import ChemNovaTokenizer


class InstructionDataset(Dataset):
    """PyTorch Dataset loading chemistry instruction examples with response loss masking."""

    def __init__(
        self,
        jsonl_path: Union[str, Path],
        tokenizer: ChemNovaTokenizer,
        max_length: int = 512,
        mask_prompt: bool = True,
    ):
        self.path = Path(jsonl_path)
        self.tokenizer = tokenizer
        self.max_length = max_length
        self.mask_prompt = mask_prompt

        self.examples: List[ChemistryInstructionExample] = []
        self._load_examples()

    def _load_examples(self) -> None:
        if not self.path.exists():
            raise FileNotFoundError(f"Instruction dataset file not found: {self.path}")

        with open(self.path, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    d = json.loads(line.strip())
                    self.examples.append(example_from_dict(d))

    def __len__(self) -> int:
        return len(self.examples)

    def __getitem__(self, idx: int) -> Dict[str, torch.Tensor]:
        ex = self.examples[idx]
        return tokenize_instruction_example(
            example=ex,
            tokenizer=self.tokenizer,
            max_length=self.max_length,
            mask_prompt=self.mask_prompt,
        )
