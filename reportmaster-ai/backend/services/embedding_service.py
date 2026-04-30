"""
ReportMaster AI — Embedding Service
Loads sentence-transformers model once at startup and provides encoding methods.
"""

from sentence_transformers import SentenceTransformer
from config import settings
import logging

logger = logging.getLogger(__name__)

# Global model instance — loaded once at startup
_model: SentenceTransformer | None = None


def load_model() -> None:
    """Load the embedding model into memory. Called once at startup."""
    global _model
    if _model is None:
        logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}...")
        _model = SentenceTransformer(settings.EMBEDDING_MODEL)
        logger.info("Embedding model loaded successfully.")


def get_model() -> SentenceTransformer:
    """Get the cached embedding model instance."""
    if _model is None:
        load_model()
    return _model


def encode(text: str) -> list[float]:
    """Encode a single text string into a vector embedding.

    Args:
        text: The text to encode.

    Returns:
        A list of floats representing the embedding vector (384 dimensions).
    """
    model = get_model()
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()


def encode_batch(texts: list[str]) -> list[list[float]]:
    """Encode a batch of text strings into vector embeddings.

    Args:
        texts: List of text strings to encode.

    Returns:
        A list of embedding vectors, each being a list of 384 floats.
    """
    model = get_model()
    embeddings = model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
    return [emb.tolist() for emb in embeddings]
