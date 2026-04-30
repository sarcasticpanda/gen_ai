-- ============================================
-- ReportMaster AI — Database Schema
-- NOTE: This migration has already been run.
-- This file is kept for documentation only.
-- ============================================

-- Enable pgvector
create extension if not exists vector;

-- User profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text,
  role text not null default 'pending',
  is_approved boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Documents table
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  file_name text not null,
  file_path text not null,
  file_size bigint,
  mime_type text,
  uploaded_by uuid references public.profiles(id),
  is_active boolean default true,
  chunk_count int default 0,
  created_at timestamptz default now()
);

-- Document chunks with embeddings
create table public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.documents(id) on delete cascade,
  chunk_index int not null,
  content text not null,
  embedding vector(384),
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create index on public.document_chunks using hnsw (embedding vector_cosine_ops);

-- Chat sessions
create table public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text default 'New Conversation',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Chat messages
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.chat_sessions(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text not null,
  content text not null,
  sources jsonb default '[]',
  tokens_used int,
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

-- RLS Policies
create policy "Users see own profile" on public.profiles for select using (auth.uid() = id);
create policy "Admins see all profiles" on public.profiles for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Approved users see active documents" on public.documents for select using (
  is_active = true and exists (select 1 from public.profiles where id = auth.uid() and is_approved = true)
);
create policy "Admins manage documents" on public.documents for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Users manage own sessions" on public.chat_sessions for all using (auth.uid() = user_id);
create policy "Users manage own messages" on public.chat_messages for all using (auth.uid() = user_id);

-- Semantic search function
create or replace function match_document_chunks(
  query_embedding vector(384),
  match_count int default 5,
  min_similarity float default 0.3
)
returns table (id uuid, document_id uuid, content text, metadata jsonb, similarity float)
language plpgsql as $$
begin
  return query
  select dc.id, dc.document_id, dc.content, dc.metadata,
    1 - (dc.embedding <=> query_embedding) as similarity
  from public.document_chunks dc
  join public.documents d on d.id = dc.document_id
  where d.is_active = true and 1 - (dc.embedding <=> query_embedding) > min_similarity
  order by dc.embedding <=> query_embedding
  limit match_count;
end;
$$;
