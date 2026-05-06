# 📊 ReportMaster AI — Intelligent Financial Reporting & Document RAG

> A production-grade Retrieval-Augmented Generation (RAG) platform for intelligent financial document analysis using semantic search and high-speed LLM inference.

---

# 🚀 Overview

ReportMaster AI enables users to upload complex financial documents and interact with them through an AI-powered chat interface.

The platform combines:
- Semantic Vector Search
- Retrieval-Augmented Generation (RAG)
- Groq-powered LLM inference
- Secure role-based access control
- Real-time streaming responses

Supported document formats:
- PDF
- DOCX
- TXT

---

# ✨ Key Features

## 🧠 AI-Powered Financial Chat
- Ask questions directly from uploaded reports
- Context-aware semantic retrieval
- Grounded AI responses with source citations

---

## 📚 Multi-Format Document Support
Supports:
- PDF
- DOCX
- TXT

Automatic preprocessing includes:
- Unicode normalization
- Noise reduction
- Clean text extraction

---

## 🔍 Semantic Vector Search
- Embedding-based retrieval
- Cosine similarity search
- Fast pgvector indexing

---

## 📌 Source Citations
Every response contains:
- Source filename
- Retrieved context references
- Page-level attribution (where available)

---

## ⚡ Real-Time Streaming Responses
- Server-Sent Events (SSE)
- Typewriter-style streaming generation
- Low-latency inference via Groq

---

## 🔐 Secure Admin Approval Workflow
New users:
1. Register
2. Enter waiting pool
3. Require admin approval
4. Gain dashboard access after approval

---

## 🎨 Modern Glassmorphic UI
- Responsive design
- Smooth animations
- Tailwind CSS + Shadcn UI
- Premium dashboard experience

---

# 🏗️ System Architecture

```text
                ┌──────────────────────┐
                │     User Uploads     │
                │ PDF / DOCX / TXT     │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ Document Extraction  │
                │ PyMuPDF / python-docx│
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ Semantic Chunking    │
                │ tiktoken (500 tokens)│
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ Embedding Generation │
                │ all-MiniLM-L6-v2     │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ pgvector Storage     │
                │ Supabase PostgreSQL  │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ Semantic Retrieval   │
                │ Cosine Similarity    │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ Groq LLM Generation  │
                │ Llama-3.3-70B        │
                └──────────────────────┘
```

---

# 🧠 Technical Deep Dive

# 1️⃣ Document Extraction Layer

## PDF Processing
- Library: `PyMuPDF (fitz)`
- Preserves structure and formatting markers

## DOCX Processing
- Library: `python-docx`
- Clean paragraph extraction

## TXT Processing
- UTF-8 stream processing

## Preprocessing
Includes:
- Unicode normalization
- Noise cleaning
- Control character removal

---

# 2️⃣ Token-Based Semantic Chunking

Instead of naive character splitting, ReportMaster AI uses token-aware chunking.

| Parameter | Value |
|---|---|
| Tokenizer | `cl100k_base` |
| Strategy | Sliding Window |
| Chunk Size | 500 Tokens |
| Overlap | 50 Tokens |

## Why Overlap Matters
The overlap preserves semantic continuity between chunks so important contextual information is not lost during retrieval.

---

# 3️⃣ Vector Intelligence & Similarity Search

## Embedding Model
`all-MiniLM-L6-v2`

### Why This Model?
- Lightweight
- Fast
- Strong semantic understanding
- 384-dimensional embeddings

---

## Vector Database
- PostgreSQL + pgvector
- Hosted on Supabase

---

## Similarity Metric
- Cosine Similarity

---

## Retrieval Pipeline

```text
User Query
    ↓
Convert Query → Embedding Vector
    ↓
Cosine Similarity Search
    ↓
Retrieve Top-K Chunks
    ↓
Inject Context Into Prompt
    ↓
LLM Generates Grounded Response
```

---

# 4️⃣ Groq-Powered Generation

## LLM Used
`llama-3.3-70b-versatile`

## Why This Model?
- 128K context window
- Extremely fast inference
- Strong reasoning performance

---

## Prompt Engineering Features
The system prompt enforces:
- Strict context grounding
- No hallucinated answers
- Source-aware generation
- Citation-based responses

---

## Streaming
Uses:
- Server-Sent Events (SSE)

Provides:
- Real-time token streaming
- Better UX responsiveness

---

# 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript |
| UI | Tailwind CSS, Shadcn UI |
| Backend | FastAPI, Uvicorn |
| Database | Supabase PostgreSQL + pgvector |
| Authentication | Supabase Auth |
| AI/ML | Groq, Sentence-Transformers, Tiktoken |
| Embeddings | all-MiniLM-L6-v2 |

---

# ⚙️ Quick Start Guide

# 1️⃣ Prerequisites

Install:
- Python 3.10+
- Node.js 18+
- Supabase Account
- Groq API Key

---

# 2️⃣ Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
```

## Activate Environment

### Windows
```bash
.\venv\Scripts\activate
```

### Mac/Linux
```bash
source venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Create `.env`

```env
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
GROQ_API_KEY=your_key
```

---

# 3️⃣ Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install
```

---

## Create `.env`

```env
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
VITE_API_BASE_URL=http://localhost:8000
```

---

# 4️⃣ Running The Project

## Backend

```bash
python main.py
```

Runs on:
```text
http://localhost:8000
```

---

## Frontend

```bash
npm run dev
```

Runs on:
```text
http://localhost:5173
```

---

# 🔐 Administrative Workflow

```text
User Signup
     ↓
Waiting Pool
     ↓
Admin Approval
     ↓
Dashboard Access
```

---

# 🧪 Test Credentials

| Role | Email | Password |
|---|---|---|
| Super Admin | clumsypanda6o9@gmail.com | ADMIN@1234 |
| System Admin | admin@reportmaster.ai | Admin@1234 |

---

# 📂 Project Structure

```text
ReportMaster-AI/
│
├── backend/
│   ├── main.py
│   ├── routes/
│   ├── services/
│   ├── rag/
│   ├── utils/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── package.json
│
└── README.md
```

---

# 📈 Future Improvements

- OCR support for scanned PDFs
- Hybrid Retrieval (BM25 + Vector Search)
- Multi-document conversational memory
- Financial chart extraction
- Role-based analytics dashboard
- Finance-specific embedding fine-tuning
- Agentic financial workflows

---

# 🧪 Production-Level Concepts Used

- Retrieval-Augmented Generation (RAG)
- Semantic Search
- Vector Databases
- Token-Aware Chunking
- Cosine Similarity
- Streaming AI Responses
- Prompt Grounding
- pgvector Indexing
- Access-Controlled Retrieval
- SSE Architecture

---

# 📜 License

MIT License

---

# 👨‍💻 Author

### Saubhagya Kashyap  
Operating as **Sarcastic Panda** 🐼
