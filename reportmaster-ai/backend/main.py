"""
ReportMaster AI — FastAPI Application
Main entry point with CORS, routers, and startup events.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import auth, admin, documents, chat, users
from services import embedding_service
import logging
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="ReportMaster AI",
    description="Financial Reporting Intelligence Hub — RAG-powered document analysis",
    version="1.0.0",
)


@app.middleware("http")
async def log_request_timing(request, call_next):
    start = time.perf_counter()
    response = None
    try:
        response = await call_next(request)
        return response
    finally:
        duration_ms = (time.perf_counter() - start) * 1000
        try:
            status = getattr(response, "status_code", "ERR")
            logger.info(f"{request.method} {request.url.path} -> {status} ({duration_ms:.1f}ms)")
        except Exception:
            pass

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(documents.router)
app.include_router(chat.router)
app.include_router(users.router)


@app.on_event("startup")
async def startup_event():
    """Load the embedding model into memory on startup."""
    logger.info("Starting ReportMaster AI backend...")
    logger.info("Loading embedding model (this may take a moment on first run)...")
    embedding_service.load_model()
    logger.info("ReportMaster AI backend ready!")


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "name": "ReportMaster AI",
        "version": "1.0.0",
        "status": "operational",
        "model": settings.EMBEDDING_MODEL,
    }


@app.get("/health")
async def health():
    """Detailed health check."""
    model_loaded = embedding_service._model is not None
    return {
        "status": "healthy" if model_loaded else "degraded",
        "embedding_model_loaded": model_loaded,
        "groq_model": settings.GROQ_MODEL,
        "supabase_connected": bool(settings.SUPABASE_URL),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
