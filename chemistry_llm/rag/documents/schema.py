"""Structured Data Schemas for Chemistry Documents and Chunks."""

from dataclasses import asdict, dataclass, field
import hashlib
import time
import uuid
from typing import Any, Dict, List, Optional


@dataclass
class Document:
    """Represents a validated chemistry knowledge document with strict provenance."""

    title: str
    content: str
    document_id: str = field(default_factory=lambda: str(uuid.uuid4())[:12])
    source: str = "ChemNova Knowledge Base"
    source_url: Optional[str] = None
    author: Optional[str] = "ChemNova Scientific Team"
    publication_date: Optional[str] = field(default_factory=lambda: time.strftime("%Y-%m-%d"))
    license: str = "CC-BY-4.0 / Public Domain"
    provenance: str = "Verified Peer-Reviewed Scientific Literature / Open Chemistry Data"
    domain: str = "chemistry"  # organic, inorganic, physical, analytical, biochemistry, etc.
    subdomain: Optional[str] = None
    molecule: Optional[str] = None
    smiles: Optional[str] = None
    reaction: Optional[str] = None
    confidence: float = 1.0
    verification_status: str = "verified"  # verified, literature, experimental, predicted
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Document":
        return cls(**{k: v for k, v in data.items() if k in cls.__dataclass_fields__})


@dataclass
class Chunk:
    """Represents a chemistry-aware chunk partitioned from a Document."""

    chunk_id: str
    document_id: str
    content: str
    chunk_index: int
    title: str = ""
    source: str = ""
    source_url: Optional[str] = None
    domain: str = "chemistry"
    subdomain: Optional[str] = None
    smiles: Optional[str] = None
    molecule: Optional[str] = None
    reaction: Optional[str] = None
    verification_status: str = "verified"
    section_type: str = "general"  # general, reaction, molecule_property, spectroscopy, mechanism, safety
    chemical_entities: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    embedding: Optional[List[float]] = None

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        if d["embedding"] is not None:
            # Keep representation serializable
            d["embedding_dim"] = len(d["embedding"])
        return d

    @classmethod
    def create_id(cls, document_id: str, index: int, content: str) -> str:
        """Deterministic chunk ID hash."""
        digest = hashlib.sha256(f"{document_id}_{index}_{content[:64]}".encode("utf-8")).hexdigest()[:16]
        return f"chk_{digest}"
