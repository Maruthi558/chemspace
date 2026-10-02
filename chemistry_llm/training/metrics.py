"""Metrics tracking, overfitting detection, and training logging for ChemNova-LLM."""

from datetime import datetime, timezone
import json
import logging
from pathlib import Path
import time
from typing import Any, Dict, List, Optional, Union

logger = logging.getLogger("chemistry_llm.training.metrics")


class MetricsTracker:
    """Records training and validation metrics, computes throughput, and audits overfitting."""

    def __init__(self, log_dir: Union[str, Path] = "chemistry_llm/training_logs"):
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(parents=True, exist_ok=True)
        self.metrics_file = self.log_dir / "training_metrics.jsonl"
        self.history: List[Dict[str, Any]] = []

        self.start_time = time.perf_counter()
        self.total_tokens_processed = 0
        self.min_val_loss = float("inf")
        self.overfitting_warnings: List[Dict[str, Any]] = []

    def record_step(
        self,
        epoch: int,
        global_step: int,
        train_loss: float,
        train_perplexity: float,
        learning_rate: float,
        batch_tokens: int,
        val_loss: Optional[float] = None,
        val_perplexity: Optional[float] = None,
        device_name: str = "cpu",
    ) -> Dict[str, Any]:
        """Record step-level or validation-level metrics."""
        self.total_tokens_processed += batch_tokens
        elapsed = max(time.perf_counter() - self.start_time, 1e-4)
        throughput = self.total_tokens_processed / elapsed

        entry: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "epoch": epoch,
            "global_step": global_step,
            "train_loss": round(train_loss, 4),
            "train_perplexity": round(train_perplexity, 2),
            "learning_rate": float(f"{learning_rate:.6e}"),
            "tokens_processed": self.total_tokens_processed,
            "throughput_tokens_per_sec": round(throughput, 1),
            "device": device_name,
        }

        if val_loss is not None:
            entry["val_loss"] = round(val_loss, 4)
            entry["val_perplexity"] = round(val_perplexity, 2) if val_perplexity is not None else None

            # Overfitting detection (Directive 15)
            # If train loss keeps decreasing but val loss is substantially higher than best recorded
            if len(self.history) > 0 and val_loss > self.min_val_loss * 1.15:
                warning = {
                    "step": global_step,
                    "val_loss": val_loss,
                    "best_val_loss": self.min_val_loss,
                    "train_loss": train_loss,
                    "warning": "Potential Overfitting: Validation loss is rising while training loss is decreasing.",
                }
                self.overfitting_warnings.append(warning)
                entry["overfitting_warning"] = True
                logger.warning(
                    "[OVERFITTING WARNING] Step %d: val_loss=%.4f (best=%.4f), train_loss=%.4f",
                    global_step,
                    val_loss,
                    self.min_val_loss,
                    train_loss,
                )

            if val_loss < self.min_val_loss:
                self.min_val_loss = val_loss

        self.history.append(entry)

        # Write to JSONL
        with open(self.metrics_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry) + "\n")

        return entry

    def get_summary(self) -> Dict[str, Any]:
        """Return human-readable and machine-readable training summary."""
        if not self.history:
            return {"status": "NO_TRAINING_STEPS_RECORDED"}

        latest = self.history[-1]
        val_losses = [h["val_loss"] for h in self.history if "val_loss" in h and h["val_loss"] is not None]

        return {
            "total_steps": latest["global_step"],
            "total_tokens_processed": self.total_tokens_processed,
            "final_train_loss": latest["train_loss"],
            "final_train_perplexity": latest["train_perplexity"],
            "best_val_loss": min(val_losses) if val_losses else None,
            "latest_val_loss": val_losses[-1] if val_losses else None,
            "overfitting_warnings_count": len(self.overfitting_warnings),
            "metrics_log_file": str(self.metrics_file),
        }
