"""Batch Collator and DataLoader for Instruction Training."""

from typing import Dict, List
import torch
from torch.utils.data import DataLoader

from chemistry_llm.instruction_training.dataset import InstructionDataset


def collate_instruction_batch(batch: List[Dict[str, torch.Tensor]]) -> Dict[str, torch.Tensor]:
    """Dynamically pad instruction batches:
    - input_ids padded with 0 (<PAD>)
    - attention_mask padded with 0
    - labels padded with -100 (ignored in CrossEntropyLoss)
    """
    max_len = max(item["input_ids"].size(0) for item in batch)

    batch_input_ids = []
    batch_attention_mask = []
    batch_labels = []

    for item in batch:
        seq_len = item["input_ids"].size(0)
        pad_len = max_len - seq_len

        if pad_len > 0:
            padded_input_ids = torch.cat([item["input_ids"], torch.zeros(pad_len, dtype=torch.long)])
            padded_attention_mask = torch.cat([item["attention_mask"], torch.zeros(pad_len, dtype=torch.long)])
            padded_labels = torch.cat([item["labels"], torch.full((pad_len,), -100, dtype=torch.long)])
        else:
            padded_input_ids = item["input_ids"]
            padded_attention_mask = item["attention_mask"]
            padded_labels = item["labels"]

        batch_input_ids.append(padded_input_ids)
        batch_attention_mask.append(padded_attention_mask)
        batch_labels.append(padded_labels)

    return {
        "input_ids": torch.stack(batch_input_ids),
        "attention_mask": torch.stack(batch_attention_mask),
        "labels": torch.stack(batch_labels),
    }


def create_instruction_dataloader(
    dataset: InstructionDataset,
    batch_size: int = 2,
    shuffle: bool = True,
    num_workers: int = 0,
) -> DataLoader:
    """Create a DataLoader configured for instruction fine-tuning."""
    return DataLoader(
        dataset,
        batch_size=batch_size,
        shuffle=shuffle,
        num_workers=num_workers,
        collate_fn=collate_instruction_batch,
    )
