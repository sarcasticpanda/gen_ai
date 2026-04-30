"""
ReportMaster AI — RAG Service
Orchestrates retrieval-augmented generation: embed query → retrieve chunks → build prompt → generate answer.
"""

from services import embedding_service, groq_service, supabase_service
import logging
import json
import time
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

_TITLE_EXECUTOR = ThreadPoolExecutor(max_workers=2)

_DEFAULT_TOP_K = 4
_MAX_CHUNK_CHARS = 1200
_MAX_CONTEXT_CHARS = 12000


def _maybe_log_slow(step: str, start: float, threshold_ms: float = 800) -> None:
    duration_ms = (time.perf_counter() - start) * 1000
    if duration_ms >= threshold_ms:
        logger.info(f"RAG slow step: {step} took {duration_ms:.0f}ms")


def _submit_title_generation(session_id: str, first_message: str) -> None:
    def _task():
        try:
            title = groq_service.generate_title(first_message)
            supabase_service.update_chat_session(session_id, {"title": title})
        except Exception as e:
            logger.debug(f"Title generation failed: {e}")

    try:
        _TITLE_EXECUTOR.submit(_task)
    except Exception:
        pass


def retrieve_context(query: str, top_k: int = 5) -> list[dict]:
    """Embed query and retrieve top-k matching document chunks.

    Args:
        query: The user's question.
        top_k: Number of chunks to retrieve.

    Returns:
        List of chunk dicts with content, metadata, and similarity.
    """
    start = time.perf_counter()
    query_embedding = embedding_service.encode(query)
    _maybe_log_slow("embed_query", start)

    start = time.perf_counter()
    chunks = supabase_service.match_document_chunks(
        query_embedding=query_embedding,
        match_count=top_k,
        min_similarity=0.0,
    )
    _maybe_log_slow("match_document_chunks", start)
    return chunks


def build_context_string(chunks: list[dict]) -> str:
    """Format retrieved chunks into a context string for the LLM prompt."""
    if not chunks:
        return "No relevant documents found."

    context_parts = []
    total_chars = 0
    for i, chunk in enumerate(chunks, 1):
        meta = chunk.get("metadata", {})
        doc_title = meta.get("document_title", "Unknown Document")
        page = meta.get("page_number", "?")
        similarity = chunk.get("similarity", 0)
        content = (chunk.get("content") or "")
        if len(content) > _MAX_CHUNK_CHARS:
            content = content[:_MAX_CHUNK_CHARS] + "…"

        block = (
            f"[Source {i}: {doc_title}, Page {page} (relevance: {similarity:.2f})]\n{content}"
        )

        if total_chars + len(block) > _MAX_CONTEXT_CHARS:
            break
        context_parts.append(block)
        total_chars += len(block)

    return "\n\n---\n\n".join(context_parts)


def build_sources(chunks: list[dict]) -> list[dict]:
    """Extract source citation data from chunks."""
    sources = []
    seen = set()
    for chunk in chunks:
        meta = chunk.get("metadata", {})
        doc_id = str(chunk.get("document_id", ""))
        chunk_id = str(chunk.get("id", ""))
        key = f"{doc_id}:{meta.get('page_number', 0)}"

        if key not in seen:
            seen.add(key)
            sources.append({
                "document_id": doc_id,
                "chunk_id": chunk_id,
                "title": meta.get("document_title", "Unknown"),
                "page": meta.get("page_number"),
                "similarity": chunk.get("similarity", 0),
            })

    return sources


def generate_answer(query: str, session_id: str | None, user_id: str) -> dict:
    """Full RAG pipeline: retrieve → build prompt → generate → save.

    Args:
        query: The user's question.
        session_id: Optional existing session ID. If None, creates a new session.
        user_id: The authenticated user's ID.

    Returns:
        Dict with 'answer', 'sources', and 'session_id'.
    """
    is_new_session = not session_id

    # Create session if needed
    if is_new_session:
        session = supabase_service.create_chat_session(user_id)
        session_id = session["id"]
        # Generate a nicer title asynchronously (don’t delay first response)
        _submit_title_generation(session_id, query)

    # Step 1: Retrieve context + history (parallel where helpful)
    if is_new_session:
        chunks = retrieve_context(query, _DEFAULT_TOP_K)
        history = []
    else:
        with ThreadPoolExecutor(max_workers=2) as executor:
            future_chunks = executor.submit(retrieve_context, query, _DEFAULT_TOP_K)
            future_history = executor.submit(supabase_service.get_recent_messages, session_id, 10)
            chunks = future_chunks.result()
            history = future_history.result()

    # Step 2: Build context string
    context_string = build_context_string(chunks)

    # Step 4: Build messages for LLM
    system_prompt = groq_service.RAG_SYSTEM_PROMPT.format(context=context_string)

    messages = []
    for msg in history:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": query})

    # Step 5: Generate response
    start = time.perf_counter()
    answer = groq_service.generate_response(messages, system_prompt)
    _maybe_log_slow("groq_generate_response", start, threshold_ms=1200)

    # Step 6: Build sources
    sources = build_sources(chunks)

    # Step 7: Save messages to database
    start = time.perf_counter()
    supabase_service.save_message(session_id, user_id, "user", query)
    supabase_service.save_message(session_id, user_id, "assistant", answer, sources=sources)
    _maybe_log_slow("db_save_messages", start)

    return {
        "answer": answer,
        "sources": sources,
        "session_id": session_id,
    }


def generate_answer_stream(query: str, session_id: str | None, user_id: str):
    """Streaming RAG pipeline. Yields tokens as they arrive.

    Yields:
        SSE-formatted strings with token data or metadata.
    """
    # Create session if needed
    if not session_id:
        session = supabase_service.create_chat_session(user_id)
        session_id = session["id"]
        _submit_title_generation(session_id, query)

    # Retrieve context
    chunks = retrieve_context(query, top_k=_DEFAULT_TOP_K)
    context_string = build_context_string(chunks)
    sources = build_sources(chunks)

    # Get history
    history = supabase_service.get_recent_messages(session_id, limit=10)
    system_prompt = groq_service.RAG_SYSTEM_PROMPT.format(context=context_string)

    messages = [{"role": msg["role"], "content": msg["content"]} for msg in history]
    messages.append({"role": "user", "content": query})

    # Save user message
    supabase_service.save_message(session_id, user_id, "user", query)

    # Send session_id and sources as first event
    yield f"data: {json.dumps({'type': 'meta', 'session_id': session_id, 'sources': sources})}\n\n"

    # Stream tokens
    full_answer = []
    for token in groq_service.generate_response_stream(messages, system_prompt):
        full_answer.append(token)
        yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"

    # Save assistant message
    final_answer = "".join(full_answer)
    supabase_service.save_message(session_id, user_id, "assistant", final_answer, sources=sources)

    # Send done event
    yield f"data: {json.dumps({'type': 'done'})}\n\n"
