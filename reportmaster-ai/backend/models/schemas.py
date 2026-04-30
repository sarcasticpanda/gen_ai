"""
ReportMaster AI — Pydantic Schemas
All request/response models for the API.
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


# ==================== AUTH ====================

class UserSignup(BaseModel):
    email: str
    password: str
    full_name: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserProfile(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    role: str = "pending"
    is_approved: bool = False
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: UserProfile


# ==================== DOCUMENTS ====================

class DocumentResponse(BaseModel):
    id: str
    title: str
    file_name: str
    file_path: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    uploaded_by: Optional[str] = None
    is_active: bool = True
    chunk_count: int = 0
    created_at: Optional[str] = None


class DocumentChunkStats(BaseModel):
    document_id: str
    chunk_count: int
    title: str


# ==================== CHAT ====================

class ChatSessionCreate(BaseModel):
    title: Optional[str] = "New Conversation"


class ChatSessionResponse(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    last_message: Optional[str] = None


class ChatSessionUpdate(BaseModel):
    title: str


class ChatQuery(BaseModel):
    question: str
    session_id: Optional[str] = None


class ChatMessageResponse(BaseModel):
    id: str
    session_id: str
    user_id: str
    role: str
    content: str
    sources: Optional[list] = []
    tokens_used: Optional[int] = None
    created_at: Optional[str] = None


class SourceChip(BaseModel):
    document_id: str
    chunk_id: str
    title: str
    page: Optional[int] = None
    similarity: Optional[float] = None


class ChatAnswer(BaseModel):
    answer: str
    sources: list[SourceChip] = []
    session_id: str


# ==================== ADMIN ====================

class UserApproval(BaseModel):
    user_id: str


class AnalyticsResponse(BaseModel):
    total_docs: int = 0
    total_users: int = 0
    total_queries: int = 0
    pending_approvals: int = 0
    queries_per_day: list[dict] = []
    queries_by_document: list[dict] = []
    top_questions: list[dict] = []
    user_activity: list[dict] = []
