"""Pydantic schemas for ChemNova Local Chemistry AI, Tools, RAG, and Web Research API."""

from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, model_validator


class ChatRequest(BaseModel):
    """Chat message request schema."""
    message: Optional[str] = Field(None, description="User prompt or query")
    query: Optional[str] = Field(None, description="Alias for message for backwards compatibility")
    conversation_id: Optional[str] = Field(None, description="Optional persistent conversation session ID")
    history: Optional[List[Dict[str, Any]]] = Field(None, description="Prior conversation turns")
    context: Optional[Dict[str, Any]] = None

    @model_validator(mode="before")
    @classmethod
    def reconcile_message(cls, data):
        if isinstance(data, dict):
            msg = data.get("message") or data.get("query") or ""
            data["message"] = msg
            if "query" not in data or not data["query"]:
                data["query"] = msg
        return data


class ChatResponse(BaseModel):
    """Standardized Chat response schema."""
    status: str = Field(default="success", description="Status code string")
    response: str = Field(..., description="Assistant response text")
    responseText: str = Field(..., description="Alias for response for frontend compatibility")
    conversation_id: str = Field(..., description="Conversation session ID")
    intent: str = Field(..., description="Detected intent classification")
    engine: str = Field(default="ChemNova Local Chemistry AI", description="Active AI engine identity")
    confidence: Optional[float] = Field(default=None, description="Confidence score of detected intent")
    step: int = Field(default=8, description="Active architecture step")
    tool_used: bool = Field(default=False, description="Whether one or more chemistry tools were invoked")
    tools: List[Dict[str, Any]] = Field(default_factory=list, description="Executed tools")
    citations: List[str] = Field(default_factory=list, description="Sources / citations")
    warnings: List[str] = Field(default_factory=list, description="Warnings")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Execution metadata")


class HealthResponse(BaseModel):
    """Health check response schema."""
    status: str = Field(default="ok", description="Service health status")
    engine: str = Field(default="ChemNova Local Chemistry AI", description="Engine identifier")
    device: Optional[str] = Field(default=None, description="Hardware compute device (cpu / cuda)")
    vocab_size: Optional[int] = Field(default=None, description="Loaded vocabulary token count")


class AssistantRequest(BaseModel):
    """ChemNova Assistant request schema (Step 7 & 8)."""
    message: str = Field(..., description="User query or chemistry task prompt")
    conversation_id: Optional[str] = Field(default=None, description="Optional conversation session ID")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Optional execution context")


class AssistantResponse(BaseModel):
    """ChemNova Assistant response schema (Step 7 & 8)."""
    answer: str = Field(..., description="Verified chemistry assistant response text")
    tool_used: bool = Field(default=False, description="Whether one or more chemistry tools were invoked")
    tools: List[Dict[str, Any]] = Field(default_factory=list, description="List of executed tool actions & results")
    citations: List[str] = Field(default_factory=list, description="Citations or tool sources")
    warnings: List[str] = Field(default_factory=list, description="Scientific warnings or uncertainty notices")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Execution metadata")


class ToolExecutionRequest(BaseModel):
    """Direct tool invocation request."""
    tool: str = Field(..., description="Registered tool name (e.g. rdkit, chemdraw, spectroscopy)")
    operation: str = Field(..., description="Target operation name")
    arguments: Dict[str, Any] = Field(default_factory=dict, description="Arguments for the operation")


class ToolExecutionResponse(BaseModel):
    """Direct tool invocation response."""
    success: bool
    tool: str
    operation: str
    result: Dict[str, Any] = Field(default_factory=dict)
    warnings: List[str] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    execution_time_ms: float = 0.0


# ============================================================================
# STEP 8: RAG & WEB RESEARCH SCHEMAS
# ============================================================================

class RAGSearchRequest(BaseModel):
    """RAG semantic and keyword search request."""
    query: str = Field(..., description="Scientific search query")
    top_k: int = Field(default=3, description="Number of chunks to retrieve")
    filters: Optional[Dict[str, Any]] = Field(default=None, description="Optional metadata filters")


class RAGSearchResponse(BaseModel):
    """RAG search response."""
    query: str
    intent: str
    retrieved_count: int
    chunks: List[Dict[str, Any]] = Field(default_factory=list)
    citations: List[Dict[str, Any]] = Field(default_factory=list)
    context_block: str = ""


class RAGIngestRequest(BaseModel):
    """Document ingestion request."""
    title: str = Field(..., description="Document title")
    content: str = Field(..., description="Document text or markdown content")
    domain: str = Field(default="chemistry", description="Chemistry domain")
    subdomain: Optional[str] = None
    smiles: Optional[str] = None
    source: str = Field(default="Manual Ingestion", description="Source name")
    source_url: Optional[str] = None
    verification_status: str = Field(default="verified", description="Verification level")


class RAGIngestResponse(BaseModel):
    """Document ingestion response."""
    status: str = "success"
    document_title: str
    chunks_indexed: int


class WebSearchRequest(BaseModel):
    """Web research query request."""
    query: str = Field(..., description="Current research query")
    num_results: int = Field(default=3, description="Max results")


class WebSearchResponse(BaseModel):
    """Web research response."""
    query: str
    total_found: int
    trusted_count: int
    provider_type: str
    results: List[Dict[str, Any]] = Field(default_factory=list)
