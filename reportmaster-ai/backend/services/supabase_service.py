"""
ReportMaster AI — Supabase Service
Wrapper around Supabase SDK for all database operations.
"""

from models.database import supabase_admin
import logging
import time
from datetime import datetime, timedelta, timezone

logger = logging.getLogger(__name__)


_ANALYTICS_CACHE_TTL_SECONDS = 20
_analytics_cache: dict[str, tuple[float, dict]] = {}


# ==================== PROFILES ====================

def get_profile(user_id: str) -> dict | None:
    result = supabase_admin.table("profiles").select("*").eq("id", user_id).execute()
    return result.data[0] if result.data else None


def get_profile_by_email(email: str) -> dict | None:
    result = supabase_admin.table("profiles").select("*").eq("email", email).execute()
    return result.data[0] if result.data else None


def create_profile(user_id: str, email: str, full_name: str, role: str = "pending") -> dict:
    data = {
        "id": user_id,
        "email": email,
        "full_name": full_name,
        "role": role,
        "is_approved": role == "admin",
    }
    result = supabase_admin.table("profiles").insert(data).execute()
    return result.data[0] if result.data else data


def update_profile(user_id: str, updates: dict) -> dict | None:
    result = supabase_admin.table("profiles").update(updates).eq("id", user_id).execute()
    return result.data[0] if result.data else None


def list_pending_users() -> list[dict]:
    result = supabase_admin.table("profiles").select("*").eq("role", "pending").eq("is_approved", False).execute()
    return result.data or []


def list_all_users() -> list[dict]:
    result = supabase_admin.table("profiles").select("*").order("created_at", desc=True).execute()
    return result.data or []


def approve_user(user_id: str) -> dict | None:
    return update_profile(user_id, {"role": "user", "is_approved": True})


def reject_user(user_id: str) -> bool:
    try:
        supabase_admin.table("profiles").delete().eq("id", user_id).execute()
        supabase_admin.auth.admin.delete_user(user_id)
        return True
    except Exception as e:
        logger.error(f"Error rejecting user {user_id}: {e}")
        return False


def delete_user(user_id: str) -> bool:
    try:
        supabase_admin.table("profiles").delete().eq("id", user_id).execute()
        supabase_admin.auth.admin.delete_user(user_id)
        return True
    except Exception as e:
        logger.error(f"Error deleting user {user_id}: {e}")
        return False


# ==================== DOCUMENTS ====================

def create_document(data: dict) -> dict:
    result = supabase_admin.table("documents").insert(data).execute()
    return result.data[0] if result.data else data


def list_documents(active_only: bool = True) -> list[dict]:
    query = supabase_admin.table("documents").select("*").order("created_at", desc=True)
    if active_only:
        query = query.eq("is_active", True)
    result = query.execute()
    return result.data or []


def get_document(doc_id: str) -> dict | None:
    result = supabase_admin.table("documents").select("*").eq("id", doc_id).execute()
    return result.data[0] if result.data else None


def soft_delete_document(doc_id: str) -> bool:
    try:
        supabase_admin.table("documents").update({"is_active": False}).eq("id", doc_id).execute()
        return True
    except Exception as e:
        logger.error(f"Error deleting document {doc_id}: {e}")
        return False


def update_document_chunk_count(doc_id: str, count: int) -> None:
    supabase_admin.table("documents").update({"chunk_count": count}).eq("id", doc_id).execute()


# ==================== DOCUMENT CHUNKS ====================

def insert_chunks(chunks: list[dict]) -> None:
    if not chunks:
        return
    batch_size = 100
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        supabase_admin.table("document_chunks").insert(batch).execute()


def get_chunk_count(doc_id: str) -> int:
    result = supabase_admin.table("document_chunks").select("id", count="exact").eq("document_id", doc_id).execute()
    return result.count or 0


def match_document_chunks(query_embedding: list[float], match_count: int = 5, min_similarity: float = 0.3) -> list[dict]:
    result = supabase_admin.rpc("match_document_chunks", {
        "query_embedding": query_embedding,
        "match_count": match_count,
        "min_similarity": min_similarity,
    }).execute()
    return result.data or []


# ==================== CHAT SESSIONS ====================

def create_chat_session(user_id: str, title: str = "New Conversation") -> dict:
    data = {"user_id": user_id, "title": title}
    result = supabase_admin.table("chat_sessions").insert(data).execute()
    return result.data[0] if result.data else data


def get_chat_sessions(user_id: str) -> list[dict]:
    # Try to fetch sessions with an embedded, single last message per session (avoids N+1).
    # If the PostgREST embedded limit/order options are unsupported, fall back to the legacy approach.
    try:
        result = (
            supabase_admin
            .table("chat_sessions")
            .select("*, chat_messages(content, role, created_at)")
            .eq("user_id", user_id)
            .order("updated_at", desc=True)
            .order("created_at", desc=True, foreign_table="chat_messages")
            .limit(1, foreign_table="chat_messages")
            .execute()
        )
        sessions = result.data or []
        for session in sessions:
            msgs = session.get("chat_messages") or []
            session["last_message"] = msgs[0]["content"][:100] if msgs else None
            session.pop("chat_messages", None)
        return sessions
    except Exception as e:
        logger.warning(f"Optimized get_chat_sessions failed, falling back: {e}")

    result = supabase_admin.table("chat_sessions").select("*").eq("user_id", user_id).order("updated_at", desc=True).execute()
    sessions = result.data or []
    # Legacy fallback (N+1) — cap per-session lookups to keep worst-case latency bounded.
    max_preview_sessions = 25
    for session in sessions[:max_preview_sessions]:
        msgs = supabase_admin.table("chat_messages").select("content, role").eq("session_id", session["id"]).order("created_at", desc=True).limit(1).execute()
        session["last_message"] = msgs.data[0]["content"][:100] if msgs.data else None
    for session in sessions[max_preview_sessions:]:
        session["last_message"] = None
    return sessions


