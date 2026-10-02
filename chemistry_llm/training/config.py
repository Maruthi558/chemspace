"""Centralized training configuration for ChemNova-LLM."""

from dataclasses import asdict, dataclass, field
import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from chemistry_llm.config.model_config import ChemNovaModelConfig

DEFAULT_EVAL_PROMPTS: List[str] = [
    "What is water?",
    "Write the molecular formula of carbon dioxide.",
    "What is the difference between an acid and a base?",
    "What is the molecular formula of benzene?",
    "Explain what a covalent bond is.",
    "SMILES for ethanol:",
]


@dataclass
class TrainingConfig:
    """Configurable hyperparameters for local ChemNova-LLM Transformer training."""

    # Architecture & Context
    model_config: Optional[ChemNovaModelConfig] = None
    context_length: int = 512
    vocab_size: int = 4096

    # Batching & Gradient Accumulation
    batch_size: int = 4
    gradient_accumulation_steps: int = 4

    # Optimization
    optimizer: str = "adamw"
    learning_rate: float = 3e-4
    min_learning_rate: float = 3e-5
    weight_decay: float = 0.01
    beta1: float = 0.9
    beta2: float = 0.95
    epsilon: float = 1e-8
    gradient_clip_norm: float = 1.0

    # Schedule & Steps
    epochs: int = 3
    max_steps: Optional[int] = None
    warmup_steps: int = 20

    # Logging, Evaluation & Checkpointing Intervals
    logging_interval: int = 5
    validation_interval: int = 25
    checkpoint_interval: int = 50

    # Early Stopping
    early_stopping_enabled: bool = False
    early_stopping_patience: int = 5
    early_stopping_min_delta: float = 0.001

    # Hardware & Performance
    device: str = "auto"
    mixed_precision: bool = False
    number_of_workers: int = 0
    random_seed: int = 42

    # Paths
    train_data_path: str = "chemistry_llm/data/tokenized/training/tokenized_arrays.npz"
    val_data_path: str = "chemistry_llm/data/tokenized/validation/tokenized_arrays.npz"
    test_data_path: str = "chemistry_llm/data/tokenized/test/tokenized_arrays.npz"
    checkpoint_dir: str = "chemistry_llm/checkpoints"
    log_dir: str = "chemistry_llm/training_logs"
    resume_from_checkpoint: Optional[str] = None

    # Chemistry Evaluation Prompts
    eval_prompts: List[str] = field(default_factory=lambda: list(DEFAULT_EVAL_PROMPTS))

    def __post_init__(self):
        if self.model_config is None:
            self.model_config = ChemNovaModelConfig(
                vocab_size=self.vocab_size,
                max_seq_len=self.context_length,
                d_model=128,
                n_layers=4,
                n_heads=4,
                d_ff=512,
            )
        else:
            self.vocab_size = self.model_config.vocab_size
            self.context_length = self.model_config.max_seq_len

    @property
    def effective_batch_size(self) -> int:
        """Calculate effective batch size after gradient accumulation."""
        return self.batch_size * self.gradient_accumulation_steps

    def to_dict(self) -> Dict[str, Any]:
        """Convert config to dictionary representation."""
        res = asdict(self)
        if self.model_config is not None:
            res["model_config"] = self.model_config.to_dict()
        return res

    def save_json(self, path: Union[str, Path]) -> Path:
        """Serialize configuration to JSON file."""
        p = Path(path)
        p.parent.mkdir(parents=True, exist_ok=True)
        with open(p, "w", encoding="utf-8") as f:
            json.dump(self.to_dict(), f, indent=2)
        return p

    @classmethod
    def from_json(cls, path: Union[str, Path]) -> "TrainingConfig":
        """Load configuration from JSON file."""
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        model_cfg_data = data.pop("model_config", None)
        model_cfg = ChemNovaModelConfig.from_dict(model_cfg_data) if model_cfg_data else None
        return cls(model_config=model_cfg, **data)
