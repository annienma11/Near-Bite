import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getUserContext, getAllProducts } from '@/lib/ai-context';
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
    const { userId, recentViews = [], favorites = [], cartItems = [] } = await request.json();

    const userContext = userId ? await getUserContext(userId) : null;
    const products = await getAllProducts();

    if (!products || products.length === 0) {
      return NextResponse.json({ recommendations: [] });
    }

    let viewedProducts: any[] = [];
    if (recentViews.length > 0) {
      const { data } = await supabase
        .from('products')
        .select('id, name, category, material, price')
        .in('id', recentViews);
      viewedProducts = data || [];
    }

    const viewedCategories = [...new Set(viewedProducts.map(p => p.category))];
    const viewedMaterials = [...new Set(viewedProducts.map(p => p.material))];
    const viewedPrices = viewedProducts.map(p => p.price);
    const avgPrice = viewedPrices.length > 0 ? viewedPrices.reduce((a, b) => a + b, 0) / viewedPrices.length : 0;

    const userBehavior = userContext ? 
      `Returning customer! Orders: ${userContext.totalOrders}. Favorite categories: ${userContext.favorites.map((f: any) => f.category).join(', ')}. Recently viewed categories: ${viewedCategories.join(', ')}. Cart: ${userContext.cart.map((c: any) => c.name).join(', ')}.` :
      viewedProducts.length > 0 ? `Guest browsing. STRONG PREFERENCE for: ${viewedCategories.join(', ')}. Materials: ${viewedMaterials.join(', ')}. Price range: $${Math.min(...viewedPrices)}-$${Math.max(...viewedPrices)} (avg: $${avgPrice.toFixed(0)}). Viewed: ${viewedProducts.map(p => p.name).join(', ')}.` :
      'New visitor - show diverse bestsellers.';
    
    const productList = products.map((p: any, i) => 
      `${i + 1}. ${p.name} - ${p.category || 'N/A'} - ${p.material || 'N/A'} - $${p.price}`
    ).join('\n');

    let recommendedIndices: number[] = [];

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are Auraluxe\'s AI recommendation engine. CRITICAL: When user views specific categories, PRIORITIZE those categories heavily (at least 5 out of 7 items). Match their viewed materials and price range closely. Only add 1-2 complementary items from other categories.',
          },
          {
            role: 'user',
            content: `Customer Profile:\n${userBehavior}\n\nAvailable Products:\n${productList}\n\nIMPORTANT: If customer viewed specific categories, recommend mostly from those categories. Select 7 product numbers (1-${products.length}). Return ONLY numbers separated by commas.`,
          },
        ],
        max_tokens: 50,
      });

      const result = response.choices[0]?.message?.content || '';
      recommendedIndices = result.split(',').map(n => parseInt(n.trim()) - 1).filter(n => !isNaN(n) && n >= 0 && n < products.length);
    } catch (openaiError) {
      console.error('OpenAI failed, trying Gemini:', openaiError);

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(
        `You are Auraluxe's AI. CRITICAL: Prioritize categories user viewed. Customer: ${userBehavior}\n\nProducts:\n${productList}\n\nIf user viewed specific categories, recommend 5-6 items from those categories, matching their price range and materials. Add only 1-2 complementary items. Select 7 numbers (1-${products.length}). Return ONLY numbers separated by commas.`
      );

      const text = result.response.text();
      recommendedIndices = text.split(',').map(n => parseInt(n.trim()) - 1).filter(n => !isNaN(n) && n >= 0 && n < products.length);
    }

    if (recommendedIndices.length < 7) {
      const remaining = Array.from({ length: products.length }, (_, i) => i)
        .filter(i => !recommendedIndices.includes(i))
        .slice(0, 7 - recommendedIndices.length);
      recommendedIndices = [...recommendedIndices, ...remaining];
    }

    const recommendations = recommendedIndices.slice(0, 7).map(i => products[i]);

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('AI recommendation error:', error);
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 });
  }
}
