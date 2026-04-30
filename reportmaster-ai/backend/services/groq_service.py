"""
ReportMaster AI — Groq LLM Service
Handles all interactions with the Groq API using the latest versatile models.
"""

from groq import Groq
from config import settings
import logging
import inspect

logger = logging.getLogger(__name__)


def _create_client() -> Groq:
    kwargs = {"api_key": settings.GROQ_API_KEY}
    try:
        sig = inspect.signature(Groq)
        if "timeout" in sig.parameters:
            kwargs["timeout"] = settings.GROQ_TIMEOUT_SECONDS
    except Exception:
        # If signature introspection fails, fall back to default constructor.
        pass
    return Groq(**kwargs)


_client = _create_client()

RAG_SYSTEM_PROMPT = """You are a warm, welcoming, and highly knowledgeable corporate assistant.
Your primary goal is to provide exquisitely detailed, polite, and comprehensive answers using only the provided corporate documents.

CRITICAL INSTRUCTIONS:
- WARMTH & POLITENESS: Write in an extremely polite, courteous, and professional conversational tone. Express gratitude for the question and offer further assistance at the end.
- NO MARKDOWN BOLDING: You are FORBIDDEN from using bold text, asterisks (**), or hashtags (#). Use simple paragraphs and bullet points (using dashes) only. Keep it clean and plain.
- DETAILED EXPLANATION: Do not just give a short answer. Provide a highly detailed and thorough explanation that flows naturally.
- CITATIONS: You must NOT use inline citations like [1] or (Page 5). Instead, place a single sentence at the very end of your response exactly like this:
  "Found on [Document Title], page [Page Number]."
- STRICT ACCURACY: Use only the provided context. If the information is missing, politely apologize and state that the information isn't available in the current documents.

CONTEXT FROM CORPORATE DOCUMENTS:
{context}
"""

TITLE_SYSTEM_PROMPT = "You are a concise title generator. Given a user message, generate a short title (5 words max). Return ONLY the title, nothing else."


def generate_response(messages: list[dict], system_prompt: str) -> str:
    try:
        full_messages = [{"role": "system", "content": system_prompt}] + messages
        chat_completion = _client.chat.completions.create(
            messages=full_messages,
            model=settings.GROQ_MODEL,
            temperature=0.3,
            max_tokens=settings.GROQ_MAX_TOKENS,
            top_p=0.9,
            stream=False,
        )
        return chat_completion.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Groq API error: {e}")
        error_text = str(e).lower()
        if "rate_limit" in error_text or "429" in error_text:
            raise ValueError("Rate limit reached. Please wait a moment and try again.")
        if "insufficient" in error_text or "quota" in error_text or "payment" in error_text or "credits" in error_text:
            raise ValueError("Groq quota/credits exhausted. Please top up or try again later.")
        raise


def generate_response_stream(messages: list[dict], system_prompt: str):
    try:
        full_messages = [{"role": "system", "content": system_prompt}] + messages
        stream = _client.chat.completions.create(
            messages=full_messages,
            model=settings.GROQ_MODEL,
            temperature=0.3,
            max_tokens=settings.GROQ_MAX_TOKENS,
            top_p=0.9,
            stream=True,
        )
        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    except Exception as e:
        logger.error(f"Groq streaming error: {e}")
        yield f"\n\nError: {str(e)}"


def generate_title(first_message: str) -> str:
    try:
        messages = [{"role": "user", "content": first_message}]
        title = generate_response(messages, TITLE_SYSTEM_PROMPT)
        words = title.split()
        if len(words) > 6:
            title = " ".join(words[:5])
        return title
    except Exception:
        return "New Conversation"
