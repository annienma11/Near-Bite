import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { analysis } = await request.json();

    const { data: products } = await supabase
      .from('products')
      .select('*');

    if (!products || products.length === 0) {
      return NextResponse.json({ recommendations: [] });
    }

    const productMap = new Map(products.map((p, i) => [p.id, { ...p, index: i }]));
    const productList = products.map((p, i) => 
      `${i + 1}. [${p.id}] ${p.name} - ${p.category} - ${p.material} - $${p.price}`
    ).join('\n');

    let recommendedIndices: number[] = [];

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Extract product IDs from the style analysis. Return ONLY the product IDs (UUIDs in brackets) as a comma-separated list.',
          },
          {
            role: 'user',
            content: `Analysis: ${analysis}\n\nExtract all product IDs mentioned. Return format: id1,id2,id3`,
          },
        ],
        max_tokens: 100,
      });

      const result = response.choices[0]?.message?.content || '';
      const extractedIds = result.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi) || [];
      recommendedIndices = extractedIds
        .map(id => productMap.get(id)?.index)
        .filter(idx => idx !== undefined) as number[];
    } catch (openaiError) {
      console.error('OpenAI failed, trying Gemini:', openaiError);

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(
        `Extract product IDs from: ${analysis}\n\nReturn only the UUIDs as comma-separated list.`
      );

      const text = result.response.text();
      const extractedIds = text.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi) || [];
      recommendedIndices = extractedIds
        .map(id => productMap.get(id)?.index)
        .filter(idx => idx !== undefined) as number[];
    }

    if (recommendedIndices.length === 0) {
      recommendedIndices = products
        .map((_, i) => i)
        .sort(() => Math.random() - 0.5)
        .slice(0, 6);
    }

    const recommendations = recommendedIndices.map(i => products[i]).filter(Boolean);

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Recommendation error:', error);
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 });
  }
}
