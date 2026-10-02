"""Optimizer and learning rate scheduler configuration for ChemNova training."""

from typing import Optional, Tuple
import torch
import torch.nn as nn
from torch.optim.lr_scheduler import _LRScheduler, CosineAnnealingLR, LinearLR, SequentialLR


def configure_optimizer(
    model: nn.Module,
    learning_rate: float = 3e-4,
    weight_decay: float = 0.01,
    betas: Tuple[float, float] = (0.9, 0.95),
    eps: float = 1e-8,
) -> torch.optim.Optimizer:
    """Create AdamW optimizer with separated weight-decay parameter groups.
    
    Parameters with >= 2 dimensions (e.g. projection weights, embeddings) receive
    weight decay, while 1D parameters (biases, normalization weights) do not.
    """
    decay_params = []
    nodecay_params = []

    for name, param in model.named_parameters():
        if not param.requires_grad:
            continue
        if param.dim() >= 2:
            decay_params.append(param)
        else:
            nodecay_params.append(param)

    optim_groups = [
        {"params": decay_params, "weight_decay": weight_decay},
        {"params": nodecay_params, "weight_decay": 0.0},
    ]

    return torch.optim.AdamW(
        optim_groups,
        lr=learning_rate,
        betas=betas,
        eps=eps,
    )


def configure_scheduler(
    optimizer: torch.optim.Optimizer,
    max_steps: int,
    warmup_steps: int = 10,
    min_lr_ratio: float = 0.1,
) -> Optional[_LRScheduler]:
    """Create learning rate scheduler with warmup and cosine decay."""
    if max_steps <= warmup_steps:
        return None

    warmup_scheduler = LinearLR(
        optimizer,
        start_factor=0.01,
        end_factor=1.0,
        total_iters=warmup_steps,
    )
    cosine_scheduler = CosineAnnealingLR(
        optimizer,
        T_max=max_steps - warmup_steps,
        eta_min=optimizer.param_groups[0]["lr"] * min_lr_ratio,
    )

    return SequentialLR(
        optimizer,
        schedulers=[warmup_scheduler, cosine_scheduler],
        milestones=[warmup_steps],
    )
