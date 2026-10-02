"""Reproducibility and deterministic environment management for ChemNova-LLM."""

import os
import random
from typing import Any, Dict
import numpy as np
import torch


def set_seed(seed: int = 42, deterministic: bool = True) -> int:
    """Set random seeds across Python, NumPy, and PyTorch for reproducible runs."""
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)

    if deterministic:
        torch.backends.cudnn.deterministic = True
        torch.backends.cudnn.benchmark = False
        os.environ["PYTHONHASHSEED"] = str(seed)

    return seed


def get_environment_snapshot() -> Dict[str, Any]:
    """Capture runtime environment metadata for audit and experiment reproducibility."""
    import platform
    return {
        "python_version": platform.python_version(),
        "platform": platform.platform(),
        "torch_version": torch.__version__,
        "numpy_version": np.__version__,
        "cuda_available": torch.cuda.is_available(),
        "device_count": torch.cuda.device_count() if torch.cuda.is_available() else 0,
        "env_pythonhashseed": os.environ.get("PYTHONHASHSEED", "default"),
    }
