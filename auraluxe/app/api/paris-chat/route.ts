import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getAllProducts } from '@/lib/ai-context';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages, userId, imageContext } = await request.json();

    const products = await getAllProducts();
    
    const { data: embeddings } = await supabase
      .from('product_visual_embeddings')
      .select('product_id, visual_analysis')
      .limit(50);
    
    const embeddingMap = new Map(
      (embeddings || []).map((e: any) => [e.product_id, e.visual_analysis])
    );
    
    const productContext = products.slice(0, 50).map((p: any) => {
      const visual = embeddingMap.get(p.id);
      return `${p.name} - ${p.category || 'N/A'} - ${p.material || 'N/A'} - $${p.price}${visual ? ` - Style: ${visual.style} - Colors: ${visual.dominant_colors?.join(', ')}` : ''}`;
    }).join('\n');

    const lastUserMessage = messages[messages.length - 1]?.content || '';
    
    const systemMessage = imageContext 
      ? `CHAT MODE - Answer the question briefly. DO NOT repeat any previous analysis.

User's question: ${lastUserMessage}

Products available:
${productContext}

Respond in under 300 chars. If asking about watches: "I'd suggest [Name 1] and [Name 2]!" Never mention IDs.`
      : `You are Paris. Brief responses under 300 chars.

Products:
${productContext}

Recommend 2 products max. No IDs.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        ...messages.slice(-10),
      ],
      max_tokens: imageContext ? 100 : 250,
      temperature: 0.7,
    });

    const message = response.choices[0].message.content;

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Paris chat error:', error);
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
  }
}
