"""ChemNova Dataset Bridges for Future Tokenization and Model Training.

Connects the Step 2 dataset infrastructure to:
1. Step 1 Tokenizer (ChemNovaTokenizer)
   DATASET -> CLEAN DATA -> TOKENIZER -> TOKEN IDS
2. Step 1 Training Engine (ChemNovaLanguageModel & ChemNovaTrainer)
   Validated Dataset -> Training Dataset -> Tokenizer -> Token IDs -> ChemNova-LLM -> Loss -> Backprop -> Checkpoint

Ensures that when real chemistry data arrives in future steps, the pipeline
can immediately ingest, tokenize, batch, and train without architectural changes.
"""

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import torch
from torch.utils.data import DataLoader

from chemistry_llm.data.schema.record import ChemNovaRecord
from chemistry_llm.tokenizer.tokenizer import ChemNovaTokenizer
from chemistry_llm.training.dataset import CausalLMDataset
from chemistry_llm.training.dataloader import create_dataloader
from chemistry_llm.model.language_model import ChemNovaLanguageModel

logger = logging.getLogger("chemistry_llm.data.bridge")


class DatasetTokenizationBridge:
    """Bridges validated ChemNova datasets to the Step 1 Tokenizer."""

    def __init__(self, tokenizer: Optional[ChemNovaTokenizer] = None):
        self.tokenizer = tokenizer or ChemNovaTokenizer()

    def tokenize_records(
        self,
        records: List[ChemNovaRecord],
        max_seq_len: int = 512,
        add_special_tokens: bool = True,
    ) -> List[Dict[str, Any]]:
        """Tokenize a list of ChemNovaRecords into integer token sequences."""
        tokenized_data = []

        for rec in records:
            clean_text = rec.get_training_text()
            token_ids = self.tokenizer.encode(
                clean_text,
                add_special_tokens=add_special_tokens,
                max_length=max_seq_len,
                truncation=True,
            )
            tokenized_data.append({
                "record_id": rec.id,
                "text": clean_text,
                "token_ids": token_ids,
                "length": len(token_ids),
                "type": rec.type,
                "domain": rec.domain,
            })

        return tokenized_data

    def tokenize_file(
        self,
        input_file: Union[str, Path],
        output_file: Optional[Union[str, Path]] = None,
        max_seq_len: int = 512,
    ) -> Dict[str, Any]:
        """Read processed JSONL file, tokenize records, and save to data/tokenized/."""
        in_p = Path(input_file)
        if not in_p.exists():
            raise FileNotFoundError(f"Input file not found: {in_p}")

        stem = in_p.stem.replace("_processed", "").replace("_cleaned", "")
        out_p = Path(output_file) if output_file else Path(f"chemistry_llm/data/tokenized/{stem}_tokenized.jsonl")
        out_p.parent.mkdir(parents=True, exist_ok=True)

        records: List[ChemNovaRecord] = []
        with open(in_p, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    records.append(ChemNovaRecord.from_jsonl_line(line))

        tokenized = self.tokenize_records(records, max_seq_len=max_seq_len)

        total_tokens = sum(item["length"] for item in tokenized)
        with open(out_p, "w", encoding="utf-8") as f:
            for item in tokenized:
                f.write(json.dumps(item, ensure_ascii=False) + "\n")

        summary = {
            "source_file": str(in_p),
            "output_file": str(out_p),
            "records_tokenized": len(tokenized),
            "total_tokens": total_tokens,
            "average_tokens_per_record": round(total_tokens / max(len(tokenized), 1), 1),
            "max_seq_len": max_seq_len,
        }
        logger.info(
            "Tokenized %d records (%d total tokens) -> %s",
            len(tokenized), total_tokens, out_p
        )
        return summary


class DatasetTrainingBridge:
    """Bridges validated datasets to PyTorch Dataset and DataLoader for Step 1 model training."""

    def __init__(self, tokenizer: Optional[ChemNovaTokenizer] = None):
        self.tokenizer = tokenizer or ChemNovaTokenizer()

    def create_torch_dataset(
        self,
        source: Union[List[ChemNovaRecord], str, Path],
        seq_len: int = 128,
    ) -> CausalLMDataset:
        """Create a PyTorch CausalLMDataset from records or JSONL file."""
        texts: List[str] = []

        if isinstance(source, (str, Path)):
            in_p = Path(source)
            if not in_p.exists():
                raise FileNotFoundError(f"File not found: {in_p}")
            with open(in_p, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        rec = ChemNovaRecord.from_jsonl_line(line)
                        texts.append(rec.get_training_text())
        else:
            for rec in source:
                texts.append(rec.get_training_text())

        return CausalLMDataset(
            texts=texts,
            tokenizer=self.tokenizer,
            seq_len=seq_len,
        )

    def create_training_dataloader(
        self,
        source: Union[List[ChemNovaRecord], str, Path],
        seq_len: int = 128,
        batch_size: int = 4,
        shuffle: bool = True,
    ) -> DataLoader:
        """Create a ready-to-train PyTorch DataLoader with collate padding and attention masks."""
        dataset = self.create_torch_dataset(source=source, seq_len=seq_len)
        return create_dataloader(
            dataset=dataset,
            batch_size=batch_size,
            shuffle=shuffle,
            pad_token_id=self.tokenizer.pad_token_id,
        )

    def dry_run_model_batch(
        self,
        model: ChemNovaLanguageModel,
        dataloader: DataLoader,
        device: Optional[torch.device] = None,
    ) -> Dict[str, Any]:
        """Perform a single dry-run forward pass to verify dataset tensor compatibility."""
        target_device = device or next(model.parameters()).device
        model.eval()

        batch = next(iter(dataloader), None)
        if batch is None:
            return {"status": "empty_dataloader", "loss": None}

        input_ids = batch["input_ids"].to(target_device)
        targets = batch["targets"].to(target_device)
        attention_mask = batch.get("attention_mask")
        if attention_mask is not None:
            attention_mask = attention_mask.to(target_device)

        with torch.no_grad():
            logits, loss = model(
                input_ids,
                targets=targets,
                attention_mask=attention_mask,
            )

        return {
            "status": "success",
            "batch_size": input_ids.size(0),
            "seq_len": input_ids.size(1),
            "logits_shape": list(logits.shape),
            "loss": round(float(loss.item()), 4) if loss is not None else None,
            "device": str(target_device),
        }
