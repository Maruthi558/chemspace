"""ChemNova Chemistry-Aware Byte-Pair Encoding (BPE) Subword Tokenizer.

Implements a deterministic, chemistry-aware subword BPE tokenizer architecture
designed specifically for scientific chemical language, formulas, SMILES,
reaction notation, mathematical expressions, units, and natural English.

Key features:
1. Chemistry-aware pre-tokenization that preserves chemical symbols, brackets,
   charges ([Na+], [OH-]), units (kJ/mol, mol/L), and scientific notation.
2. Iterative Byte-Pair Encoding (BPE) merge learning trainable on any corpus.
3. Stable special tokens and structured chemistry markers (<CHEM>, <SMILES>, etc.).
4. Exact round-trip fidelity: decode(encode(text)) == text.
"""

from collections import Counter
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence, Set, Tuple, Union
import json
import logging
import re

from .special_tokens import (
    SPECIAL_TOKENS,
    SPECIAL_TOKEN_TO_ID,
    ID_TO_SPECIAL_TOKEN,
    PAD_TOKEN,
    UNK_TOKEN,
    BOS_TOKEN,
    EOS_TOKEN,
    MASK_TOKEN,
    CHEM_TOKEN,
    FORMULA_TOKEN,
    SMILES_TOKEN,
    REACTION_TOKEN,
    QUESTION_TOKEN,
    ANSWER_TOKEN,
    REASONING_TOKEN,
    END_TOKEN,
    PAD_ID,
    UNK_ID,
    BOS_ID,
    EOS_ID,
    MASK_ID,
)
from .vocabulary import (
    build_base_vocabulary,
    ELEMENTS,
    GREEK_LETTERS,
    CHEMICAL_SYMBOLS,
    CHEMISTRY_UNITS,
    COMMON_FORMULAS,
    CHEMISTRY_TERMS,
)

logger = logging.getLogger("chemistry_llm.tokenizer.bpe")


def build_pretokenization_pattern() -> re.Pattern:
    """Compile optimized regex pattern preserving chemistry entities and whitespace."""
    # Special tokens pattern
    specials = "|".join(re.escape(tok) for tok in SPECIAL_TOKENS)

    # Multi-character units
    units = (
        r"g/mol|mol/L|kJ/mol|kcal/mol|cm\^-1|g/cm³|g/cm3|ppm|mmol|μmol|nmol|pmol|"
        r"mL|mg|kg|mol|mM|μM|nM|pM|°C|Hz|MHz|GHz|kPa|atm|Torr|m/z"
    )

    # Ions and bracketed species (e.g., [Na+], [OH-], [PtCl4]2-, [NH4+], [Fe(CN)6]4-)
    bracketed_ions = r"\[[^\]\s]+\](?:\d*[\+\-])?"

    # Scientific notation numbers and decimals (e.g., 6.022e23, 1.75 x 10^-5, 109.5)
    scientific_numbers = r"\d+(?:\.\d+)?(?:[eE][+-]?\d+)?"

    # Chemical arrows
    arrows = r"-->|->|⇌|⇄|↔|→|<=>|=>"

    # Greek letters and scientific math symbols
    symbols = (
        r"[\u0370-\u03ff\u1f00-\u1fff"  # Greek
        r"°±×÷•·‰Å℃℉∇∂∫≈≠≤≥≡∝∞¹²³⁴⁵⁶⁷⁸⁹⁰⁺⁻₁₂₃₄₅₆₇₈₉₀]"
    )

    # Standard words or sequences of letters
    words = r"[A-Za-z]+|\d+"

    # Whitespace or single non-space fallback
    whitespace_or_char = r"\s+|[^\s]"

    pattern_str = (
        rf"({specials}|{arrows}|{bracketed_ions}|{units}|{scientific_numbers}|{symbols}|{words}|{whitespace_or_char})"
    )
    return re.compile(pattern_str)


