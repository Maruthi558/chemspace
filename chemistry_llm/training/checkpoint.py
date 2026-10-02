"""Checkpoint saving and loading utilities for ChemNova LLM."""

from pathlib import Path
from typing import Any, Dict, Optional, Union
import json
import logging
import time
import torch

from chemistry_llm.model.transformer import ChemNovaTransformerLM
from chemistry_llm.tokenizer.tokenizer import ChemNovaTokenizer

logger = logging.getLogger("chemistry_llm.checkpoint")


def save_checkpoint(
    checkpoint_dir: Union[str, Path],
    model: nn.Module,
    optimizer: Optional[torch.optim.Optimizer] = None,
    scheduler: Optional[Any] = None,
    tokenizer: Optional[ChemNovaTokenizer] = None,
    epoch: int = 0,
    step: int = 0,
    loss: float = 0.0,
    val_loss: Optional[float] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> Path:
    """Save model weights, optimizer state, config, tokenizer config, and version metadata."""
    save_path = Path(checkpoint_dir)
    save_path.mkdir(parents=True, exist_ok=True)

    # 1. Save architecture configuration
    if hasattr(model, "config") and hasattr(model.config, "save_json"):
        model.config.save_json(save_path / "config.json")

    # 2. Save tokenizer configuration if available
    if tokenizer is not None:
        tokenizer.save_config(save_path / "tokenizer_config.json")
        tokenizer.save_vocabulary(save_path / "vocab.json")

    # 3. Save PyTorch state dictionary
    state = {
        "model_state_dict": model.state_dict(),
        "epoch": epoch,
        "step": step,
        "loss": loss,
        "val_loss": val_loss,
        "version": getattr(getattr(model, "config", None), "version", "0.1.0-step1-empty"),
        "model_name": getattr(getattr(model, "config", None), "model_name", "ChemNova-LLM"),
        "rng_state": torch.get_rng_state(),
        "metadata": metadata or {},
    }
    if optimizer is not None:
        state["optimizer_state_dict"] = optimizer.state_dict()
    if scheduler is not None and hasattr(scheduler, "state_dict"):
        state["scheduler_state_dict"] = scheduler.state_dict()

    torch.save(state, save_path / "checkpoint.pt")

    # 4. Save human-readable summary metadata
    summary = {
        "model_name": getattr(getattr(model, "config", None), "model_name", "ChemNova-LLM"),
        "version": getattr(getattr(model, "config", None), "version", "0.1.0-step1-empty"),
        "epoch": epoch,
        "step": step,
        "loss": loss,
        "val_loss": val_loss,
        "parameters": model.get_num_params() if hasattr(model, "get_num_params") else sum(p.numel() for p in model.parameters()),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        **(metadata or {}),
    }
    with open(save_path / "metadata.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    logger.info("Saved ChemNova checkpoint at step %d to %s", step, save_path)
    return save_path


def load_checkpoint(
    checkpoint_dir: Union[str, Path],
    model: nn.Module,
    optimizer: Optional[torch.optim.Optimizer] = None,
    scheduler: Optional[Any] = None,
    device: Optional[Union[str, torch.device]] = None,
) -> Dict[str, Any]:
    """Load model weights, optimizer, and scheduler state from checkpoint directory."""
    path = Path(checkpoint_dir)
    chk_file = path / "checkpoint.pt"

    if not chk_file.exists():
        raise FileNotFoundError(f"Checkpoint file not found: {chk_file}")

    target_device = device or next(model.parameters()).device
    chk = torch.load(chk_file, map_location=target_device)
    model.load_state_dict(chk["model_state_dict"])

    if optimizer is not None and "optimizer_state_dict" in chk:
        optimizer.load_state_dict(chk["optimizer_state_dict"])

    if scheduler is not None and "scheduler_state_dict" in chk and hasattr(scheduler, "load_state_dict"):
        scheduler.load_state_dict(chk["scheduler_state_dict"])

    if "rng_state" in chk:
        try:
            torch.set_rng_state(chk["rng_state"])
        except Exception:
            pass

    logger.info(
        "Loaded ChemNova checkpoint from step %d (loss: %.4f)",
        chk.get("step", 0),
        chk.get("loss", 0.0),
    )
    return {
        "epoch": chk.get("epoch", 0),
        "step": chk.get("step", 0),
        "loss": chk.get("loss", 0.0),
        "val_loss": chk.get("val_loss"),
        "version": chk.get("version", "0.1.0"),
        "model_name": chk.get("model_name", "ChemNova-LLM"),
        "metadata": chk.get("metadata", {}),
    }


def save_best_model(
    checkpoint_base_dir: Union[str, Path],
    model: nn.Module,
    val_loss: float,
    step: int,
    epoch: int,
    tokenizer: Optional[ChemNovaTokenizer] = None,
    training_config: Optional[Any] = None,
) -> Path:
    """Save the best model checkpoint to 'best_model/' subdirectory (Directive 12)."""
    best_dir = Path(checkpoint_base_dir) / "best_model"
    meta = {
        "is_best": True,
        "best_val_loss": val_loss,
        "selected_at_step": step,
    }
    if training_config is not None and hasattr(training_config, "to_dict"):
        meta["training_config"] = training_config.to_dict()

    return save_checkpoint(
        checkpoint_dir=best_dir,
        model=model,
        epoch=epoch,
        step=step,
        loss=val_loss,
        val_loss=val_loss,
        tokenizer=tokenizer,
        metadata=meta,
    )
