import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getUserContext, getAllProducts } from '@/lib/ai-context';
import { generateImageEmbedding, findSimilarProducts } from '@/lib/visual-search';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { image, userId, userContext: contextText } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }
    
    let similarProducts = [];
    try {
      const { embedding, description } = await generateImageEmbedding(image, 'Analyze for jewelry style matching');
      similarProducts = await findSimilarProducts(embedding, 20, 0.6);
    } catch (embError) {
      console.log('Embedding search failed, using all products:', embError);
    }
    
    const { data: allProductsData } = await supabase.from('products').select('*');
    const { data: embeddingsData } = await supabase
      .from('product_visual_embeddings')
      .select('product_id, visual_analysis');
    
    const embeddingMap = new Map(
      (embeddingsData || []).map((e: any) => [e.product_id, e.visual_analysis])
    );
    
    const productsWithVisuals = (allProductsData || []).map(p => {
      const visual = embeddingMap.get(p.id);
      return {
        ...p,
        visual: visual || {}
      };
    });
    
    const productList = productsWithVisuals.slice(0, 30).map(p => {
      const v = p.visual;
      return `${p.name} (${p.category}) - ${p.material} - $${p.price}${v.style ? ` - Style: ${v.style}` : ''}${v.metal_type ? ` - Metal: ${v.metal_type}` : ''}`;
    }).join('\n');

    const base64Data = image.split(',')[1];
    let analysis = '';

    const systemPrompt = `You are Paris, a professional fashion stylist with expertise in men's and women's jewelry styling.

USER'S REQUEST: "${contextText || 'Recommend jewelry for this look'}"

AVAILABLE PRODUCTS (USE EXACT NAMES):
${productList}

RULES:
1. ONLY recommend products from the list above using EXACT product names
2. Describe the photo (who, what they're wearing, occasion)
3. Recommend EXACTLY 2 products that exist in the list
4. Men: watches, rings, bracelets only
5. Women: any jewelry category
6. Match metals to skin tone and outfit
7. Consider formality and occasion

Format: Describe photo, then recommend 2 products with reasoning.`;

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      const result = await model.generateContent([
        systemPrompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg',
          },
        },
        contextText || 'Analyze my style from this photo and recommend 2 perfect jewelry pieces.'
      ]);

      analysis = result.response.text();
    } catch (geminiError) {
      console.error('Gemini failed, trying OpenAI:', geminiError);

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `${contextText || 'Analyze my style from this photo and recommend 2 perfect jewelry pieces.'}`,
              },
              {
                type: 'image_url',
                image_url: { url: image },
              },
            ],
          },
        ],
        max_tokens: 400,
      });

      analysis = response.choices[0]?.message?.content || '';
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Style analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze style' }, { status: 500 });
  }
}
