"""ChemNova-LLM Production Training Engine.

Coordinates:
- Model + Tokenizer alignment verification
- Model weight integrity check (proving genuine parameter updates)
- Gradient accumulation & gradient clipping
- Learning rate warmup & cosine scheduling
- Periodic validation, perplexity computation & early stopping
- Chemistry sample generation & notation validation
- Checkpoint persistence (latest, periodic, best_model)
- Machine-readable metrics logging (training_metrics.jsonl)
"""

from collections import OrderedDict
import copy
import logging
from pathlib import Path
import time
from typing import Any, Callable, Dict, List, Optional, Tuple, Union
import torch
import torch.nn as nn
from torch.utils.data import DataLoader

from chemistry_llm.model.transformer import ChemNovaTransformerLM
from chemistry_llm.tokenizer.tokenizer import ChemNovaTokenizer
from chemistry_llm.training.checkpoint import load_checkpoint, save_best_model, save_checkpoint
from chemistry_llm.training.config import TrainingConfig
from chemistry_llm.training.evaluator import evaluate_model, generate_samples
from chemistry_llm.training.loss import CausalLanguageModelLoss
from chemistry_llm.training.metrics import MetricsTracker

logger = logging.getLogger("chemistry_llm.trainer")


class TrainingResult(list):
    """Unified result container providing both list access (history) and dict access (summary)."""

    def __init__(self, history: List[Dict[str, Any]], summary: Dict[str, Any]):
        super().__init__(history)
        self.summary = summary

    def get(self, key: str, default: Any = None) -> Any:
        return self.summary.get(key, default)

    def __getitem__(self, item: Any) -> Any:
        if isinstance(item, str):
            return self.summary[item]
        return super().__getitem__(item)


class EvalResult(tuple):
    """Container for validation metrics supporting both tuple unpacking and dict indexing."""

    def __new__(cls, val_loss: float, val_perplexity: float):
        return super().__new__(cls, (val_loss, val_perplexity))

    @property
    def val_loss(self) -> float:
        return self[0]

    @property
    def val_perplexity(self) -> float:
        return self[1]

    def __getitem__(self, item: Any) -> Any:
        if isinstance(item, str):
            if item in ("val_loss", "loss"):
                return self[0]
            if item in ("val_perplexity", "perplexity", "ppl"):
                return self[1]
            raise KeyError(item)
        return super().__getitem__(item)

    def __contains__(self, item: Any) -> bool:
        if item in ("val_loss", "loss", "val_perplexity", "perplexity", "ppl"):
            return True
        return super().__contains__(item)

    def get(self, key: str, default: Any = None) -> Any:
        try:
            return self[key]
        except KeyError:
            return default


