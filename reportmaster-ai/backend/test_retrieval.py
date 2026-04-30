import os
from dotenv import load_dotenv
from services.embedding_service import encode
from services.supabase_service import match_document_chunks, supabase_admin

load_dotenv()

query = "What is the policy?"
print(f"Encoding query: '{query}'")
query_embedding = encode(query)
print(f"Embedding length: {len(query_embedding)}")

print("Calling match_document_chunks...")
try:
    chunks = match_document_chunks(query_embedding, match_count=5, min_similarity=-1.0)
    print(f"Found {len(chunks)} chunks.")
    for chunk in chunks:
        print(f"ID: {chunk.get('id')}, Similarity: {chunk.get('similarity')}")
except Exception as e:
    print(f"Error matching chunks: {e}")

# Check if chunks actually exist in DB
print("\nChecking raw table count...")
try:
    result = supabase_admin.table("document_chunks").select("id", count="exact").limit(1).execute()
    print(f"Total chunks in DB: {result.count}")
except Exception as e:
    print(f"Error counting chunks: {e}")