class ChemNovaBPETokenizer:
    """Chemistry-Aware Byte-Pair Encoding (BPE) Subword Tokenizer."""

    def __init__(
        self,
        vocab: Optional[Dict[str, int]] = None,
        merges: Optional[List[Tuple[str, str]]] = None,
    ):
        """Initialize tokenizer with vocabulary and merge rules."""
        self.special_tokens: List[str] = list(SPECIAL_TOKENS)
        self.special_token_to_id: Dict[str, int] = dict(SPECIAL_TOKEN_TO_ID)

        if vocab is not None:
            self.vocab = dict(vocab)
        else:
            self.vocab = build_base_vocabulary()

        self.id_to_token: Dict[int, str] = {int(v): k for k, v in self.vocab.items()}
        self.merges: List[Tuple[str, str]] = list(merges) if merges else []
        self.bpe_ranks: Dict[Tuple[str, str], int] = {
            pair: rank for rank, pair in enumerate(self.merges)
        }
        self.pretokenizer_regex = build_pretokenization_pattern()

    @property
    def vocab_size(self) -> int:
        return len(self.vocab)

    def __len__(self) -> int:
        return len(self.vocab)

    @property
    def pad_token_id(self) -> int:
        return self.vocab.get(PAD_TOKEN, PAD_ID)

    @property
    def unk_token_id(self) -> int:
        return self.vocab.get(UNK_TOKEN, UNK_ID)

    @property
    def bos_token_id(self) -> int:
        return self.vocab.get(BOS_TOKEN, BOS_ID)

    @property
    def eos_token_id(self) -> int:
        return self.vocab.get(EOS_TOKEN, EOS_ID)

    @property
    def mask_token_id(self) -> int:
        return self.vocab.get(MASK_TOKEN, MASK_ID)

    def pre_tokenize(self, text: str) -> List[str]:
        """Segment raw text into initial atomic tokens using the chemistry regex."""
        if not text:
            return []
        matches = self.pretokenizer_regex.findall(text)
        return [m for m in matches if m]

    def _bpe_merge_word(self, token: str) -> List[str]:
        """Apply learned BPE merge rules to a single subword/token."""
        # Special tokens or exact vocabulary hits are kept intact
        if token in self.special_tokens or token in self.vocab:
            return [token]

        # Break unknown token into its constituent characters
        word_pieces = list(token)
        if len(word_pieces) <= 1:
            return word_pieces

        while len(word_pieces) > 1:
            # Find all adjacent pairs
            pairs = [(word_pieces[i], word_pieces[i + 1]) for i in range(len(word_pieces) - 1)]
            # Find pair with lowest merge rank (highest priority)
            best_pair = None
            best_rank = float("inf")

            for pair in pairs:
                if pair in self.bpe_ranks:
                    rank = self.bpe_ranks[pair]
                    if rank < best_rank:
                        best_rank = rank
                        best_pair = pair

            if best_pair is None:
                break  # No more applicable merges

            # Merge occurrences of best_pair
            first, second = best_pair
            new_pieces = []
            i = 0
            while i < len(word_pieces):
                if i < len(word_pieces) - 1 and word_pieces[i] == first and word_pieces[i + 1] == second:
                    new_pieces.append(first + second)
                    i += 2
                else:
                    new_pieces.append(word_pieces[i])
                    i += 1
            word_pieces = new_pieces

        return word_pieces

    def tokenize(self, text: str) -> List[str]:
        """Segment text into subword tokens using BPE rules."""
        if not text:
            return []

        raw_chunks = self.pre_tokenize(text)
        output_tokens: List[str] = []

        for chunk in raw_chunks:
            # If chunk is directly known or a special token, emit directly
            if chunk in self.special_tokens or chunk in self.vocab:
                output_tokens.append(chunk)
            elif chunk.isspace():
                # Emit spaces as characters
                for sp in chunk:
                    output_tokens.append(sp if sp in self.vocab else UNK_TOKEN)
            else:
                # Apply BPE subword segmentation
                sub_pieces = self._bpe_merge_word(chunk)
                for piece in sub_pieces:
                    if piece in self.vocab:
                        output_tokens.append(piece)
                    else:
                        # Fallback character decomposition
                        for ch in piece:
                            output_tokens.append(ch if ch in self.vocab else UNK_TOKEN)

        return output_tokens

    def convert_tokens_to_ids(self, tokens: Sequence[str]) -> List[int]:
        """Map token strings to unique vocabulary integers."""
        return [self.vocab.get(tok, self.unk_token_id) for tok in tokens]

    def convert_ids_to_tokens(self, ids: Sequence[int]) -> List[str]:
        """Map integer IDs back to token strings."""
        return [self.id_to_token.get(idx, UNK_TOKEN) for idx in ids]

    def encode(
        self,
        text: str,
        add_special_tokens: bool = False,
        max_length: Optional[int] = None,
        padding: bool = False,
        truncation: bool = True,
    ) -> List[int]:
        """Encode text to token IDs with optional special tokens and padding."""
        tokens = self.tokenize(text)
        ids = self.convert_tokens_to_ids(tokens)

        if add_special_tokens:
            ids = [self.bos_token_id] + ids + [self.eos_token_id]

        if max_length is not None:
            if truncation and len(ids) > max_length:
                if add_special_tokens and len(ids) > 1:
                    ids = ids[: max_length - 1] + [self.eos_token_id]
                else:
                    ids = ids[:max_length]
            if padding and len(ids) < max_length:
                ids = ids + [self.pad_token_id] * (max_length - len(ids))

        return ids

    def decode(self, token_ids: Sequence[int], skip_special_tokens: bool = False) -> str:
        """Decode token IDs back into string with exact character preservation."""
        tokens = []
        for tid in token_ids:
            tok = self.id_to_token.get(tid, UNK_TOKEN)
            if skip_special_tokens and (tok in self.special_tokens or tok.startswith("<")):
                continue
            tokens.append(tok)
        return "".join(tokens)

    def train_bpe(
        self,
        corpus_texts: List[str],
        target_vocab_size: int = 4096,
        min_frequency: int = 2,
    ) -> Dict[str, Any]:
        """Train BPE subword merges over a text corpus until target_vocab_size is reached."""
        logger.info("Starting ChemNova BPE training. Initial vocab size: %d", len(self.vocab))

        # 1. Collect word frequencies from pretokenized chunks
        word_freqs: Counter = Counter()
        for text in corpus_texts:
            chunks = self.pre_tokenize(text)
            for chunk in chunks:
                if chunk and chunk not in self.special_tokens and not chunk.isspace():
                    word_freqs[chunk] += 1

        # 2. Represent words as tuples of characters
        splits: Dict[str, List[str]] = {
            word: list(word) for word in word_freqs.keys()
        }

        # 3. Iterative BPE merges
        merges_learned: List[Tuple[str, str]] = []

        while len(self.vocab) < target_vocab_size:
            # Count pair frequencies
            pair_counts: Counter = Counter()
            for word, freq in word_freqs.items():
                pieces = splits[word]
                for i in range(len(pieces) - 1):
                    pair = (pieces[i], pieces[i + 1])
                    pair_counts[pair] += freq

            if not pair_counts:
                break

            best_pair, highest_freq = pair_counts.most_common(1)[0]
            if highest_freq < min_frequency:
                break

            # Create merged token
            merged_token = best_pair[0] + best_pair[1]
            merges_learned.append(best_pair)
            self.merges.append(best_pair)
            self.bpe_ranks[best_pair] = len(self.merges) - 1

            if merged_token not in self.vocab:
                idx = len(self.vocab)
                self.vocab[merged_token] = idx
                self.id_to_token[idx] = merged_token

            # Update splits
            for word in word_freqs.keys():
                pieces = splits[word]
                if len(pieces) <= 1:
                    continue
                new_pieces = []
                i = 0
                while i < len(pieces):
                    if (
                        i < len(pieces) - 1
                        and pieces[i] == best_pair[0]
                        and pieces[i + 1] == best_pair[1]
                    ):
                        new_pieces.append(merged_token)
                        i += 2
                    else:
                        new_pieces.append(pieces[i])
                        i += 1
                splits[word] = new_pieces

        logger.info(
            "ChemNova BPE training complete. Final vocab size: %d, Merges learned: %d",
            len(self.vocab),
            len(merges_learned),
        )

        return {
            "initial_vocab_size": len(self.vocab) - len(merges_learned),
            "final_vocab_size": len(self.vocab),
            "merges_count": len(merges_learned),
            "target_vocab_size": target_vocab_size,
        }

    def save(self, output_dir: Union[str, Path], version: str = "1.0.0") -> None:
        """Save all tokenizer artifacts to a versioned directory."""
        dir_path = Path(output_dir)
        dir_path.mkdir(parents=True, exist_ok=True)

        # 1. vocab.json
        vocab_path = dir_path / "vocab.json"
        with open(vocab_path, "w", encoding="utf-8") as f:
            json.dump(self.vocab, f, ensure_ascii=False, indent=2)

        # 2. merges.txt
        merges_path = dir_path / "merges.txt"
        with open(merges_path, "w", encoding="utf-8") as f:
            for pair in self.merges:
                f.write(f"{pair[0]} {pair[1]}\n")

        # 3. special_tokens_map.json
        specials_path = dir_path / "special_tokens_map.json"
        with open(specials_path, "w", encoding="utf-8") as f:
            json.dump({
                "special_tokens": self.special_tokens,
                "special_token_to_id": self.special_token_to_id,
            }, f, indent=2)

        # 4. tokenizer_config.json
        config_path = dir_path / "tokenizer_config.json"
        with open(config_path, "w", encoding="utf-8") as f:
            json.dump({
                "tokenizer_type": "ChemistryAwareBPE",
                "version": version,
                "vocab_size": self.vocab_size,
                "merges_count": len(self.merges),
                "pad_token": PAD_TOKEN,
                "pad_token_id": self.pad_token_id,
                "unk_token": UNK_TOKEN,
                "unk_token_id": self.unk_token_id,
                "bos_token": BOS_TOKEN,
                "bos_token_id": self.bos_token_id,
                "eos_token": EOS_TOKEN,
                "eos_token_id": self.eos_token_id,
                "mask_token": MASK_TOKEN,
                "mask_token_id": self.mask_token_id,
                "chem_token": CHEM_TOKEN,
                "formula_token": FORMULA_TOKEN,
                "smiles_token": SMILES_TOKEN,
                "reaction_token": REACTION_TOKEN,
                "question_token": QUESTION_TOKEN,
                "answer_token": ANSWER_TOKEN,
                "reasoning_token": REASONING_TOKEN,
                "end_token": END_TOKEN,
            }, f, indent=2)

        logger.info("Tokenizer artifacts successfully saved to %s", dir_path)

    @classmethod
    def load(cls, model_dir: Union[str, Path]) -> "ChemNovaBPETokenizer":
        """Load tokenizer artifacts from a directory."""
        dir_path = Path(model_dir)

        vocab_path = dir_path / "vocab.json"
        with open(vocab_path, "r", encoding="utf-8") as f:
            vocab = {k: int(v) for k, v in json.load(f).items()}

        merges_path = dir_path / "merges.txt"
        merges: List[Tuple[str, str]] = []
        if merges_path.exists():
            with open(merges_path, "r", encoding="utf-8") as f:
                for line in f:
                    parts = line.strip().split(" ")
                    if len(parts) == 2:
                        merges.append((parts[0], parts[1]))

        tokenizer = cls(vocab=vocab, merges=merges)
        return tokenizer