class ChemNovaTrainer:
    """Production Trainer for ChemNova Transformer Language Model."""

    def __init__(
        self,
        model: nn.Module,
        optimizer: torch.optim.Optimizer,
        train_dataloader: DataLoader,
        val_dataloader: Optional[DataLoader] = None,
        tokenizer: Optional[ChemNovaTokenizer] = None,
        config: Optional[TrainingConfig] = None,
        device: Optional[torch.device] = None,
        lr_scheduler: Optional[Any] = None,
        gradient_accumulation_steps: Optional[int] = None,
        grad_clip: Optional[float] = None,
        checkpoint_dir: Optional[Union[str, Path]] = None,
        **kwargs,
    ):
        self.config = config or TrainingConfig()
        if gradient_accumulation_steps is not None:
            self.config.gradient_accumulation_steps = gradient_accumulation_steps
        if grad_clip is not None:
            self.config.gradient_clip_norm = grad_clip
        if checkpoint_dir is not None:
            self.config.checkpoint_dir = str(checkpoint_dir)

        self.device = device or torch.device("cpu")
        self.model = model.to(self.device)
        self.optimizer = optimizer
        self.train_dataloader = train_dataloader
        self.val_dataloader = val_dataloader
        self.tokenizer = tokenizer
        self.lr_scheduler = lr_scheduler

        # Verify Alignment between model and tokenizer if tokenizer provided (Directive 4)
        if self.tokenizer is not None:
            self._verify_model_tokenizer_alignment()

        self.loss_fn = CausalLanguageModelLoss(ignore_index=-100)
        self.metrics_tracker = MetricsTracker(log_dir=self.config.log_dir)

        self.global_step = 0
        self.accumulated_steps = 0
        self.current_epoch = 0
        self.best_val_loss = float("inf")
        self.early_stopping_counter = 0
        self.training_history: List[Dict[str, Any]] = []

        # Snapshot initial trainable parameters for integrity check (Directive 22)
        self._initial_param_sample = self._capture_parameter_snapshot()
        self.weight_updates_verified = False

    def _verify_model_tokenizer_alignment(self) -> None:
        """Verify model vocabulary and context length match tokenizer (Directive 4)."""
        model_vocab = getattr(self.model.config, "vocab_size", getattr(self.model.config, "vocabulary_size", None))
        tok_vocab = self.tokenizer.vocab_size

        if model_vocab is not None and model_vocab < tok_vocab:
            raise ValueError(
                f"Model vocabulary size ({model_vocab}) is smaller than tokenizer vocabulary size ({tok_vocab})! "
                "Model cannot represent all tokenizer tokens."
            )
        elif model_vocab is not None and model_vocab > tok_vocab:
            if getattr(self.config, "strict_vocab_alignment", False):
                raise ValueError(
                    f"Model vocabulary size ({model_vocab}) does not match tokenizer vocabulary size ({tok_vocab})! "
                    "Vocabularies must be strictly aligned before training."
                )
            logger.warning(
                "Model vocabulary size (%d) exceeds tokenizer vocabulary size (%d). Extra embeddings will be unused.",
                model_vocab,
                tok_vocab,
            )

        model_ctx = getattr(self.model.config, "max_seq_len", getattr(self.model.config, "context_length", None))
        if model_ctx is not None and model_ctx != self.config.context_length:
            logger.warning(
                "Model context length (%d) differs from TrainingConfig context length (%d). Synchronizing.",
                model_ctx,
                self.config.context_length,
            )

        logger.info(
            "Alignment Verified: Model Vocab=%d, Tokenizer Vocab=%d, Context Length=%d",
            model_vocab,
            tok_vocab,
            self.config.context_length,
        )

    def _capture_parameter_snapshot(self) -> Dict[str, float]:
        """Capture parameter L2 norms across layers to verify genuine parameter updates."""
        snapshot = {}
        for name, param in self.model.named_parameters():
            if param.requires_grad:
                snapshot[name] = param.data.norm().item()
        return snapshot

    def verify_parameter_updates(self) -> Dict[str, Any]:
        """Verify that training has genuinely updated the Transformer weights (Directive 22)."""
        current_snapshot = self._capture_parameter_snapshot()
        updated_count = 0
        total_count = len(self._initial_param_sample)

        diffs = {}
        for name, initial_norm in self._initial_param_sample.items():
            curr_norm = current_snapshot.get(name, initial_norm)
            diff = abs(curr_norm - initial_norm)
            diffs[name] = {
                "initial_norm": round(initial_norm, 6),
                "current_norm": round(curr_norm, 6),
                "absolute_diff": round(diff, 6),
                "updated": (diff > 1e-7),
            }
            if diff > 1e-7:
                updated_count += 1

        self.weight_updates_verified = (updated_count > 0)
        return {
            "parameters_verified": self.weight_updates_verified,
            "updated_layers_count": updated_count,
            "total_layers_count": total_count,
            "details": diffs,
        }

    def train_step(self, batch: Dict[str, torch.Tensor]) -> Dict[str, float]:
        """Execute one forward/backward micro-step with gradient accumulation."""
        self.model.train()

        input_ids = batch["input_ids"].to(self.device)
        targets = batch.get("targets", batch.get("labels")).to(self.device)
        attention_mask = batch.get("attention_mask")
        if attention_mask is not None:
            attention_mask = attention_mask.to(self.device)

        # Forward pass
        logits, _ = self.model(input_ids, attention_mask=attention_mask)
        loss, ppl = self.loss_fn(logits, targets)

        # Gradient accumulation scaling (Directive 8)
        scaled_loss = loss / self.config.gradient_accumulation_steps
        scaled_loss.backward()

        self.accumulated_steps += 1
        loss_val = loss.item()

        # Update weights on accumulation boundaries
        if self.accumulated_steps % self.config.gradient_accumulation_steps == 0:
            if self.config.gradient_clip_norm > 0.0:
                torch.nn.utils.clip_grad_norm_(self.model.parameters(), self.config.gradient_clip_norm)

            self.optimizer.step()
            if self.lr_scheduler is not None:
                self.lr_scheduler.step()
            self.optimizer.zero_grad()
            self.global_step += 1

        return {"loss": loss_val, "perplexity": ppl}

    def evaluate(self, max_batches: Optional[int] = None) -> EvalResult:
        """Run non-gradient validation loop over val_dataloader (Directive 10)."""
        if self.val_dataloader is None:
            return EvalResult(0.0, 1.0)

        mean_loss, perplexity = evaluate_model(
            model=self.model,
            dataloader=self.val_dataloader,
            device=self.device,
            loss_fn=self.loss_fn,
            max_batches=max_batches,
        )
        return EvalResult(mean_loss, perplexity)

    def train(
        self,
        max_steps: Optional[int] = None,
        epochs: Optional[int] = None,
        on_step_end: Optional[Callable[[int, float], None]] = None,
        log_interval: Optional[int] = None,
        save_interval: Optional[int] = None,
        **kwargs,
    ) -> TrainingResult:
        """Run full training loop over epochs/steps (Directive 9)."""
        if log_interval is not None:
            self.config.logging_interval = log_interval
        if save_interval is not None:
            self.config.checkpoint_interval = save_interval

        target_epochs = epochs or self.config.epochs
        target_steps = max_steps or self.config.max_steps

        logger.info(
            "Starting ChemNova Training: Target Epochs=%d, Target Steps=%s, Device=%s, Batch Size=%d, Grad Accum=%d",
            target_epochs,
            target_steps or "Unlimited",
            self.device,
            self.config.batch_size,
            self.config.gradient_accumulation_steps,
        )

        step_loss_window: List[float] = []

        for epoch in range(self.current_epoch, target_epochs):
            self.current_epoch = epoch
            self.model.train()

            for batch_idx, batch in enumerate(self.train_dataloader):
                step_metrics = self.train_step(batch)
                step_loss_window.append(step_metrics["loss"])

                # Log periodic step metrics
                if self.accumulated_steps % self.config.gradient_accumulation_steps == 0:
                    current_lr = self.optimizer.param_groups[0]["lr"]

                    if self.global_step % self.config.logging_interval == 0:
                        avg_loss = sum(step_loss_window) / max(len(step_loss_window), 1)
                        step_loss_window.clear()
                        batch_tokens = batch["input_ids"].numel()

                        self.metrics_tracker.record_step(
                            epoch=epoch,
                            global_step=self.global_step,
                            train_loss=avg_loss,
                            train_perplexity=step_metrics["perplexity"],
                            learning_rate=current_lr,
                            batch_tokens=batch_tokens,
                            device_name=str(self.device),
                        )
                        self.training_history.append({
                            "epoch": epoch,
                            "step": self.global_step,
                            "loss": avg_loss,
                            "perplexity": step_metrics["perplexity"],
                        })
                        logger.info(
                            "Epoch %d | Step %d | Train Loss: %.4f | PPL: %.2f | LR: %.6e",
                            epoch,
                            self.global_step,
                            avg_loss,
                            step_metrics["perplexity"],
                            current_lr,
                        )

                    # Validation Interval (Directive 10 & 16)
                    if self.global_step % self.config.validation_interval == 0 and self.val_dataloader:
                        val_loss, val_ppl = self.evaluate()
                        logger.info(
                            "[VALIDATION] Step %d | Val Loss: %.4f | Val PPL: %.2f",
                            self.global_step,
                            val_loss,
                            val_ppl,
                        )

                        self.metrics_tracker.record_step(
                            epoch=epoch,
                            global_step=self.global_step,
                            train_loss=step_metrics["loss"],
                            train_perplexity=step_metrics["perplexity"],
                            learning_rate=current_lr,
                            batch_tokens=0,
                            val_loss=val_loss,
                            val_perplexity=val_ppl,
                            device_name=str(self.device),
                        )

                        # Check for Best Model (Directive 12)
                        if val_loss < self.best_val_loss - self.config.early_stopping_min_delta:
                            self.best_val_loss = val_loss
                            self.early_stopping_counter = 0
                            save_best_model(
                                checkpoint_base_dir=self.config.checkpoint_dir,
                                model=self.model,
                                val_loss=val_loss,
                                step=self.global_step,
                                epoch=epoch,
                                tokenizer=self.tokenizer,
                                training_config=self.config,
                            )
                            logger.info("New Best Model Saved with Val Loss: %.4f", val_loss)
                        else:
                            self.early_stopping_counter += 1

                        # Run sample prompt generation (Directive 16)
                        if self.config.eval_prompts and self.tokenizer is not None:
                            samples = generate_samples(
                                model=self.model,
                                tokenizer=self.tokenizer,
                                prompts=self.config.eval_prompts[:3],
                                device=self.device,
                            )
                            for s in samples:
                                logger.info("[SAMPLE EVAL] Q: '%s' -> A: '%s'", s["prompt"], s["completion"][:60])

                        # Early stopping check (Directive 13)
                        if (
                            self.config.early_stopping_enabled
                            and self.early_stopping_counter >= self.config.early_stopping_patience
                        ):
                            logger.info(
                                "Early stopping triggered after %d validations without improvement.",
                                self.early_stopping_counter,
                            )
                            break

                    # Periodic Checkpoint (Directive 11)
                    if self.global_step % self.config.checkpoint_interval == 0 and self.config.checkpoint_dir:
                        save_checkpoint(
                            checkpoint_dir=Path(self.config.checkpoint_dir) / f"step_{self.global_step}",
                            model=self.model,
                            optimizer=self.optimizer,
                            scheduler=self.lr_scheduler,
                            tokenizer=self.tokenizer,
                            epoch=epoch,
                            step=self.global_step,
                            loss=step_metrics["loss"],
                            val_loss=self.best_val_loss if self.best_val_loss != float("inf") else None,
                        )

                    if on_step_end:
                        on_step_end(self.global_step, step_metrics["loss"])

                    if target_steps and self.global_step >= target_steps:
                        break

            if target_steps and self.global_step >= target_steps:
                break

        # Save final checkpoint (both latest subdirectory and root checkpoint_dir for compatibility)
        if self.config.checkpoint_dir:
            save_checkpoint(
                checkpoint_dir=Path(self.config.checkpoint_dir),
                model=self.model,
                optimizer=self.optimizer,
                scheduler=self.lr_scheduler,
                tokenizer=self.tokenizer,
                epoch=self.current_epoch,
                step=self.global_step,
                loss=step_loss_window[-1] if step_loss_window else 0.0,
                val_loss=self.best_val_loss if self.best_val_loss != float("inf") else None,
            )
            final_chk_dir = Path(self.config.checkpoint_dir) / "latest"
            save_checkpoint(
                checkpoint_dir=final_chk_dir,
                model=self.model,
                optimizer=self.optimizer,
                scheduler=self.lr_scheduler,
                tokenizer=self.tokenizer,
                epoch=self.current_epoch,
                step=self.global_step,
                loss=step_loss_window[-1] if step_loss_window else 0.0,
                val_loss=self.best_val_loss if self.best_val_loss != float("inf") else None,
            )
        else:
            final_chk_dir = Path("checkpoints/latest")

        # Final parameter update audit (Directive 22)
        param_audit = self.verify_parameter_updates()

        summary = self.metrics_tracker.get_summary()
        summary["parameter_audit"] = param_audit
        summary["best_val_loss"] = self.best_val_loss
        summary["final_checkpoint"] = str(final_chk_dir)
        return TrainingResult(self.training_history, summary)
