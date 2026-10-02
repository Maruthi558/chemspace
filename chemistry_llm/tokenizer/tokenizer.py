"""ChemNova Local Tokenizer Architecture.

Provides trainable, self-hosted tokenization for English text,
chemistry notation, chemical symbols, molecular formulas, SMILES,
numbers, scientific notation, mathematical symbols, units, Greek letters,
and model special tokens, powered by Chemistry-Aware BPE.
"""

from pathlib import Path
from typing import Dict, List, Optional, Sequence, Tuple, Union
import json
import logging
import re

from .special_tokens import (
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
    USER_TOKEN,
    ASSISTANT_TOKEN,
    CHEMISTRY_TOKEN,
    SPECIAL_TOKENS,
    SPECIAL_TOKEN_TO_ID,
    ID_TO_SPECIAL_TOKEN,
    PAD_ID,
    UNK_ID,
    BOS_ID,
    EOS_ID,
    MASK_ID,
)
from .vocabulary import Vocabulary, build_base_vocabulary
from .bpe import ChemNovaBPETokenizer, build_pretokenization_pattern

logger = logging.getLogger("chemistry_llm.tokenizer")


class ChemNovaTokenizer:
    """Trainable and initializable Tokenizer for ChemNova-LLM with BPE support."""

    DEFAULT_ARTIFACT_DIR = Path(__file__).parent / "chemnova_tokenizer_v1"

    def __init__(
        self,
        vocab_file: Optional[Union[str, Path]] = None,
        empty: bool = False,
        use_default_trained: bool = True,
    ):
        """Initialize tokenizer.
        
        Args:
            vocab_file: Optional path to saved JSON vocabulary or directory with vocab.json/merges.txt.
            empty: If True, initialize only with special tokens (empty foundation).
                   If False, initialize with base characters & chemical symbols or trained model.
            use_default_trained: If True and vocab_file is None, load trained chemnova_tokenizer_v1 if present.
        """
        self.vocab: Dict[str, int] = {}
        self.id_to_token: Dict[int, str] = {}
        self.special_tokens = list(SPECIAL_TOKENS)
        self.merges: List[Tuple[str, str]] = []
        self.bpe_ranks: Dict[Tuple[str, str], int] = {}

        if vocab_file and Path(vocab_file).exists():
            self.load_vocabulary(vocab_file)
        elif empty:
            self._init_empty_vocabulary()
        elif use_default_trained and self.DEFAULT_ARTIFACT_DIR.exists():
            self.load_vocabulary(self.DEFAULT_ARTIFACT_DIR)
        else:
            self._init_base_vocabulary()

        self._compile_regex()

    def _init_empty_vocabulary(self) -> None:
        """Initialize empty vocabulary containing only special tokens."""
        self.vocab = dict(SPECIAL_TOKEN_TO_ID)
        self.id_to_token = {v: k for k, v in self.vocab.items()}

    def _init_base_vocabulary(self) -> None:
        """Initialize with base symbols, ASCII characters, and units."""
        self.vocab = build_base_vocabulary()
        self.id_to_token = {v: k for k, v in self.vocab.items()}

    def _compile_regex(self) -> None:
        """Compile regex pattern for chemistry and scientific token segmentation."""
        self._token_pattern = build_pretokenization_pattern()

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

    @property
    def special_token_to_id(self) -> Dict[str, int]:
        return {tok: self.vocab[tok] for tok in self.special_tokens if tok in self.vocab}

    def _bpe_merge_word(self, token: str) -> List[str]:
        """Apply learned BPE merge rules to a subword if merges are loaded."""
        if not self.bpe_ranks or token in self.special_tokens or token in self.vocab:
            return [token]

        word_pieces = list(token)
        if len(word_pieces) <= 1:
            return word_pieces

        while len(word_pieces) > 1:
            pairs = [(word_pieces[i], word_pieces[i + 1]) for i in range(len(word_pieces) - 1)]
            best_pair = None
            best_rank = float("inf")

            for pair in pairs:
                if pair in self.bpe_ranks:
                    rank = self.bpe_ranks[pair]
                    if rank < best_rank:
                        best_rank = rank
                        best_pair = pair

            if best_pair is None:
                break

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
        """Split text into sub-tokens using chemistry pre-tokenization and BPE merges."""
        if not text:
            return []

        raw_tokens = self._token_pattern.findall(text)
        tokens: List[str] = []

        for tok in raw_tokens:
            if not tok:
                continue

            if tok in self.vocab or tok in self.special_tokens:
                tokens.append(tok)
            elif tok.isspace():
                for sp in tok:
                    tokens.append(sp if sp in self.vocab else UNK_TOKEN)
            else:
                # Apply BPE merges if available
                sub_pieces = self._bpe_merge_word(tok)
                for piece in sub_pieces:
                    if piece in self.vocab:
                        tokens.append(piece)
                    else:
                        for ch in piece:
                            tokens.append(ch if ch in self.vocab else UNK_TOKEN)

        return tokens

    def convert_tokens_to_ids(self, tokens: Sequence[str]) -> List[int]:
        """Convert token strings to vocabulary IDs."""
        return [self.vocab.get(tok, self.unk_token_id) for tok in tokens]

    def convert_ids_to_tokens(self, ids: Sequence[int]) -> List[str]:
        """Convert vocabulary IDs back to token strings."""
        return [self.id_to_token.get(idx, UNK_TOKEN) for idx in ids]

    def encode(
        self,
        text: str,
        add_special_tokens: bool = False,
        max_length: Optional[int] = None,
        padding: bool = False,
        truncation: bool = True,
    ) -> List[int]:
        """Encode text string into token ID list."""
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
        """Decode token IDs back into string."""
        tokens = []
        for tid in token_ids:
            tok = self.id_to_token.get(tid, UNK_TOKEN)
            if skip_special_tokens and (tok in self.special_tokens or tok.startswith("<")):
                continue
            tokens.append(tok)
        return "".join(tokens)

    def pad(
        self,
        token_ids: List[int],
        max_length: int,
        padding_value: Optional[int] = None,
    ) -> List[int]:
        """Pad a sequence of IDs to max_length."""
        pad_val = self.pad_token_id if padding_value is None else padding_value
        if len(token_ids) >= max_length:
            return token_ids[:max_length]
        return token_ids + [pad_val] * (max_length - len(token_ids))

    def train_from_corpus(
        self,
        texts: List[str],
        min_frequency: int = 2,
        max_vocab_size: int = 4096,
    ) -> None:
        """Train and expand tokenizer vocabulary on a text corpus using BPE."""
        bpe_engine = ChemNovaBPETokenizer()
        summary = bpe_engine.train_bpe(
            corpus_texts=texts,
            target_vocab_size=max_vocab_size,
            min_frequency=min_frequency,
        )
        self.vocab = bpe_engine.vocab
        self.id_to_token = bpe_engine.id_to_token
        self.merges = bpe_engine.merges
        self.bpe_ranks = bpe_engine.bpe_ranks
        self._compile_regex()

    def save_vocabulary(self, file_path: Union[str, Path]) -> None:
        """Save vocabulary to JSON."""
        path = Path(file_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(self.vocab, f, ensure_ascii=False, indent=2)

    def load_vocabulary(self, file_path: Union[str, Path]) -> None:
        """Load vocabulary from JSON file or directory containing vocab.json and merges.txt."""
        path = Path(file_path)
        if path.is_dir():
            vocab_p = path / "vocab.json"
            merges_p = path / "merges.txt"
        else:
            vocab_p = path
            merges_p = path.parent / "merges.txt"

        with open(vocab_p, "r", encoding="utf-8") as f:
            raw = json.load(f)
        self.vocab = {k: int(v) for k, v in raw.items()}
        self.id_to_token = {int(v): k for k, v in self.vocab.items()}

        self.merges = []
        if merges_p.exists():
            with open(merges_p, "r", encoding="utf-8") as f:
                for line in f:
                    parts = line.strip().split(" ")
                    if len(parts) == 2:
                        self.merges.append((parts[0], parts[1]))
            self.bpe_ranks = {pair: rank for rank, pair in enumerate(self.merges)}

        self._compile_regex()

    def save_config(self, file_path: Union[str, Path]) -> None:
        """Save tokenizer configuration metadata."""
        path = Path(file_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        config_data = {
            "vocab_size": self.vocab_size,
            "merges_count": len(self.merges),
            "special_tokens": self.special_tokens,
            "pad_token_id": self.pad_token_id,
            "unk_token_id": self.unk_token_id,
            "bos_token_id": self.bos_token_id,
            "eos_token_id": self.eos_token_id,
            "mask_token_id": self.mask_token_id,
        }
        with open(path, "w", encoding="utf-8") as f:
            json.dump(config_data, f, indent=2)
