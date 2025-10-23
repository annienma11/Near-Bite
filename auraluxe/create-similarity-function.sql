-- Create function for vector similarity search
CREATE OR REPLACE FUNCTION match_user_behaviors(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  session_id text,
  interaction_summary text,
  behavior_data jsonb,
  preferences jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    user_behavior_embeddings.id,
    user_behavior_embeddings.user_id,
    user_behavior_embeddings.session_id,
    user_behavior_embeddings.interaction_summary,
    user_behavior_embeddings.behavior_data,
    user_behavior_embeddings.preferences,
    1 - (user_behavior_embeddings.embedding <=> query_embedding) as similarity
  FROM user_behavior_embeddings
  WHERE 1 - (user_behavior_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY user_behavior_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
