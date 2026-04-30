"""
ReportMaster AI — Documents Router
Upload, list, and manage documents. Admin-only upload/delete.
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from starlette.concurrency import run_in_threadpool
from services import supabase_service, embedding_service, document_processor
from routers.users import get_current_user
from config import settings
import uuid
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/documents", tags=["documents"])


async def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    return current_user


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(None),
    admin: dict = Depends(require_admin),
):
    """Upload a document: store file → extract text → chunk → embed → save chunks."""

    # Validate file extension
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: .{ext}. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    # Read file bytes
    file_bytes = await file.read()

    # Validate file size
    if len(file_bytes) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {settings.MAX_FILE_SIZE // (1024*1024)}MB."
        )

    doc_title = title or file.filename.rsplit(".", 1)[0]

    try:
        # Step 1: Upload to Supabase Storage
        file_path = f"uploads/{uuid.uuid4()}_{file.filename}"
        content_type = file.content_type or "application/octet-stream"

        try:
            public_url = await run_in_threadpool(
                supabase_service.upload_file_to_storage,
                file_bytes,
                file_path,
                content_type,
            )
        except Exception as e:
            logger.error(f"Storage upload failed: {e}")
            public_url = file_path  # Fallback to path

        # Step 2: Create document record
        doc_data = {
            "title": doc_title,
            "file_name": file.filename,
            "file_path": file_path,
            "file_size": len(file_bytes),
            "mime_type": content_type,
            "uploaded_by": admin["id"],
            "is_active": True,
            "chunk_count": 0,
        }
        doc = await run_in_threadpool(supabase_service.create_document, doc_data)
        doc_id = doc["id"]

        # Step 3: Extract and chunk text
        try:
            chunks = await run_in_threadpool(
                document_processor.process_document,
                file_bytes,
                file.filename,
                doc_title,
            )
        except ValueError as e:
            # File had no extractable text
            return {
                "document": doc,
                "warning": str(e),
                "chunks_created": 0,
            }

        # Step 4: Generate embeddings
        texts = [c["content"] for c in chunks]
        embeddings = await run_in_threadpool(embedding_service.encode_batch, texts)

        # Step 5: Store chunks with embeddings
        chunk_records = []
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            chunk_records.append({
                "document_id": doc_id,
                "chunk_index": i,
                "content": chunk["content"],
                "embedding": embedding,
                "metadata": chunk["metadata"],
            })

        await run_in_threadpool(supabase_service.insert_chunks, chunk_records)

        # Step 6: Update chunk count
        await run_in_threadpool(supabase_service.update_document_chunk_count, doc_id, len(chunk_records))
        doc["chunk_count"] = len(chunk_records)

        return {
            "document": doc,
            "chunks_created": len(chunk_records),
            "message": f"Document '{doc_title}' processed successfully.",
        }

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")


@router.get("/")
async def list_documents(current_user: dict = Depends(get_current_user)):
    """List all active documents."""
    if not current_user.get("is_approved"):
        raise HTTPException(status_code=403, detail="Account not approved.")
    documents = await run_in_threadpool(supabase_service.list_documents, True)
    return {"documents": documents, "count": len(documents)}


@router.delete("/{doc_id}")
async def delete_document(doc_id: str, admin: dict = Depends(require_admin)):
    """Soft-delete a document (set is_active=false)."""
    doc = await run_in_threadpool(supabase_service.get_document, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    success = await run_in_threadpool(supabase_service.soft_delete_document, doc_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete document.")

    return {"message": f"Document '{doc.get('title', doc_id)}' deleted."}


@router.get("/{doc_id}/chunks")
async def get_document_chunks(doc_id: str, current_user: dict = Depends(get_current_user)):
    """Get chunk count and stats for a document."""
    doc = await run_in_threadpool(supabase_service.get_document, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    chunk_count = await run_in_threadpool(supabase_service.get_chunk_count, doc_id)
    return {
        "document_id": doc_id,
        "title": doc.get("title", ""),
        "chunk_count": chunk_count,
    }
