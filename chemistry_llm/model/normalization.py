"""Normalization layers for ChemNova Transformer architecture.

Supports standard Layer Normalization and Root Mean Square Normalization (RMSNorm).
"""

import torch
import torch.nn as nn


class RMSNorm(nn.Module):
    """Root Mean Square Layer Normalization (RMSNorm).
    
    computation: x * weight / sqrt(mean(x^2) + eps)
    """

    def __init__(self, dim: int, eps: float = 1e-6):
        super().__init__()
        self.eps = eps
        self.weight = nn.Parameter(torch.ones(dim))

    def _norm(self, x: torch.Tensor) -> torch.Tensor:
        return x * torch.rsqrt(x.pow(2).mean(-1, keepdim=True) + self.eps)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        output = self._norm(x.float()).type_as(x)
        return output * self.weight


class LayerNorm(nn.Module):
    """Standard Layer Normalization with configurable bias."""

    def __init__(self, dim: int, eps: float = 1e-5, bias: bool = True):
        super().__init__()
        self.norm = nn.LayerNorm(dim, eps=eps, elementwise_affine=True)
        if not bias:
            self.norm.bias = None

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.norm(x)


def get_normalization(norm_type: str, dim: int, eps: float = 1e-5) -> nn.Module:
    """Factory helper to obtain normalization layer based on configuration."""
    norm_type_lower = (norm_type or "layernorm").lower()
    if norm_type_lower == "rmsnorm":
        return RMSNorm(dim=dim, eps=eps)
    return LayerNorm(dim=dim, eps=eps)
