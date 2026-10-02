"""Source Attribution and Citation Management Engine for Chemistry RAG."""

from dataclasses import asdict, dataclass
from typing import Any, Dict, List, Optional

from chemistry_llm.rag.documents.schema import Chunk


@dataclass
class Citation:
    """Represents a validated academic source citation."""

    citation_id: str
    title: str
    source: str
    source_url: Optional[str]
    document_id: str
    domain: str
    knowledge_type: str  # VERIFIED_SOURCE, TOOL_RESULT, PREDICTION_SIMULATION, MODEL_REASONING
    confidence: float
    excerpt: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    def format_footnote(self) -> str:
        """Format clean citation footnote for final user response."""
        url_part = f" ({self.source_url})" if self.source_url else ""
        return f"[{self.citation_id}] {self.title} - {self.source}{url_part} [{self.knowledge_type}]"


class CitationEngine:
    """Manages academic citations and distinguishes verified facts from predictions."""

    @classmethod
    def create_citation_from_chunk(
        cls,
        index: int,
        chunk: Chunk,
        score: float,
    ) -> Citation:
        """Construct structured citation from a retrieved Chunk."""
        # Determine knowledge type
        if chunk.verification_status == "verified":
            k_type = "VERIFIED_SOURCE"
        elif chunk.verification_status == "experimental":
            k_type = "EXPERIMENTAL_LITERATURE"
        elif chunk.section_type == "spectroscopy" and "prediction" in chunk.content.lower():
            k_type = "PREDICTION_SIMULATION"
        else:
            k_type = "LITERATURE_KNOWLEDGE"

        return Citation(
            citation_id=f"SOURCE {index}",
            title=chunk.title or "Chemistry Reference Document",
            source=chunk.source or "ChemNova Scientific Knowledge Base",
            source_url=chunk.source_url,
            document_id=chunk.document_id,
            domain=chunk.domain or "chemistry",
            knowledge_type=k_type,
            confidence=round(min(max(score, 0.5), 1.0), 3),
            excerpt=chunk.content[:200].replace("\n", " ").strip() + "...",
        )
