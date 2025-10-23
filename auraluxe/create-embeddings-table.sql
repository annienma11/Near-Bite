-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create user_behavior_embeddings table
CREATE TABLE IF NOT EXISTS user_behavior_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT, -- For guest users
  user_name TEXT,
  user_location TEXT,
  interaction_summary TEXT, -- Human-readable summary
  behavior_data JSONB, -- Structured behavior data
  embedding vector(1536), -- OpenAI embedding dimension
  preferences JSONB, -- Extracted preferences
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS user_behavior_embeddings_vector_idx 
ON user_behavior_embeddings USING ivfflat (embedding vector_cosine_ops);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_behavior_user_id ON user_behavior_embeddings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_session_id ON user_behavior_embeddings(session_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_updated ON user_behavior_embeddings(updated_at DESC);

-- Disable RLS for testing
ALTER TABLE user_behavior_embeddings DISABLE ROW LEVEL SECURITY;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_user_behavior_embeddings_updated_at
BEFORE UPDATE ON user_behavior_embeddings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
