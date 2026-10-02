"""ChemNova LLM REST API Server.

Provides endpoints for local text generation and health monitoring:
    POST /api/llm/generate
    GET  /api/llm/health
"""

import logging
from typing import Any, Dict, Optional
from fastapi import FastAPI, APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from chemistry_llm.inference.inference_engine import get_inference_engine

logger = logging.getLogger("chemistry_llm.server")

# Pydantic Schemas
class GenerateRequest(BaseModel):
    prompt: str = Field(..., description="Prompt text to feed into the model")
    max_new_tokens: int = Field(default=64, ge=1, le=512)
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    top_k: Optional[int] = Field(default=50, ge=0)
    top_p: float = Field(default=0.9, ge=0.0, le=1.0)
    repetition_penalty: float = Field(default=1.1, ge=0.5, le=3.0)


class GenerateResponse(BaseModel):
    text: str
    model: str = "ChemNova-LLM"
    local: bool = True
    prompt: Optional[str] = None


class HealthResponse(BaseModel):
    status: str = "healthy"
    model_initialized: bool = True
    tokenizer_initialized: bool = True
    device: str
    checkpoint_status: str
    model_parameter_count: int
    training_status: str
    model: str = "ChemNova-LLM"
    local: bool = True


# Create router
router = APIRouter(prefix="/api/llm", tags=["ChemNova-LLM"])


@router.post("/generate", response_model=GenerateResponse)
async def generate_endpoint(req: GenerateRequest):
    """Autoregressive text generation using local ChemNova-LLM."""
    if not req.prompt or not req.prompt.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prompt cannot be empty.",
        )

    try:
        engine = get_inference_engine()
        output_text = engine.generate(
            prompt=req.prompt,
            max_new_tokens=req.max_new_tokens,
            temperature=req.temperature,
            top_k=req.top_k,
            top_p=req.top_p,
            repetition_penalty=req.repetition_penalty,
        )

        return GenerateResponse(
            text=output_text,
            model="ChemNova-LLM",
            local=True,
            prompt=req.prompt,
        )
    except Exception as e:
        logger.error("Generation error: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}",
        )


@router.get("/health", response_model=HealthResponse)
async def health_endpoint():
    """Health check reporting model and tokenizer operational status."""
    try:
        engine = get_inference_engine()
        st = engine.get_status()

        return HealthResponse(
            status="healthy",
            model_initialized=st["model_initialized"],
            tokenizer_initialized=st["tokenizer_initialized"],
            device=st["device"],
            checkpoint_status=st["checkpoint_status"],
            model_parameter_count=st["model_parameter_count"],
            training_status=st["training_status"],
            model="ChemNova-LLM",
            local=True,
        )
    except Exception as e:
        logger.error("Health check error: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Health status check error: {str(e)}",
        )


# FastAPI Application instance
app = FastAPI(
    title="ChemNova-LLM Local API",
    description="From-scratch small trainable Language Model API for ChemNova Chemistry AI",
    version="0.1.0",
)

# Include router for both /api/llm prefix and root fallback
app.include_router(router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
