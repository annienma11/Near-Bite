-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create product_visual_embeddings table
CREATE TABLE IF NOT EXISTS public.product_visual_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  embedding VECTOR(1536),
  visual_analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_product_image UNIQUE(product_id, image_url)
);

-- Create index for fast similarity search
CREATE INDEX IF NOT EXISTS product_embeddings_vector_idx 
ON public.product_visual_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index on product_id for faster lookups
CREATE INDEX IF NOT EXISTS product_embeddings_product_id_idx 
ON public.product_visual_embeddings(product_id);

-- Function to search similar products by embedding
CREATE OR REPLACE FUNCTION match_products_by_style(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  product_id UUID,
  image_url TEXT,
  similarity FLOAT,
  visual_analysis JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pve.product_id,
    pve.image_url,
    1 - (pve.embedding <=> query_embedding) AS similarity,
    pve.visual_analysis
  FROM public.product_visual_embeddings pve
  WHERE 1 - (pve.embedding <=> query_embedding) > match_threshold
  ORDER BY pve.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Enable RLS
ALTER TABLE public.product_visual_embeddings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read embeddings
CREATE POLICY "Allow public read access" 
ON public.product_visual_embeddings 
FOR SELECT 
USING (true);

-- Policy: Only authenticated users can insert/update (for admin operations)
CREATE POLICY "Allow authenticated insert" 
ON public.product_visual_embeddings 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow authenticated update" 
ON public.product_visual_embeddings 
FOR UPDATE 
TO authenticated 
USING (true);

-- Add comment
COMMENT ON TABLE public.product_visual_embeddings IS 'Stores visual embeddings and fashion analysis for product images to enable AI-powered style matching';
