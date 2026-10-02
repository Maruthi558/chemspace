# ChemNova-LLM: From-Scratch Trainable Transformer Language Model

## 1. What is ChemNova-LLM?

**ChemNova-LLM** is an empty, trainable decoder-only Transformer language model built entirely from scratch in PyTorch for the ChemNova scientific AI platform.

### Critical Architecture Guarantees
- **Zero Pretrained Model Imports:** ChemNova-LLM does **NOT** import, wrap, or download weights from OpenAI, OpenRouter, Gemini, Claude, Qwen, Llama, Mistral, or HuggingFace pretrained checkpoints.
- **Genuine Neural Network Architecture:** Contains real, initialized PyTorch neural network parameters (embeddings, multi-head attention projections, feed-forward linear layers, and normalization modules) ready for pretraining.
- **Strictly Isolated & Self-Hosted:** All computation, tokenization, training loops, inference sampling, and API serving run locally with zero network calls to external AI providers.
- **Current Status (Step 1):** The model is an **EMPTY / TRAINABLE BRAIN**. It has not been trained on real chemistry data yet; therefore, its current outputs are randomly initialized token sequences as expected before domain pretraining.

---

## 2. Directory Structure

```text
chemistry_llm/
│
├── config/
│   ├── __init__.py
│   ├── model_config.py            # ChemNovaModelConfig architecture dataclass
│   └── settings.py                # Environment-driven global configuration
│
├── tokenizer/
│   ├── __init__.py
│   ├── special_tokens.py          # <PAD>, <UNK>, <BOS>, <EOS>, <MASK>, etc.
│   ├── vocabulary.py              # Trainable Vocabulary container & symbol base
│   └── tokenizer.py               # ChemNovaTokenizer with scientific regex & fallback
│
├── model/
│   ├── __init__.py
│   ├── embeddings.py              # Token and Positional Embeddings
│   ├── attention.py               # Causal Multi-Head Self-Attention
│   ├── feed_forward.py            # Position-wise Feed-Forward Network
│   ├── normalization.py          # LayerNorm and RMSNorm modules
│   ├── transformer_block.py       # Pre-norm Transformer Block with residuals
│   ├── transformer.py             # Transformer backbone and ChemNovaTransformerLM
│   ├── language_model.py          # ChemNovaLanguageModel wrapper
│   └── inspect.py                 # Parameter inspection reporting CLI
│
├── training/
│   ├── __init__.py
│   ├── dataset.py                 # CausalLMDataset and SyntheticDummyDataset
│   ├── dataloader.py              # Collate functions and DataLoader factory
│   ├── loss.py                    # CausalLanguageModelLoss & perplexity
│   ├── optimizer.py               # AdamW weight-decay grouping & LR schedulers
│   ├── checkpoint.py              # Checkpoint saving and loading
│   └── trainer.py                 # ChemNovaTrainer with gradient accumulation & eval
│
├── inference/
│   ├── __init__.py
│   ├── generate.py                # Autoregressive sampling (top-k, top-p, temp, penalty)
│   └── inference_engine.py        # ChemNovaInferenceEngine local execution
│
├── api/
│   ├── __init__.py
│   ├── server.py                  # Standalone FastAPI server: /api/llm/generate & health
│   ├── routes.py                  # ChemSpace mounted router
│   └── schemas.py                 # Pydantic schemas
│
├── checkpoints/                   # Checkpoint storage (includes base_initial/)
│   └── base_initial/              # Initialized empty base checkpoint & config
│
├── data/                          # Data store for future chemistry corpus
│
├── tests/                         # Automated unit & integration test suite
│   ├── test_step1_foundation.py   # Comprehensive 14-point foundation test suite
│   ├── test_model.py              # Architecture and forward pass tests
│   ├── test_tokenizer.py          # Tokenization and decoding tests
│   ├── test_api.py                # REST API tests
│   └── test_conversation.py       # Context window memory tests
│
└── README.md                      # This documentation
```

---

## 3. Transformer Architecture

ChemNova-LLM implements a modern decoder-only causal Transformer architecture:

1. **Token Embeddings (`embeddings.py`):** Maps integer token IDs from `vocabulary_size` to `embedding_dimension` ($d_{\text{model}}$).
2. **Positional Embeddings (`embeddings.py`):** Learned positional representations up to `context_length`.
3. **Causal Multi-Head Self-Attention (`attention.py`):**
   - Linear projections for Query, Key, and Value ($3 \times d_{\text{model}}$).
   - Multi-head partitioning ($n_{\text{heads}}$ heads with $d_{\text{head}} = d_{\text{model}} / n_{\text{heads}}$).
   - Scaled dot-product attention: $\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_{\text{head}}}} + M\right)V$.
   - Lower-triangular causal attention mask $M$ preventing attending to future tokens.
