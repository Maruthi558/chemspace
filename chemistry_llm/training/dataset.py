"""Dataset interfaces for causal language model training."""

from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import json
import numpy as np
import torch
from torch.utils.data import Dataset
from chemistry_llm.tokenizer.tokenizer import ChemNovaTokenizer


class CausalLMDataset(Dataset):
    """General Dataset for autoregressive next-token language model training.
    
    Transforms text streams into token sequences where input is tokens[:-1]
    and target is tokens[1:].
    """

    def __init__(
        self,
        texts: List[str],
        tokenizer: ChemNovaTokenizer,
        seq_len: int = 128,
    ):
        self.tokenizer = tokenizer
        self.seq_len = seq_len
        self.samples: List[torch.Tensor] = []

        all_ids: List[int] = []
        for text in texts:
            encoded = tokenizer.encode(text, add_special_tokens=True)
            all_ids.extend(encoded)

        # Chunk into windows of seq_len + 1 tokens
        step = seq_len
        for i in range(0, len(all_ids) - seq_len, step):
            chunk = all_ids[i : i + seq_len + 1]
            if len(chunk) == seq_len + 1:
                self.samples.append(torch.tensor(chunk, dtype=torch.long))

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Dict[str, torch.Tensor]:
        chunk = self.samples[idx]
        x = chunk[:-1]
        y = chunk[1:]
        return {"input_ids": x, "targets": y}


class SyntheticDummyDataset(Dataset):
    """Tiny synthetic dataset used strictly to verify the training pipeline works.
    
    Note: Dummy testing is NOT AI training; it verifies mathematical and computational correctness.
    """

    def __init__(
        self,
        num_samples: int = 16,
        seq_len: int = 32,
        vocab_size: int = 4096,
        seed: int = 42,
    ):
        super().__init__()
        self.num_samples = num_samples
        self.seq_len = seq_len
        self.vocab_size = vocab_size

        torch.manual_seed(seed)
        # Random token IDs in [1, vocab_size - 1] (reserving 0 for PAD)
        data = torch.randint(1, vocab_size, (num_samples, seq_len + 1), dtype=torch.long)
        self.samples = [data[i] for i in range(num_samples)]

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Dict[str, torch.Tensor]:
        chunk = self.samples[idx]
        return {
            "input_ids": chunk[:-1],
            "targets": chunk[1:],
        }

class ChemistryTextDataset(CausalLMDataset):
    """Dataset interface for raw text and JSONL datasets."""

    @classmethod
    def from_jsonl(
        cls,
        jsonl_path: Union[str, Path],
        tokenizer: ChemNovaTokenizer,
        text_field: str = "text",
        seq_len: int = 128,
    ) -> "ChemistryTextDataset":
        texts = []
        path = Path(jsonl_path)
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        item = json.loads(line)
                        if text_field in item:
                            texts.append(item[text_field])
        return cls(texts=texts, tokenizer=tokenizer, seq_len=seq_len)


class TokenizedNPZDataset(Dataset):
    """Memory-efficient PyTorch Dataset for Step 4 tokenized .npz files."""

    def __init__(
        self,
        npz_path: Union[str, Path],
        mmap_mode: Optional[str] = None,
        max_samples: Optional[int] = None,
    ):
        path = Path(npz_path)
        if not path.exists():
            raise FileNotFoundError(f"Tokenized dataset not found at: {path}")

        data = np.load(path, mmap_mode=mmap_mode)
        input_ids = data["input_ids"]
        attention_mask = data["attention_mask"]
        labels = data["labels"]

        if max_samples is not None:
            input_ids = input_ids[:max_samples]
            attention_mask = attention_mask[:max_samples]
            labels = labels[:max_samples]

        self.input_ids = torch.from_numpy(np.array(input_ids, dtype=np.int64))
        self.attention_mask = torch.from_numpy(np.array(attention_mask, dtype=np.int64))
        self.labels = torch.from_numpy(np.array(labels, dtype=np.int64))
        self._len = len(self.input_ids)

    def __len__(self) -> int:
        return self._len

    def __getitem__(self, idx: int) -> Dict[str, torch.Tensor]:
        return {
            "input_ids": self.input_ids[idx],
            "attention_mask": self.attention_mask[idx],
            "targets": self.labels[idx],
            "labels": self.labels[idx],
        }
