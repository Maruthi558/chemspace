"""DataLoader utilities and batch collators for ChemNova training."""

from typing import Dict, List, Optional
import torch
from torch.utils.data import DataLoader, Dataset
from chemistry_llm.tokenizer.special_tokens import PAD_ID


def collate_fn_pad(
    batch: List[Dict[str, torch.Tensor]],
    pad_token_id: int = PAD_ID,
    ignore_index: int = -100,
) -> Dict[str, torch.Tensor]:
    """Pad variable-length sequences in a batch to the longest sequence in the batch."""
    input_ids = [item["input_ids"] for item in batch]
    targets = [item.get("targets", item.get("labels")) for item in batch]

    input_ids_padded = torch.nn.utils.rnn.pad_sequence(
        input_ids, batch_first=True, padding_value=pad_token_id
    )
    targets_padded = torch.nn.utils.rnn.pad_sequence(
        targets, batch_first=True, padding_value=ignore_index
    )

    # Use attention mask from item if available, otherwise compute from pad_token_id
    if "attention_mask" in batch[0]:
        attention_mask = torch.stack([item["attention_mask"] for item in batch])
    else:
        attention_mask = (input_ids_padded != pad_token_id).long()

    return {
        "input_ids": input_ids_padded,
        "targets": targets_padded,
        "labels": targets_padded,
        "attention_mask": attention_mask,
    }


def create_dataloader(
    dataset: Dataset,
    batch_size: int = 4,
    shuffle: bool = True,
    pad_token_id: int = PAD_ID,
    ignore_index: int = -100,
    num_workers: int = 0,
    drop_last: bool = False,
) -> DataLoader:
    """Create a PyTorch DataLoader configured for causal language modeling."""
    return DataLoader(
        dataset,
        batch_size=batch_size,
        shuffle=shuffle,
        num_workers=num_workers,
        drop_last=drop_last,
        collate_fn=lambda b: collate_fn_pad(b, pad_token_id=pad_token_id, ignore_index=ignore_index),
    )
