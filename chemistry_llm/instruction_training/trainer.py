"""ChemNova Instruction Fine-Tuning Trainer for Step 6.

Supervised Fine-Tuning (SFT) over chemistry questions, explanations,
calculations, reactions, spectroscopy, and safety with response loss masking.
"""

from collections import OrderedDict
import copy
import json
import logging
import math
from pathlib import Path
import time
from typing import Any, Callable, Dict, List, Optional, Tuple, Union

import torch
import torch.nn as nn
from torch.utils.data import DataLoader

from chemistry_llm.model.config import ChemNovaModelConfig
from chemistry_llm.model.transformer import ChemNovaTransformerLM
from chemistry_llm.instruction_training.config import InstructionTrainingConfig
from chemistry_llm.tokenizer.tokenizer import ChemNovaTokenizer
from chemistry_llm.training.checkpoint import load_checkpoint, save_checkpoint
from chemistry_llm.training.hardware import detect_hardware

logger = logging.getLogger("chemistry_llm.instruction_trainer")


class ChemNovaInstructionTrainer:
    """Supervised Instruction Fine-Tuning Engine for ChemNova-LLM."""

    def __init__(
        self,
        config: InstructionTrainingConfig,
        train_dataloader: DataLoader,
        val_dataloader: Optional[DataLoader] = None,
        tokenizer: Optional[ChemNovaTokenizer] = None,
        model: Optional[ChemNovaTransformerLM] = None,
        device: Optional[str] = None,
    ):
        self.config = config
        self.train_dataloader = train_dataloader
        self.val_dataloader = val_dataloader
        self.tokenizer = tokenizer or ChemNovaTokenizer()

        target_dev = device or detect_hardware(config.device)["device"]
        self.device = torch.device(target_dev)

        # 1. Initialize Model
        if model is not None:
            self.model = model.to(self.device)
        else:
            self.model = self._initialize_from_step5(config.base_checkpoint_dir).to(self.device)

        # 2. Record initial parameter weights for audit
        self._initial_param_norms = self._capture_parameter_norms()

        # 3. Configure Optimizer
        self.optimizer = torch.optim.AdamW(
            self.model.parameters(),
            lr=config.learning_rate,
            weight_decay=config.weight_decay,
            betas=(config.beta1, config.beta2),
            eps=config.epsilon,
        )

        # 4. Learning Rate Scheduler (Linear Warmup + Cosine Decay)
        self.lr_scheduler = None
        self._setup_scheduler()

        # 5. Tracking State
        self.global_step = 0
        self.current_epoch = 0
        self.best_val_loss = float("inf")
        self.early_stopping_counter = 0
        self.training_history: List[Dict[str, Any]] = []

        Path(self.config.checkpoint_dir).mkdir(parents=True, exist_ok=True)
        Path(self.config.log_dir).mkdir(parents=True, exist_ok=True)

    def _initialize_from_step5(self, base_checkpoint_dir: Union[str, Path]) -> ChemNovaTransformerLM:
        """Load pretrained weights from Step 5 best checkpoint."""
        base_dir = Path(base_checkpoint_dir)
        cfg = ChemNovaModelConfig(
            vocabulary_size=self.tokenizer.vocab_size,
            context_length=self.config.max_length,
            embedding_dimension=128,
            number_of_layers=4,
            number_of_attention_heads=4,
            feed_forward_dimension=512,
        )
        model = ChemNovaTransformerLM(cfg)

        logger.info("Initializing Instruction Model from Step 5 checkpoint: %s", base_dir)
        load_checkpoint(base_dir, model=model, device=self.device)
        return model

    def _capture_parameter_norms(self) -> Dict[str, float]:
        """Capture L2 norms of all trainable parameter groups."""
        return {name: p.detach().norm().item() for name, p in self.model.named_parameters() if p.requires_grad}

    def verify_parameter_updates(self) -> Dict[str, Any]:
        """Verify that training actually modified model weights."""
        current_norms = self._capture_parameter_norms()
        updated_count = 0
        details = {}

        for name, init_norm in self._initial_param_norms.items():
            curr_norm = current_norms.get(name, 0.0)
            diff = abs(curr_norm - init_norm)
            changed = diff > 1e-7
            if changed:
                updated_count += 1
            details[name] = {
                "initial_norm": init_norm,
                "current_norm": curr_norm,
                "difference": diff,
                "updated": changed,
            }

        total_groups = len(self._initial_param_norms)
        has_updated = updated_count > 0
        logger.info(
            "Instruction parameter update verification: %d/%d parameter groups modified (Status: %s)",
            updated_count,
            total_groups,
            "SUCCESS" if has_updated else "NO_UPDATES",
        )
        return {
            "all_updated": updated_count == total_groups,
            "updated_count": updated_count,
            "total_groups": total_groups,
            "details": details,
        }

    def _setup_scheduler(self) -> None:
        """Configure cosine annealing with linear warmup."""
        total_steps = self.config.max_steps or (len(self.train_dataloader) * self.config.epochs)
        warmup_steps = self.config.warmup_steps

        def lr_lambda(current_step: int) -> float:
            if current_step < warmup_steps:
                return float(current_step) / float(max(1, warmup_steps))
            progress = float(current_step - warmup_steps) / float(max(1, total_steps - warmup_steps))
            cosine_decay = 0.5 * (1.0 + math.cos(math.pi * progress))
            min_ratio = self.config.min_learning_rate / self.config.learning_rate
            return max(min_ratio, min_ratio + (1.0 - min_ratio) * cosine_decay)

        self.lr_scheduler = torch.optim.lr_scheduler.LambdaLR(self.optimizer, lr_lambda=lr_lambda)

    def evaluate(self) -> Tuple[float, float]:
        """Evaluate model on validation split (loss & perplexity)."""
        if self.val_dataloader is None:
            return 0.0, 1.0

        self.model.eval()
        total_loss = 0.0
        total_batches = 0

        loss_fn = nn.CrossEntropyLoss(ignore_index=-100)

        with torch.no_grad():
            for batch in self.val_dataloader:
                input_ids = batch["input_ids"].to(self.device)
                targets = batch["labels"].to(self.device)

                logits, _ = self.model(input_ids)
                shift_logits = logits.view(-1, logits.size(-1))
                shift_targets = targets.view(-1)

                loss = loss_fn(shift_logits, shift_targets)
                if not torch.isnan(loss) and not torch.isinf(loss):
                    total_loss += loss.item()
                    total_batches += 1

        mean_loss = total_loss / max(1, total_batches)
        perplexity = math.exp(min(mean_loss, 100.0))
        self.model.train()
        return mean_loss, perplexity

    def train(self) -> Dict[str, Any]:
        """Execute full instruction fine-tuning loop."""
        logger.info(
            "Starting Instruction Fine-Tuning: Epochs=%d, Batch Size=%d, Grad Accum=%d, LR=%.6f",
            self.config.epochs,
            self.config.batch_size,
            self.config.gradient_accumulation_steps,
            self.config.learning_rate,
        )

        self.model.train()
        loss_fn = nn.CrossEntropyLoss(ignore_index=-100)
        metrics_log_file = Path(self.config.log_dir) / "instruction_training_metrics.jsonl"

        for epoch in range(self.config.epochs):
            self.current_epoch = epoch
            accum_loss = 0.0
            epoch_loss = 0.0
            epoch_steps = 0

            for batch_idx, batch in enumerate(self.train_dataloader):
                input_ids = batch["input_ids"].to(self.device)
                targets = batch["labels"].to(self.device)

                logits, _ = self.model(input_ids)
                shift_logits = logits.view(-1, logits.size(-1))
                shift_targets = targets.view(-1)

                loss = loss_fn(shift_logits, shift_targets)
                scaled_loss = loss / self.config.gradient_accumulation_steps
                scaled_loss.backward()

                accum_loss += scaled_loss.item()

                if (batch_idx + 1) % self.config.gradient_accumulation_steps == 0 or (batch_idx + 1) == len(self.train_dataloader):
                    # Gradient clipping
                    torch.nn.utils.clip_grad_norm_(self.model.parameters(), self.config.gradient_clip_norm)
                    self.optimizer.step()
                    if self.lr_scheduler is not None:
                        self.lr_scheduler.step()
                    self.optimizer.zero_grad()
                    self.global_step += 1

                    current_lr = self.optimizer.param_groups[0]["lr"]
                    step_loss = accum_loss * self.config.gradient_accumulation_steps
                    step_ppl = math.exp(min(step_loss, 100.0))
                    accum_loss = 0.0

                    epoch_loss += step_loss
                    epoch_steps += 1

                    # Logging
                    if self.global_step % self.config.logging_interval == 0:
                        logger.info(
                            "Epoch %d | Step %d | Instruction Loss: %.4f | PPL: %.2f | LR: %.6e",
                            epoch,
                            self.global_step,
                            step_loss,
                            step_ppl,
                            current_lr,
                        )
                        record = {
                            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                            "epoch": epoch,
                            "global_step": self.global_step,
                            "instruction_loss": step_loss,
                            "instruction_perplexity": step_ppl,
                            "learning_rate": current_lr,
                        }
                        self.training_history.append(record)
                        with open(metrics_log_file, "a", encoding="utf-8") as f:
                            f.write(json.dumps(record) + "\n")

                    # Validation
                    if self.global_step % self.config.validation_interval == 0 and self.val_dataloader is not None:
                        val_loss, val_ppl = self.evaluate()
                        logger.info(
                            "[VAL EVAL] Step %d | Val Loss: %.4f | Val PPL: %.2f",
                            self.global_step,
                            val_loss,
                            val_ppl,
                        )

                        if val_loss < self.best_val_loss:
                            self.best_val_loss = val_loss
                            best_dir = Path(self.config.checkpoint_dir) / "best_model"
                            save_checkpoint(
                                checkpoint_dir=best_dir,
                                model=self.model,
                                optimizer=self.optimizer,
                                scheduler=self.lr_scheduler,
                                tokenizer=self.tokenizer,
                                epoch=epoch,
                                step=self.global_step,
                                loss=step_loss,
                                val_loss=val_loss,
                            )
                            logger.info("[BEST MODEL] Saved new best instruction model (val_loss=%.4f) to %s", val_loss, best_dir)

            logger.info("Epoch %d Complete | Mean Loss: %.4f", epoch, epoch_loss / max(1, epoch_steps))

        # Save latest instruction checkpoint
        latest_dir = Path(self.config.checkpoint_dir) / "latest"
        save_checkpoint(
            checkpoint_dir=latest_dir,
            model=self.model,
            optimizer=self.optimizer,
            scheduler=self.lr_scheduler,
            tokenizer=self.tokenizer,
            epoch=self.current_epoch,
            step=self.global_step,
            loss=step_loss if 'step_loss' in locals() else 0.0,
            val_loss=self.best_val_loss if self.best_val_loss != float("inf") else None,
        )

        param_audit = self.verify_parameter_updates()

        return {
            "global_step": self.global_step,
            "best_val_loss": self.best_val_loss,
            "parameter_audit": param_audit,
            "latest_checkpoint": str(latest_dir),
            "best_checkpoint": str(Path(self.config.checkpoint_dir) / "best_model"),
        }
