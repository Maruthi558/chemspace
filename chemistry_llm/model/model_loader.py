"""Model loader and device manager for ChemNova Transformer."""

import logging
import os
from pathlib import Path
from typing import Optional, Union
import torch

from .config import ChemNovaModelConfig
from .transformer import ChemNovaTransformerLM
from chemistry_llm.config.settings import settings

logger = logging.getLogger("chemistry_llm.model")


def detect_device(force_device: Optional[str] = None) -> torch.device:
    """Automatically detect and return the optimal compute device (CUDA GPU or CPU)."""
    target = force_device or settings.get_resolved_device()

    if target == "cuda":
        if torch.cuda.is_available():
            dev_name = torch.cuda.get_device_name(0)
            logger.info("Hardware target: CUDA GPU detected [%s]", dev_name)
            return torch.device("cuda:0")
        else:
            logger.warning("CUDA requested but not available. Falling back to CPU.")
            return torch.device("cpu")
    else:
        logger.info("Hardware target: CPU engine initialized")
        return torch.device("cpu")


def init_model(
    config: Optional[ChemNovaModelConfig] = None,
    device: Optional[torch.device] = None,
) -> ChemNovaTransformerLM:
    """Initialize a new ChemNova Transformer Language Model."""
    if config is None:
        config = ChemNovaModelConfig.from_settings(settings)

    if device is None:
        device = detect_device()

    model = ChemNovaTransformerLM(config)
    model.to(device)

    total_params = model.get_num_params()
    logger.info(
        "Initialized ChemNova Transformer: %d parameters (layers=%d, d_model=%d, heads=%d, vocab=%d) on %s",
        total_params,
        config.n_layers,
        config.d_model,
        config.n_heads,
        config.vocab_size,
        device,
    )
    return model


def save_model(
    model: ChemNovaTransformerLM,
    save_directory: Union[str, Path],
) -> None:
    """Save model weights and configuration to directory."""
    save_path = Path(save_directory)
    save_path.mkdir(parents=True, exist_ok=True)

    # 1. Save config
    config_file = save_path / "config.json"
    model.config.save_json(config_file)

    # 2. Save weights
    weights_file = save_path / "model.pt"
    torch.save(model.state_dict(), weights_file)
    logger.info("Model saved successfully to %s", save_path)


def load_model(
    checkpoint_directory: Union[str, Path],
    device: Optional[torch.device] = None,
) -> ChemNovaTransformerLM:
    """Load model weights and configuration from checkpoint directory."""
    path = Path(checkpoint_directory)
    if device is None:
        device = detect_device()

    config_file = path / "config.json"
    weights_file = path / "model.pt"

    if config_file.exists():
        config = ChemNovaModelConfig.from_json(config_file)
    else:
        config = ChemNovaModelConfig.from_settings(settings)

    model = ChemNovaTransformerLM(config)
    if weights_file.exists():
        state_dict = torch.load(weights_file, map_location=device)
        model.load_state_dict(state_dict)
        logger.info("Loaded weights from %s", weights_file)
    else:
        logger.warning("No weights file found at %s. Using initialized weights.", weights_file)

    model.to(device)
    return model
