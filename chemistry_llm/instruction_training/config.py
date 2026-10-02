"""Configuration for ChemNova Chemistry Instruction & Reasoning Training (Step 6)."""

from dataclasses import asdict, dataclass, field
import json
from pathlib import Path
from typing import Any, Dict, List, Optional


@dataclass
class InstructionTrainingConfig:
    """Configuration dataclass for Supervised Instruction Fine-Tuning."""

    model_name: str = "ChemNova-Instruction-LLM"
    version: str = "0.2.0-step6"
    base_checkpoint_dir: str = "chemistry_llm/checkpoints/best_model"
    checkpoint_dir: str = "chemistry_llm/instruction_checkpoints"
    log_dir: str = "chemistry_llm/instruction_data/statistics"

    train_data_path: str = "chemistry_llm/instruction_data/instruction_train.jsonl"
    val_data_path: str = "chemistry_llm/instruction_data/instruction_val.jsonl"
    test_data_path: str = "chemistry_llm/instruction_data/instruction_test.jsonl"

    learning_rate: float = 1.0e-4
    min_learning_rate: float = 1.0e-5
    weight_decay: float = 0.01
    beta1: float = 0.9
    beta2: float = 0.95
    epsilon: float = 1.0e-8
    gradient_clip_norm: float = 1.0

    epochs: int = 3
    max_steps: Optional[int] = None
    batch_size: int = 2
    gradient_accumulation_steps: int = 2
    max_length: int = 512
    mask_prompt: bool = True
    warmup_steps: int = 5

    logging_interval: int = 2
    validation_interval: int = 5
    checkpoint_interval: int = 10

    early_stopping_enabled: bool = False
    early_stopping_patience: int = 3
    early_stopping_min_delta: float = 0.001

    device: str = "auto"
    mixed_precision: bool = False
    random_seed: int = 42

    def to_dict(self) -> Dict[str, Any]:
        """Convert config to dictionary."""
        return asdict(self)

    def save(self, path: Path) -> None:
        """Save configuration to JSON file."""
        with open(path, "w", encoding="utf-8") as f:
            json.dump(self.to_dict(), f, indent=2)

    @classmethod
    def load(cls, path: Path) -> "InstructionTrainingConfig":
        """Load configuration from JSON file."""
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return cls(**data)
