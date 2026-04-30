"""
ReportMaster AI — Document Processor
Handles PDF, DOCX, TXT file text extraction and chunking.
"""

import fitz  # PyMuPDF
from docx import Document as DocxDocument
import tiktoken
import logging
from typing import BinaryIO

logger = logging.getLogger(__name__)

# Initialize tokenizer for chunking
_encoding = tiktoken.get_encoding("cl100k_base")


def extract_text_from_pdf(file_bytes: bytes) -> list[dict]:
    """Extract text from PDF file, returning text per page.

    Args:
        file_bytes: Raw bytes of the PDF file.

    Returns:
        List of dicts with 'text' and 'page_number' keys.
    """
    pages = []
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text").strip()
            if text:
                pages.append({
                    "text": text,
                    "page_number": page_num + 1
                })
        doc.close()
    except Exception as e:
        logger.error(f"Error extracting PDF text: {e}")
        raise

    return pages


def extract_text_from_docx(file_bytes: bytes) -> list[dict]:
    """Extract text from DOCX file.

    Args:
        file_bytes: Raw bytes of the DOCX file.

    Returns:
        List of dicts with 'text' and 'page_number' keys.
    """
    import io
    try:
        doc = DocxDocument(io.BytesIO(file_bytes))
        full_text = []
        for para in doc.paragraphs:
            if para.text.strip():
                full_text.append(para.text.strip())

        # DOCX doesn't have page numbers, treat as single page
        combined = "\n".join(full_text)
        if combined:
            return [{"text": combined, "page_number": 1}]
        return []
    except Exception as e:
        logger.error(f"Error extracting DOCX text: {e}")
        raise


def extract_text_from_txt(file_bytes: bytes) -> list[dict]:
    """Extract text from TXT file.

    Args:
        file_bytes: Raw bytes of the TXT file.

    Returns:
        List of dicts with 'text' and 'page_number' keys.
    """
    try:
        text = file_bytes.decode("utf-8", errors="ignore").strip()
        if text:
            return [{"text": text, "page_number": 1}]
        return []
    except Exception as e:
        logger.error(f"Error extracting TXT text: {e}")
        raise


def extract_text(file_bytes: bytes, file_name: str) -> list[dict]:
    """Extract text from a file based on its extension.

    Args:
        file_bytes: Raw bytes of the file.
        file_name: Original filename to determine format.

    Returns:
        List of dicts with 'text' and 'page_number' keys.

    Raises:
        ValueError: If file format is unsupported.
    """
    ext = file_name.rsplit(".", 1)[-1].lower() if "." in file_name else ""

    if ext == "pdf":
        return extract_text_from_pdf(file_bytes)
    elif ext == "docx":
        return extract_text_from_docx(file_bytes)
    elif ext == "txt":
        return extract_text_from_txt(file_bytes)
    else:
        raise ValueError(f"Unsupported file format: .{ext}")


def chunk_text(
    pages: list[dict],
    document_title: str,
    chunk_size: int = 500,
    chunk_overlap: int = 50
) -> list[dict]:
    """Split extracted text into overlapping chunks using tiktoken tokenizer.

    Args:
        pages: List of page dicts with 'text' and 'page_number'.
        document_title: Title of the source document.
        chunk_size: Maximum tokens per chunk (default 500).
        chunk_overlap: Number of overlapping tokens between chunks (default 50).

    Returns:
        List of dicts with 'content' and 'metadata' keys.
    """
    chunks = []
    chunk_index = 0

    for page in pages:
        text = page["text"]
        page_number = page["page_number"]

        # Tokenize the page text
        tokens = _encoding.encode(text)

        # Slide through tokens with overlap
        start = 0
        while start < len(tokens):
            end = min(start + chunk_size, len(tokens))
            chunk_tokens = tokens[start:end]
            chunk_text_decoded = _encoding.decode(chunk_tokens)

            if chunk_text_decoded.strip():
                chunks.append({
                    "content": chunk_text_decoded.strip(),
                    "metadata": {
                        "page_number": page_number,
                        "document_title": document_title,
                        "chunk_index": chunk_index
                    }
                })
                chunk_index += 1

            # Move forward by chunk_size - overlap
            start += chunk_size - chunk_overlap

            # Prevent infinite loop on very small texts
            if end == len(tokens):
                break

    logger.info(f"Document '{document_title}' chunked into {len(chunks)} chunks.")
    return chunks


def process_document(file_bytes: bytes, file_name: str, document_title: str) -> list[dict]:
    """Full pipeline: extract text → chunk → return ready for embedding.

    Args:
        file_bytes: Raw bytes of the uploaded file.
        file_name: Original filename.
        document_title: Display title of the document.

    Returns:
        List of chunk dicts with 'content' and 'metadata' keys.

    Raises:
        ValueError: If no text could be extracted (e.g., scanned PDF).
    """
    pages = extract_text(file_bytes, file_name)

    if not pages:
        raise ValueError(
            "No extractable text found in this file. "
            "If this is a scanned PDF, please use an OCR tool first."
        )

    total_text = sum(len(p["text"]) for p in pages)
    logger.info(f"Extracted {len(pages)} pages, {total_text} chars from '{file_name}'")

    chunks = chunk_text(pages, document_title)

    if not chunks:
        raise ValueError("Document produced no chunks after processing.")

    return chunks
