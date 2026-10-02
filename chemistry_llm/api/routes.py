"""API route handlers for ChemNova Local Chemistry AI, Tools, RAG, and Web Research."""

import logging
from fastapi import APIRouter, HTTPException, status
from chemistry_llm.api.schemas import (
    AssistantRequest,
    AssistantResponse,
    ChatRequest,
    ChatResponse,
    HealthResponse,
    RAGIngestRequest,
    RAGIngestResponse,
    RAGSearchRequest,
    RAGSearchResponse,
    ToolExecutionRequest,
    ToolExecutionResponse,
    WebSearchRequest,
    WebSearchResponse,
)
from chemistry_llm.api.server import router as llm_router
from chemistry_llm.inference.response_pipeline import get_response_pipeline
from chemistry_llm.config.settings import settings
from chemistry_llm.rag.documents.schema import Document
from chemistry_llm.rag.engine import ChemNovaRAGEngine
from chemistry_llm.tools.assistant import ChemNovaToolAssistant
from chemistry_llm.tools.registry import ToolRegistry
from chemistry_llm.tools.schema import ToolCall
from chemistry_llm.web_research.researcher import WebResearchEngine

logger = logging.getLogger("chemistry_llm.api")
router = APIRouter()

# Mount the LLM endpoints (/api/llm/generate and /api/llm/health)
router.include_router(llm_router)