4. **Position-wise Feed-Forward Network (`feed_forward.py`):**
   - Two-layer projection: $d_{\text{model}} \rightarrow d_{\text{ff}} \rightarrow d_{\text{model}}$ with GELU activation and dropout.
5. **Normalization (`normalization.py`):**
   - Configurable Layer Normalization or RMSNorm ($x / \sqrt{\text{mean}(x^2) + \epsilon}$).
   - Pre-normalization architecture inside each Transformer block.
6. **Residual Connections (`transformer_block.py`):**
   - $x = x + \text{Attention}(\text{Norm}_1(x))$
   - $x = x + \text{FFN}(\text{Norm}_2(x))$
7. **Final Normalization & Language Model Head (`transformer.py`):**
   - Final normalization layer prior to output projection.
   - Linear LM head projecting $d_{\text{model}} \rightarrow \text{vocabulary\_size}$.
   - Weight tying: LM head projection matrix shares weights with token embedding matrix.

### Small Model Hyperparameters (Local Development Baseline)
| Hyperparameter | Value | Config Field |
| :--- | :--- | :--- |
| **Model Name** | `ChemNova-LLM` | `model_name` |
| **Vocabulary Size** | 4,096 | `vocabulary_size` (`vocab_size`) |
| **Context Length** | 512 tokens | `context_length` (`max_seq_len`) |
| **Embedding Dimension ($d_{\text{model}}$)** | 128 | `embedding_dimension` (`d_model`) |
| **Layers ($N$)** | 4 | `number_of_layers` (`n_layers`) |
| **Attention Heads** | 4 | `number_of_attention_heads` (`n_heads`) |
| **Head Dimension** | 32 | $d_{\text{model}} / n_{\text{heads}}$ |
| **Feed-Forward Dimension ($d_{\text{ff}}$)** | 512 | `feed_forward_dimension` (`d_ff`) |
| **Total Trainable Parameters** | 1,378,560 (~1.38M) | Computed |
| **Weight Tying** | True | `tie_weights` |
| **Normalization** | LayerNorm | `normalization_type` |
| **Compute Device** | Auto (CUDA if available, else CPU) | `device` |

---

## 4. Trainable Tokenizer Foundation

The tokenizer is designed to be **initializable and retrainable**:
- **Special Tokens:** `<PAD>` (0), `<UNK>` (1), `<BOS>` (2), `<EOS>` (3), `<USER>` (4), `<ASSISTANT>` (5), `<CHEMISTRY>` (6), `<MASK>` (7).
- **Domain Syntax Coverage:**
  - Standard English characters and punctuation.
  - Periodic table elements (H through Og, 1–118).
  - Greek letters for thermodynamics and spectroscopy ($\alpha, \beta, \gamma, \Delta, \lambda, \mu, \pi, \sigma, \omega$, etc.).
  - Chemical and mathematical symbols ($°, \pm, \times, \div, \rightarrow, \rightleftharpoons, \cdot, \text{Å}, \partial, \approx, \le, \ge$, superscripts, subscripts).
  - Scientific units ($\text{g/mol}, \text{mol/L}, \text{kJ/mol}, \text{cm}^{-1}, \text{ppm}, \text{nm}, \text{kPa}, \text{atm}, \text{Torr}$).
  - Scientific notation numbers ($6.022\times 10^{23}, 1.23\text{e-}4, 18.015, -42$).
  - Bracketed SMILES and ions ($[\text{C@@H}], [\text{Fe}^{+2}], [\text{NH}_4^+], [\text{O}^-]$).
  - Alphanumeric chemical formulas ($\text{H}_2\text{O}, \text{CO}_2, \text{C}_6\text{H}_{12}\text{O}_6, \text{NaCl}$).
- **No Hardcoded Answers:** Contains vocabulary building blocks only; no question-answer pairs or hardcoded text are embedded into the tokenizer.
- **Corpus Retraining:** `tokenizer.train_from_corpus(texts, min_frequency, max_vocab_size)` allows full vocabulary retraining from future chemical corpora.

---

## 5. Training Pipeline Foundation

The training pipeline provides all infrastructure needed to train the model from scratch:

