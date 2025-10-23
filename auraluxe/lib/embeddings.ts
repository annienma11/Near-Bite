import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

export async function storeBehaviorEmbedding(data: {
  userId?: string;
  sessionId?: string;
  userName?: string;
  userLocation?: string;
  interactionSummary: string;
  behaviorData: any;
  preferences: any;
}) {
  const embedding = await generateEmbedding(data.interactionSummary);

  const { data: existing } = await supabase
    .from('user_behavior_embeddings')
    .select('id')
    .eq(data.userId ? 'user_id' : 'session_id', data.userId || data.sessionId)
    .single();

  if (existing) {
    await supabase
      .from('user_behavior_embeddings')
      .update({
        user_name: data.userName,
        user_location: data.userLocation,
        interaction_summary: data.interactionSummary,
        behavior_data: data.behaviorData,
        embedding,
        preferences: data.preferences,
      })
      .eq('id', existing.id);
  } else {
    await supabase.from('user_behavior_embeddings').insert({
      user_id: data.userId,
      session_id: data.sessionId,
      user_name: data.userName,
      user_location: data.userLocation,
      interaction_summary: data.interactionSummary,
      behavior_data: data.behaviorData,
      embedding,
      preferences: data.preferences,
    });
  }
}

export async function findSimilarBehaviors(queryText: string, limit: number = 5) {
  const queryEmbedding = await generateEmbedding(queryText);

  const { data } = await supabase.rpc('match_user_behaviors', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: limit,
  });

  return data || [];
}

export async function getUserBehaviorEmbedding(userId?: string, sessionId?: string) {
  const { data } = await supabase
    .from('user_behavior_embeddings')
    .select('*')
    .eq(userId ? 'user_id' : 'session_id', userId || sessionId)
    .single();

  return data;
}
