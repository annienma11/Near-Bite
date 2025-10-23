import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateImageEmbedding(imageUrl: string, context?: string) {
  const visionResponse = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Describe this image focusing on: colors, style, formality, materials, design elements. Be concise.',
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: context || 'Describe this image for jewelry matching' },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      },
    ],
    max_tokens: 150,
  });

  const description = visionResponse.choices[0]?.message?.content || '';

  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: description,
  });

  return {
    embedding: embeddingResponse.data[0].embedding,
    description,
  };
}

export async function findSimilarProducts(embedding: number[], limit: number = 10, threshold: number = 0.7) {
  const { data, error } = await supabase.rpc('match_products_by_style', {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: limit,
  });

  if (error) {
    console.error('Similarity search error:', error);
    return [];
  }

  const productIds = data.map((d: any) => d.product_id);
  
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .in('id', productIds);

  return products || [];
}