def get_chat_session(session_id: str) -> dict | None:
    result = supabase_admin.table("chat_sessions").select("*").eq("id", session_id).execute()
    return result.data[0] if result.data else None


def update_chat_session(session_id: str, updates: dict) -> dict | None:
    result = supabase_admin.table("chat_sessions").update(updates).eq("id", session_id).execute()
    return result.data[0] if result.data else None


def delete_chat_session(session_id: str) -> bool:
    try:
        supabase_admin.table("chat_sessions").delete().eq("id", session_id).execute()
        return True
    except Exception as e:
        logger.error(f"Error deleting session {session_id}: {e}")
        return False


# ==================== CHAT MESSAGES ====================

def save_message(session_id: str, user_id: str, role: str, content: str, sources: list = None, tokens_used: int = None) -> dict:
    data = {
        "session_id": session_id,
        "user_id": user_id,
        "role": role,
        "content": content,
        "sources": sources or [],
        "tokens_used": tokens_used,
    }
    result = supabase_admin.table("chat_messages").insert(data).execute()
    supabase_admin.table("chat_sessions").update({"updated_at": "now()"}).eq("id", session_id).execute()
    return result.data[0] if result.data else data


def get_session_messages(session_id: str, limit: int = 100) -> list[dict]:
    result = supabase_admin.table("chat_messages").select("*").eq("session_id", session_id).order("created_at").limit(limit).execute()
    return result.data or []


def get_recent_messages(session_id: str, limit: int = 10) -> list[dict]:
    result = supabase_admin.table("chat_messages").select("role, content").eq("session_id", session_id).order("created_at", desc=True).limit(limit).execute()
    messages = result.data or []
    messages.reverse()
    return messages


# ==================== ANALYTICS ====================

def get_analytics(period: str = "7d") -> dict:
    now_ts = time.time()
    cached = _analytics_cache.get(period)
    if cached and (now_ts - cached[0]) < _ANALYTICS_CACHE_TTL_SECONDS:
        return cached[1]

    docs = supabase_admin.table("documents").select("id", count="exact").eq("is_active", True).execute()
    users = supabase_admin.table("profiles").select("id", count="exact").eq("is_approved", True).execute()
    pending = supabase_admin.table("profiles").select("id", count="exact").eq("role", "pending").execute()
    queries = supabase_admin.table("chat_messages").select("id", count="exact").eq("role", "user").execute()

    recent_questions = supabase_admin.table("chat_messages").select("content, created_at, user_id").eq("role", "user").order("created_at", desc=True).limit(10).execute()

    # Buckets for the requested period (24h => hourly; 7d/30d => daily).
    now = datetime.now(timezone.utc)
    if period == "24h":
        bucket_hours = 24
        start = now - timedelta(hours=bucket_hours)
        key_to_label: dict[str, str] = {}
        labels_in_order: list[str] = []
        for i in range(bucket_hours):
            dt = start + timedelta(hours=i + 1)
            key = dt.strftime("%Y-%m-%dT%H")
            label = dt.strftime("%H:00")
            key_to_label[key] = label
            labels_in_order.append(label)
        recent_all = (
            supabase_admin
            .table("chat_messages")
            .select("created_at")
            .eq("role", "user")
            .gte("created_at", start.isoformat())
            .execute()
        )
        counts = {label: 0 for label in labels_in_order}
        for msg in (recent_all.data or []):
            created_at = msg.get("created_at")
            if not created_at:
                continue
            label = key_to_label.get(created_at[:13])
            if label is not None:
                counts[label] += 1
        queries_per_day = [{"day": label, "count": counts[label]} for label in labels_in_order]

    else:
        days = 7 if period == "7d" else 30
        start = now - timedelta(days=days)
        key_to_label = {}
        labels_in_order = []
        for i in range(days):
            dt = (start + timedelta(days=i + 1)).date()
            key = dt.strftime("%Y-%m-%d")
            label = dt.strftime("%a") if days == 7 else dt.strftime("%b %d")
            key_to_label[key] = label
            labels_in_order.append(label)
        recent_all = (
            supabase_admin
            .table("chat_messages")
            .select("created_at")
            .eq("role", "user")
            .gte("created_at", start.isoformat())
            .execute()
        )
        counts = {label: 0 for label in labels_in_order}
        for msg in (recent_all.data or []):
            created_at = msg.get("created_at")
            if not created_at:
                continue
            label = key_to_label.get(created_at[:10])
            if label is not None:
                counts[label] += 1
        queries_per_day = [{"day": label, "count": counts[label]} for label in labels_in_order]

    payload = {
        "total_docs": docs.count or 0,
        "total_users": users.count or 0,
        "pending_approvals": pending.count or 0,
        "total_queries": queries.count or 0,
        "top_questions": [{"content": q["content"][:100], "created_at": q["created_at"]} for q in (recent_questions.data or [])],
        "queries_per_day": queries_per_day,
        "queries_by_document": [],
        "user_activity": [],
    }

    _analytics_cache[period] = (now_ts, payload)
    return payload


# ==================== STORAGE ====================

def upload_file_to_storage(file_bytes: bytes, file_path: str, content_type: str) -> str:
    supabase_admin.storage.from_("documents").upload(file_path, file_bytes, {"content-type": content_type})
    public_url = supabase_admin.storage.from_("documents").get_public_url(file_path)
    return public_url
