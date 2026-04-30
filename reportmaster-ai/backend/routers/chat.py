"""
ReportMaster AI — Chat Router
Chat sessions, messages, and RAG queries with SSE streaming.
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from starlette.concurrency import run_in_threadpool
from models.schemas import ChatQuery, ChatSessionCreate, ChatSessionUpdate
from services import supabase_service, rag_service
from routers.users import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["chat"])


async def require_approved(current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_approved"):
        raise HTTPException(status_code=403, detail="Account not approved yet.")
    return current_user


@router.post("/session")
async def create_session(
    data: ChatSessionCreate = ChatSessionCreate(),
    user: dict = Depends(require_approved),
):
    """Create a new chat session."""
    session = await run_in_threadpool(
        supabase_service.create_chat_session,
        user["id"],
        data.title or "New Conversation",
    )
    return {"session": session}


@router.get("/sessions")
async def list_sessions(user: dict = Depends(require_approved)):
    """List all chat sessions for the current user with last message preview."""
    sessions = await run_in_threadpool(supabase_service.get_chat_sessions, user["id"])
    return {"sessions": sessions}


@router.get("/session/{session_id}/messages")
async def get_messages(session_id: str, user: dict = Depends(require_approved)):
    """Get full message history for a session."""
    session = await run_in_threadpool(supabase_service.get_chat_session, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    if session.get("user_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Access denied.")

    messages = await run_in_threadpool(supabase_service.get_session_messages, session_id)
    return {"messages": messages, "session": session}


@router.post("/query")
async def chat_query(data: ChatQuery, user: dict = Depends(require_approved)):
    """Send a RAG query and get a response (non-streaming)."""
    if not data.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    if data.session_id:
        session = await run_in_threadpool(supabase_service.get_chat_session, data.session_id)
        if not session or session.get("user_id") != user["id"]:
            raise HTTPException(status_code=403, detail="Access denied to this session.")

    try:
        result = await run_in_threadpool(
            rag_service.generate_answer,
            data.question,
            data.session_id,
            user["id"],
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=429, detail=str(e))
    except Exception as e:
        logger.error(f"Chat query error: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")


@router.post("/query/stream")
async def chat_query_stream(data: ChatQuery, user: dict = Depends(require_approved)):
    """Send a RAG query and stream the response via SSE."""
    if not data.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    if data.session_id:
        session = await run_in_threadpool(supabase_service.get_chat_session, data.session_id)
        if not session or session.get("user_id") != user["id"]:
            raise HTTPException(status_code=403, detail="Access denied to this session.")

    try:
        return StreamingResponse(
            rag_service.generate_answer_stream(
                query=data.question,
                session_id=data.session_id,
                user_id=user["id"],
            ),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )
    except Exception as e:
        logger.error(f"Streaming error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/session/{session_id}")
async def delete_session(session_id: str, user: dict = Depends(require_approved)):
    """Delete a chat session and all its messages."""
    session = await run_in_threadpool(supabase_service.get_chat_session, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    if session.get("user_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Access denied.")

    success = await run_in_threadpool(supabase_service.delete_chat_session, session_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete session.")
    return {"message": "Session deleted."}


@router.patch("/session/{session_id}")
async def rename_session(
    session_id: str,
    data: ChatSessionUpdate,
    user: dict = Depends(require_approved),
):
    """Rename a chat session."""
    session = await run_in_threadpool(supabase_service.get_chat_session, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    if session.get("user_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Access denied.")

    result = await run_in_threadpool(supabase_service.update_chat_session, session_id, {"title": data.title})
    return {"session": result}
