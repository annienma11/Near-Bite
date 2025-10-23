import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json();

    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (!product || !product.image_urls || product.image_urls.length === 0) {
      return NextResponse.json({ error: 'Product or images not found' }, { status: 404 });
    }

    const imageUrl = product.image_urls[0];

    const visionResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Analyze this jewelry image using fashion principles. Extract:
- dominant_colors: array of main colors
- metal_type: gold/silver/rose_gold/platinum/mixed
- style: classic/modern/bohemian/minimalist/statement
- formality: casual/semi_formal/formal/luxury
- suitable_skin_tones: array from [warm, cool, neutral]
- design_elements: array of design features
- occasion: array of suitable occasions
- face_shapes: array of suitable face shapes (if earrings)
- description: brief fashion-focused description

Return ONLY valid JSON.`,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: `Analyze: ${product.name} - ${product.category}` },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
      max_tokens: 300,
    });

    const analysisText = visionResponse.choices[0]?.message?.content || '{}';
    const visualAnalysis = JSON.parse(analysisText);

    const embeddingText = `${product.name} ${product.category} ${product.material} ${visualAnalysis.description || ''} ${visualAnalysis.style || ''} ${visualAnalysis.metal_type || ''}`;
    
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: embeddingText,
    });

    const embedding = embeddingResponse.data[0].embedding;

    const { error } = await supabase
      .from('product_visual_embeddings')
      .upsert({
        product_id: productId,
        image_url: imageUrl,
        embedding: embedding,
        visual_analysis: visualAnalysis,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'product_id,image_url'
      });

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      productId,
      visualAnalysis 
    });
  } catch (error) {
    console.error('Process product image error:', error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}
