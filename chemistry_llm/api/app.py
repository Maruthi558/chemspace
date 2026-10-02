"""FastAPI Application for ChemNova Local Chemistry AI Engine.

Exposes:
- POST /api/chat
- GET /api/health
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from chemistry_llm.api.routes import router
from chemistry_llm.config.settings import settings

logger = logging.getLogger("chemistry_llm.api")

app = FastAPI(
    title="ChemNova Local Chemistry AI Engine",
    description="Dedicated, self-hosted Chemistry AI and Transformer LLM foundation for ChemNova.",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the routes
app.include_router(router)


def get_app() -> FastAPI:
    """Return the FastAPI application instance."""
    return app


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host=settings.llm_host,
        port=settings.llm_port,
    )
