"""Document Ingestion Pipeline for ChemNova Chemistry RAG."""

import csv
import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from chemistry_llm.rag.cleaning.cleaner import DocumentCleaner
from chemistry_llm.rag.chunking.chunker import ChemistryAwareChunker
from chemistry_llm.rag.configs.config import RAGConfig
from chemistry_llm.rag.documents.schema import Chunk, Document
from chemistry_llm.rag.embeddings.base import BaseEmbeddingModel
from chemistry_llm.rag.embeddings.local_embedding import get_embedding_model
from chemistry_llm.rag.normalization.normalizer import ChemicalNormalizer
from chemistry_llm.rag.vector_store.base import BaseVectorStore
from chemistry_llm.rag.vector_store.local_store import ChemNovaLocalVectorStore

logger = logging.getLogger("chemistry_llm.rag.ingestion")


class DocumentIngestionPipeline:
    """End-to-end ingestion pipeline: Raw File -> Clean -> Normalize -> Chunk -> Embed -> Index."""

    def __init__(
        self,
        config: Optional[RAGConfig] = None,
        vector_store: Optional[BaseVectorStore] = None,
        embedding_model: Optional[BaseEmbeddingModel] = None,
    ):
        self.config = config or RAGConfig()
        self.vector_store = vector_store or ChemNovaLocalVectorStore(storage_dir=self.config.storage_dir)
        self.embedding_model = embedding_model or get_embedding_model(
            model_name=self.config.embedding_model_name,
            dimension=self.config.embedding_dimension,
        )
        self.cleaner = DocumentCleaner()
        self.normalizer = ChemicalNormalizer()
        self.chunker = ChemistryAwareChunker(config=self.config)

    def ingest_document(self, doc: Document) -> int:
        """Ingest, process, embed, and index a single Document object."""
        # 1. Clean content
        cleaned_content = self.cleaner.clean(doc.content)
        if not cleaned_content:
            logger.warning("Document %s (%s) had empty content after cleaning.", doc.document_id, doc.title)
            return 0

        # 2. Normalize content
        normalized_content = self.normalizer.normalize_text(cleaned_content)
        doc.content = normalized_content

        # 3. Canonicalize SMILES if provided
        if doc.smiles:
            doc.smiles = self.normalizer.canonicalize_smiles(doc.smiles)

        # 4. Chunk document preserving chemistry structures
        chunks: List[Chunk] = self.chunker.chunk_document(doc)
        if not chunks:
            return 0

        # 5. Generate embeddings for each chunk
        texts_to_embed = [f"{c.title}\n{c.content}" for c in chunks]
        embeddings = self.embedding_model.embed_batch(texts_to_embed)

        for chunk, emb in zip(chunks, embeddings):
            chunk.embedding = emb

        # 6. Index into vector store
        added_count = self.vector_store.add_chunks(chunks)
        logger.info("Ingested document '%s' -> %d chunks indexed.", doc.title, added_count)
        return added_count

    def ingest_file(self, file_path: Union[str, Path], metadata: Optional[Dict[str, Any]] = None) -> int:
        """Ingest a file from disk (TXT, Markdown, JSON, JSONL, CSV)."""
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"File not found: {path}")

        meta = metadata or {}
        suffix = path.suffix.lower()
        docs: List[Document] = []

        if suffix in (".txt", ".md", ".markdown"):
            with open(path, "r", encoding="utf-8", errors="replace") as f:
                content = f.read()
            docs.append(
                Document(
                    title=meta.get("title", path.stem.replace("_", " ").title()),
                    content=content,
                    source=meta.get("source", path.name),
                    source_url=meta.get("source_url"),
                    domain=meta.get("domain", "chemistry"),
                    subdomain=meta.get("subdomain"),
                    license=meta.get("license", "CC-BY-4.0"),
                    provenance=meta.get("provenance", f"File ingestion from {path.name}"),
                    metadata=meta,
                )
            )

        elif suffix == ".json":
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            if isinstance(data, list):
                for item in data:
                    docs.append(Document.from_dict({**meta, **item}))
            elif isinstance(data, dict):
                docs.append(Document.from_dict({**meta, **data}))

        elif suffix == ".jsonl":
            with open(path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        item = json.loads(line)
                        docs.append(Document.from_dict({**meta, **item}))

        elif suffix == ".csv":
            with open(path, "r", encoding="utf-8", errors="replace") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    title = row.get("title", row.get("name", path.stem))
                    content = row.get("content", row.get("description", str(row)))
                    docs.append(
                        Document(
                            title=title,
                            content=content,
                            source=meta.get("source", path.name),
                            domain=row.get("domain", meta.get("domain", "chemistry")),
                            smiles=row.get("smiles"),
                            metadata={**meta, **row},
                        )
                    )

        total_chunks = 0
        for doc in docs:
            total_chunks += self.ingest_document(doc)

        return total_chunks

    def ingest_batch(self, documents: List[Document]) -> int:
        """Batch ingest a list of Document objects."""
        total = 0
        for doc in documents:
            total += self.ingest_document(doc)
        return total
