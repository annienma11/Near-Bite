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
    const { question, imageAnalysis } = await request.json();

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
      return `${p.name} - ${p.category || 'N/A'} - ${p.material || 'N/A'} - $${p.price}${visual ? ` - ${visual.style}` : ''}`;
    }).join('\n');

    const systemMessage = `You are Paris, a friendly jewelry stylist. Answer questions briefly (under 300 chars).

CONTEXT: User already got style analysis. They saw: ${imageAnalysis ? imageAnalysis.substring(0, 200) : 'jewelry recommendations'}

PRODUCTS:
${productContext}

RULES:
- Answer their question directly
- Recommend 2 products max
- Use product names only (no IDs)
- Be brief and friendly
- If asking about watches/items for someone else, suggest appropriate products`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: question }
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    const message = response.choices[0].message.content;

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Paris chat error:', error);
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
  }
}
