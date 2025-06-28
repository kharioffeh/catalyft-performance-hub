
-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create aria_docs table for storing documentation with embeddings
CREATE TABLE public.aria_docs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  source text NOT NULL, -- 'philosophy', 'faq', 'metrics', 'program'
  content_md text NOT NULL,
  embedding vector(1536), -- OpenAI ada-002 embeddings are 1536 dimensions
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create index for efficient vector similarity search
CREATE INDEX IF NOT EXISTS idx_aria_docs_embedding 
ON public.aria_docs USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Create index for filtering by source
CREATE INDEX IF NOT EXISTS idx_aria_docs_source ON public.aria_docs(source);

-- Enable Row Level Security
ALTER TABLE public.aria_docs ENABLE ROW LEVEL SECURITY;

-- Create policy - all authenticated users can read docs
CREATE POLICY "Authenticated users can read aria_docs" 
ON public.aria_docs 
FOR SELECT 
TO authenticated 
USING (true);

-- Create policy - only service role can insert/update docs
CREATE POLICY "Service role can manage aria_docs" 
ON public.aria_docs 
FOR ALL 
TO service_role 
USING (true);

-- Function to search similar documents
CREATE OR REPLACE FUNCTION public.search_similar_docs(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.8,
  match_count int DEFAULT 6
)
RETURNS TABLE (
  id uuid,
  title text,
  source text,
  content_md text,
  similarity float
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    aria_docs.id,
    aria_docs.title,
    aria_docs.source,
    aria_docs.content_md,
    1 - (aria_docs.embedding <=> query_embedding) AS similarity
  FROM aria_docs
  WHERE 1 - (aria_docs.embedding <=> query_embedding) > match_threshold
  ORDER BY aria_docs.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Grant permissions
GRANT SELECT ON public.aria_docs TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_similar_docs TO authenticated;
