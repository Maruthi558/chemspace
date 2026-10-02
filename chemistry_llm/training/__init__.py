"""ChemNova Training and Optimization package."""

from .config import TrainingConfig
from .dataset import CausalLMDataset, SyntheticDummyDataset, ChemistryTextDataset, TokenizedNPZDataset
from .dataloader import create_dataloader, collate_fn_pad
from .loss import CausalLanguageModelLoss
from .optimizer import configure_optimizer, configure_scheduler
from .trainer import ChemNovaTrainer
from .checkpoint import save_checkpoint, load_checkpoint, save_best_model
from .evaluator import evaluate_model, generate_samples, validate_chemistry_string
from .hardware import detect_hardware, get_torch_device
from .reproducibility import set_seed, get_environment_snapshot
from .metrics import MetricsTracker
from .smoke_test import run_smoke_test

__all__ = [
    "TrainingConfig",
    "CausalLMDataset",
    "SyntheticDummyDataset",
    "ChemistryTextDataset",
    "TokenizedNPZDataset",
    "create_dataloader",
    "collate_fn_pad",
    "CausalLanguageModelLoss",
    "configure_optimizer",
    "configure_scheduler",
    "ChemNovaTrainer",
    "save_checkpoint",
    "load_checkpoint",
    "save_best_model",
    "evaluate_model",
    "generate_samples",
    "validate_chemistry_string",
    "detect_hardware",
    "get_torch_device",
    "set_seed",
    "get_environment_snapshot",
    "MetricsTracker",
    "run_smoke_test",
]
