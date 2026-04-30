import os
import sys
import logging
from services.rag_service import generate_answer, retrieve_context

logging.basicConfig(level=logging.INFO)

print("Testing retrieval...")
chunks = retrieve_context("What is the policy?", top_k=5)
print(f"Retrieved chunks: {len(chunks)}")

if chunks:
    print("Testing generate_answer...")
    result = generate_answer("What is the policy?", None, "00000000-0000-0000-0000-000000000000")
    print(result["answer"])
    print("Sources:", result["sources"])
else:
    print("No chunks retrieved.")