```text
TEXT DATA / CORPUS
        │
        ▼
   TOKENIZATION (ChemNovaTokenizer)
        │
        ▼
    TOKEN IDS (Fixed-length windows: x = seq[:-1], y = seq[1:])
        │
        ▼
    BATCHING (create_dataloader with collate_fn_pad)
        │
        ▼
   FORWARD PASS (ChemNovaLanguageModel)
        │
        ▼
NEXT-TOKEN PREDICTION & LOGITS
        │
        ▼
CAUSAL LM LOSS (CrossEntropyLoss with PAD token masking & Perplexity)
        │
        ▼
BACKPROPAGATION (loss.backward() + gradient clipping)
        │
        ▼
OPTIMIZER STEP (AdamW with weight decay separation + Gradient Accumulation)
        │
        ▼
CHECKPOINTING (save_checkpoint: weights, config, tokenizer, metadata)
```

### Key Training Features
- **Gradient Accumulation:** Supports training with effective batch sizes larger than memory limits via `gradient_accumulation_steps`.
- **Weight Decay Separation:** Projection weights ($\ge 2\text{D}$) receive weight decay; biases and 1D normalization weights receive 0 decay.
- **Validation Hooks:** `trainer.evaluate()` computes validation loss and perplexity across held-out sets.
- **Synthetic Testing:** `SyntheticDummyDataset` enables fast mathematical verification of the training loop without requiring domain data.

---

## 6. Inference Engine

The local inference engine (`ChemNovaInferenceEngine` and `generate_tokens`) executes autoregressive decoding locally:

$$\text{Input Text} \rightarrow \text{Token IDs} \rightarrow \text{Transformer} \rightarrow \text{Logits} \rightarrow \text{Sampling} \rightarrow \text{Decoded Text}$$

### Supported Generation Parameters
- `max_new_tokens`: Maximum tokens to generate (default: 64).
- `temperature`: Softmax sharpness ($T \le 0.01$ activates greedy argmax; higher values increase diversity).
- `top_k`: Filters sampling to the top $k$ highest-probability tokens.
- `top_p`: Nucleus sampling cutoff (retains tokens forming cumulative probability mass $\le p$).
- `repetition_penalty`: Penalizes previously generated tokens to prevent degeneration loops.

---

## 7. REST API Endpoints

FastAPI server located in `chemistry_llm/api/server.py`:

### `POST /api/llm/generate`
**Request:**
```json
{
  "prompt": "Hello",
  "max_new_tokens": 64,
  "temperature": 0.7,
  "top_k": 50,
  "top_p": 0.9,
  "repetition_penalty": 1.1
}
```
**Response:**
```json
{
  "text": "...",
  "model": "ChemNova-LLM",
  "local": true,
  "prompt": "Hello"
}
```

### `GET /api/llm/health`
**Response:**
```json
{
  "status": "healthy",
  "model_initialized": true,
  "tokenizer_initialized": true,
  "device": "cpu",
  "checkpoint_status": "loaded",
  "model_parameter_count": 1378560,
  "training_status": "ready",
  "model": "ChemNova-LLM",
  "local": true
}
```

---

## 8. Checkpoint System

Checkpoints are stored under `chemistry_llm/checkpoints/` containing:
- `checkpoint.pt`: PyTorch weights (`model_state_dict`, `optimizer_state_dict`, epoch, step, loss).
- `config.json`: Complete architecture hyperparameters.
- `tokenizer_config.json`: Special tokens, token IDs, and vocab metadata.
- `vocab.json`: Token-to-ID vocabulary dictionary.
- `metadata.json`: Model name, version, parameter counts, and timestamp.

---

## 9. Verification & CLI Commands

### Inspect Model Parameters
```bash
python -m chemistry_llm.model.inspect
```

### Run Unit & Integration Tests
```bash
python -m unittest discover -s chemistry_llm/tests -v
```

### Run Step 1 Foundation Verification Test Suite
```bash
python -m unittest chemistry_llm/tests/test_step1_foundation.py -v
```

### Start API Server Standalone
```bash
python -m uvicorn chemistry_llm.api.server:app --port 8001
```

---

## 10. Future Chemistry Data Pipeline Compatibility

The Step 1 architecture is engineered so subsequent steps can connect seamlessly:

```text
Future Chemistry Corpus (Textbooks, Open-Access Literature, SMILES)
                │
                ▼
     Tokenizer Retraining (tokenizer.train_from_corpus)
                │
                ▼
    Tokenized Chemistry Dataset (ChemistryTextDataset)
                │
                ▼
      Domain Pretraining (ChemNovaTrainer)
                │
                ▼
     ChemNova-LLM Base Checkpoint (checkpoints/)
                │
                ▼
   Chemistry Instruction Fine-Tuning
                │
                ▼
    Reasoning / Q&A Evaluation
                │
                ▼
   Integration with ChemSpace Tools (ChemDraw, RDKit, Spectroscopy, IBM RXN)
```