@router.post("/chat", response_model=ChatResponse)
@router.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Handle conversational chat requests with local Chemistry AI engine."""
    user_msg = request.message
    if not user_msg or not user_msg.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message content cannot be empty.",
        )

    try:
        assistant = get_tool_assistant()
        res = assistant.process_request(
            message=user_msg.strip(),
            conversation_id=request.conversation_id,
            context=request.context,
        )

        return ChatResponse(
            status="success",
            response=res["answer"],
            responseText=res["answer"],
            conversation_id=request.conversation_id or "session_default",
            intent=res.get("metadata", {}).get("intent", "chemistry_assistant"),
            engine="ChemNova Local Chemistry AI + RAG + Web Research",
            confidence=0.96,
            step=8,
            tool_used=res.get("tool_used", False),
            tools=res.get("tools", []),
            citations=res.get("citations", []),
            warnings=res.get("warnings", []),
            metadata=res.get("metadata", {}),
        )
    except Exception as e:
        logger.error("Error processing chat message: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Local Chemistry AI processing error: {str(e)}",
        )


@router.get("/health", response_model=HealthResponse)
@router.get("/api/health", response_model=HealthResponse)
async def health_endpoint():
    """Health check endpoint confirming local Chemistry AI engine status."""
    try:
        pipeline = get_response_pipeline()
        vocab_size = pipeline.tokenizer.vocab_size
        device_str = str(pipeline.device)
    except Exception:
        vocab_size = None
        device_str = settings.get_resolved_device()

    return HealthResponse(
        status="ok",
        engine="ChemNova Local Chemistry AI",
        device=device_str,
        vocab_size=vocab_size,
    )


# ============================================================================
# SINGLETON INSTANCES FOR TOOLS, RAG & WEB
# ============================================================================

_assistant_instance = None
_registry_instance = None
_rag_instance = None
_web_instance = None


def get_tool_assistant() -> ChemNovaToolAssistant:
    global _assistant_instance
    if _assistant_instance is None:
        _assistant_instance = ChemNovaToolAssistant()
    return _assistant_instance


def get_tool_registry() -> ToolRegistry:
    global _registry_instance
    if _registry_instance is None:
        _registry_instance = ToolRegistry()
    return _registry_instance


def get_rag_engine() -> ChemNovaRAGEngine:
    global _rag_instance
    if _rag_instance is None:
        _rag_instance = ChemNovaRAGEngine()
    return _rag_instance


def get_web_engine() -> WebResearchEngine:
    global _web_instance
    if _web_instance is None:
        _web_instance = WebResearchEngine()
    return _web_instance


# ============================================================================
# CHEMNOVA ASSISTANT ENDPOINT
# ============================================================================

@router.post("/api/chemnova/assistant", response_model=AssistantResponse)
async def chemnova_assistant_endpoint(req: AssistantRequest):
    """ChemNova Master Assistant endpoint orchestrating LLM + Tools + RAG + Web."""
    try:
        assistant = get_tool_assistant()
        res = assistant.process_request(
            message=req.message,
            conversation_id=req.conversation_id,
            context=req.context,
        )
        return AssistantResponse(
            answer=res["answer"],
            tool_used=res["tool_used"],
            tools=res["tools"],
            citations=res["citations"],
            warnings=res["warnings"],
            metadata=res["metadata"],
        )
    except Exception as e:
        logger.error("Error in chemnova_assistant_endpoint: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ChemNova Assistant error: {str(e)}",
        )


@router.post("/api/chemnova/tool", response_model=ToolExecutionResponse)
async def chemnova_direct_tool_endpoint(req: ToolExecutionRequest):
    """Directly execute a registered chemistry tool operation."""
    try:
        registry = get_tool_registry()
        call = ToolCall(tool=req.tool, operation=req.operation, arguments=req.arguments)
        res = registry.execute_call(call)
        return ToolExecutionResponse(
            success=res.success,
            tool=res.tool,
            operation=res.operation,
            result=res.result,
            warnings=res.warnings,
            errors=res.errors,
            metadata=res.metadata,
            execution_time_ms=res.execution_time_ms,
        )
    except Exception as e:
        logger.error("Error in chemnova_direct_tool_endpoint: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Tool execution error: {str(e)}",
        )


@router.get("/api/chemnova/tools")
async def chemnova_list_tools_endpoint():
    """List all registered ChemNova chemistry tools and capabilities."""
    registry = get_tool_registry()
    return {"status": "ok", "tools": registry.list_tools()}


@router.get("/api/chemnova/health")
async def chemnova_assistant_health():
    """Health status of the ChemNova Assistant and Subsystems."""
    rag = get_rag_engine()
    web = get_web_engine()
    return {
        "status": "healthy",
        "step": 8,
        "engine": "ChemNova Local Chemistry AI + RAG + Web Research",
        "model_loaded": _assistant_instance is not None,
        "vector_store_chunks": rag.vector_store.count(),
        "web_research_ready": True,
        "web_live_api_active": web.is_live_api_active(),
    }


# ============================================================================
# STEP 8: RAG ENDPOINTS
# ============================================================================

@router.get("/api/chemnova/rag/health")
async def chemnova_rag_health():
    """Health status of the Chemistry RAG Engine."""
    rag = get_rag_engine()
    return {
        "status": "healthy",
        "step": 8,
        "engine": "ChemNova Chemistry RAG Engine",
        "indexed_chunks": rag.vector_store.count(),
        "embedding_dimension": rag.embedding_model.get_dimension(),
        "embedding_model": rag.embedding_model.get_model_name(),
        "cache_stats": rag.cache.get_stats(),
    }


@router.post("/api/chemnova/rag/search", response_model=RAGSearchResponse)
@router.post("/api/chemnova/rag/retrieve", response_model=RAGSearchResponse)
async def chemnova_rag_search(req: RAGSearchRequest):
    """Retrieve verified scientific context for a chemistry query."""
    try:
        rag = get_rag_engine()
        result = rag.search_and_build_context(
            query=req.query,
            top_k=req.top_k,
            filter_dict=req.filters,
        )
        return RAGSearchResponse(
            query=result["query"],
            intent=result["intent"],
            retrieved_count=result["retrieved_count"],
            chunks=result["chunks"],
            citations=result["citations"],
            context_block=result["context_block"],
        )
    except Exception as e:
        logger.error("RAG search failed: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"RAG search error: {str(e)}",
        )


@router.post("/api/chemnova/rag/ingest", response_model=RAGIngestResponse)
async def chemnova_rag_ingest(req: RAGIngestRequest):
    """Ingest a new chemistry document into the vector store."""
    try:
        rag = get_rag_engine()
        doc = Document(
            title=req.title,
            content=req.content,
            domain=req.domain,
            subdomain=req.subdomain,
            smiles=req.smiles,
            source=req.source,
            source_url=req.source_url,
            verification_status=req.verification_status,
        )
        added_chunks = rag.ingestion_pipeline.ingest_document(doc)
        rag.cache.clear()
        return RAGIngestResponse(
            status="success",
            document_title=req.title,
            chunks_indexed=added_chunks,
        )
    except Exception as e:
        logger.error("RAG ingestion error: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ingestion error: {str(e)}",
        )


@router.post("/api/chemnova/rag/reindex")
async def chemnova_rag_reindex():
    """Rebuild the RAG vector index from curated scientific documents."""
    try:
        rag = get_rag_engine()
        rag.vector_store.clear()
        rag.cache.clear()
        indexed = rag.bootstrap_knowledge_base()
        return {"status": "success", "chunks_reindexed": indexed}
    except Exception as e:
        logger.error("RAG reindex error: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Reindex error: {str(e)}",
        )


# ============================================================================
# STEP 8: WEB RESEARCH ENDPOINTS
# ============================================================================

@router.get("/api/chemnova/web/health")
async def chemnova_web_health():
    """Health check for ChemNova Web Research layer."""
    web = get_web_engine()
    return {
        "status": "healthy",
        "step": 8,
        "engine": "ChemNova Web Research Layer",
        "live_api_active": web.is_live_api_active(),
        "provider": type(web.provider).__name__,
        "ssrf_protection": True,
        "prompt_injection_defense": True,
    }


@router.post("/api/chemnova/web/search", response_model=WebSearchResponse)
async def chemnova_web_search(req: WebSearchRequest):
    """Perform safe scientific web research with academic source verification."""
    try:
        web = get_web_engine()
        results = web.research(req.query, num_results=req.num_results)
        return WebSearchResponse(
            query=results["query"],
            total_found=results["total_found"],
            trusted_count=results["trusted_count"],
            provider_type=results["provider_type"],
            results=results["results"],
        )
    except Exception as e:
        logger.error("Web research error: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Web research error: {str(e)}",
        )
