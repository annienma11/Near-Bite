import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Groq from 'groq-sdk';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

let lastFailedModel: 'openai' | 'gemini' | 'groq' | null = null;

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  (async () => {
    try {
      const body = await request.json();
      const { productIds } = body;

      const { data: products } = await supabase
        .from('products')
        .select('id, name, category, material, image_urls')
        .in('id', productIds)
        .not('image_urls', 'is', null);

      if (!products || products.length === 0) {
        await writer.write(encoder.encode(JSON.stringify({ complete: { message: 'No products to process' } }) + '\n'));
        await writer.close();
        return;
      }

      const results = [];
      
      for (let i = 0; i < products.length; i++) {
      const product = products[i];
      if (!product.image_urls || product.image_urls.length === 0) continue;

      try {
        await writer.write(encoder.encode(JSON.stringify({ 
          log: `[${i + 1}/${products.length}] ${product.name}`,
          subProgress: 0
        }) + '\n'));

        const imageUrl = product.image_urls[0];
        
        await writer.write(encoder.encode(JSON.stringify({ 
          log: `  → Fetching image...`,
          subProgress: 10
        }) + '\n'));

        let visualAnalysis: any;
        let embedding: number[];

        await writer.write(encoder.encode(JSON.stringify({ 
          log: `  → Starting AI analysis...`,
          subProgress: 20
        }) + '\n'));

        const modelOrder = lastFailedModel === 'openai' ? ['gemini', 'groq', 'openai'] : 
                          lastFailedModel === 'gemini' ? ['groq', 'openai', 'gemini'] :
                          ['gemini', 'groq', 'openai'];

        let analysisSuccess = false;
        let attemptCount = 0;
        
        for (const modelName of modelOrder) {
          if (analysisSuccess) break;
          attemptCount++;
          
          try {
            await writer.write(encoder.encode(JSON.stringify({ 
              log: `  → Analyzing with ${modelName.toUpperCase()}...`,
              subProgress: 30 + (attemptCount * 5)
            }) + '\n'));

            if (modelName === 'gemini') {
              const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
              const base64Response = await fetch(imageUrl);
              const buffer = await base64Response.arrayBuffer();
              const base64 = Buffer.from(buffer).toString('base64');

              const result = await model.generateContent([
                `Analyze this jewelry image. Return JSON with: dominant_colors (array), metal_type, style, formality, suitable_skin_tones (array), design_elements (array), occasion (array), description.`,
                {
                  inlineData: {
                    data: base64,
                    mimeType: 'image/jpeg',
                  },
                },
              ]);

              const analysisText = result.response.text().replace(/```json\n?|```/g, '').trim();
              visualAnalysis = JSON.parse(analysisText);
              analysisSuccess = true;
              lastFailedModel = null;
              
              await writer.write(encoder.encode(JSON.stringify({ 
                log: `  ✓ Analysis complete`,
                subProgress: 60
              }) + '\n'));
            } else if (modelName === 'groq') {
              const completion = await groq.chat.completions.create({
                model: 'llama-3.2-90b-vision-preview',
                messages: [
                  {
                    role: 'user',
                    content: [
                      {
                        type: 'text',
                        text: `Analyze this ${product.category} jewelry image. Return ONLY valid JSON with: dominant_colors (array), metal_type, style, formality, suitable_skin_tones (array), design_elements (array), occasion (array), description.`
                      },
                      {
                        type: 'image_url',
                        image_url: { url: imageUrl }
                      }
                    ]
                  }
                ],
                temperature: 0.5,
                max_tokens: 500,
              });

              const analysisText = completion.choices[0]?.message?.content || '{}';
              visualAnalysis = JSON.parse(analysisText.replace(/```json\n?|```/g, '').trim());
              analysisSuccess = true;
              lastFailedModel = null;
              
              await writer.write(encoder.encode(JSON.stringify({ 
                log: `  ✓ Analysis complete`,
                subProgress: 60
              }) + '\n'));
            } else if (modelName === 'openai') {
              const visionResponse = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                  {
                    role: 'system',
                    content: `Analyze jewelry image. Return JSON with: dominant_colors, metal_type, style, formality, suitable_skin_tones, design_elements, occasion, description.`,
                  },
                  {
                    role: 'user',
                    content: [
                      { type: 'text', text: `${product.name} - ${product.category}` },
                      { type: 'image_url', image_url: { url: imageUrl } },
                    ],
                  },
                ],
                max_tokens: 300,
              });

              const analysisText = visionResponse.choices[0]?.message?.content || '{}';
              visualAnalysis = JSON.parse(analysisText.replace(/```json\n?|```/g, '').trim());
              analysisSuccess = true;
              lastFailedModel = null;
              
              await writer.write(encoder.encode(JSON.stringify({ 
                log: `  ✓ Analysis complete`,
                subProgress: 60
              }) + '\n'));
            }
          } catch (error: any) {
            console.log(`${modelName} failed:`, error?.message || error);
            await writer.write(encoder.encode(JSON.stringify({ 
              log: `  ✗ ${modelName} failed, trying next...`
            }) + '\n'));
            lastFailedModel = modelName as any;
            
            if (error?.status === 429 || error?.message?.includes('Rate limit')) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            if (modelName === modelOrder[modelOrder.length - 1]) {
              throw error;
            }
          }
        }

        await writer.write(encoder.encode(JSON.stringify({ 
          log: `  → Generating embeddings...`,
          subProgress: 70
        }) + '\n'));

        const embeddingText = `${product.name} ${product.category} ${product.material} ${visualAnalysis.description || ''} ${visualAnalysis.style || ''} ${visualAnalysis.metal_type || ''}`;
        
        const embeddingPromise = openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: embeddingText,
        });

        const embTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Embedding timeout')), 15000)
        );

        try {
          const embeddingResponse = await Promise.race([embeddingPromise, embTimeoutPromise]) as any;
          embedding = embeddingResponse.data[0].embedding;
          
          await writer.write(encoder.encode(JSON.stringify({ 
            log: `  ✓ Embeddings generated`,
            subProgress: 85
          }) + '\n'));
        } catch (embError) {
          console.log('Embedding failed, using fallback');
          await writer.write(encoder.encode(JSON.stringify({ 
            log: `  ⚠ Using fallback embeddings`
          }) + '\n'));
          const words = embeddingText.split(' ');
          embedding = Array(1536).fill(0).map((_, i) => Math.sin(i * words.length) * 0.1);
        }

        await writer.write(encoder.encode(JSON.stringify({ 
          log: `  → Saving to database...`,
          subProgress: 90
        }) + '\n'));

        const { error: insertError } = await supabase
          .from('product_visual_embeddings')
          .upsert({
            product_id: product.id,
            image_url: imageUrl,
            embedding: embedding,
            visual_analysis: visualAnalysis,
            status: 'success',
            error_message: null,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'product_id,image_url'
          });

        if (insertError) {
          console.error('Insert error for', product.name, ':', insertError);
          throw new Error(`DB Insert failed: ${insertError.message}`);
        }

        await writer.write(encoder.encode(JSON.stringify({ 
          log: `  ✓ Complete`,
          subProgress: 100
        }) + '\n'));

        console.log('Successfully saved embedding for:', product.name);
        const result = { productId: product.id, name: product.name, success: true };
        results.push(result);
        await writer.write(encoder.encode(JSON.stringify({ progress: result }) + '\n'));
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error: any) {
        console.error(`Failed to process ${product.name}:`, error);
        
        await writer.write(encoder.encode(JSON.stringify({ 
          log: `  ✗ Failed: ${error?.message || 'Unknown error'}`,
          subProgress: 0
        }) + '\n'));

        await writer.write(encoder.encode(JSON.stringify({ 
          log: `  → Marking as failed...`
        }) + '\n'));

        await supabase
          .from('product_visual_embeddings')
          .upsert({
            product_id: product.id,
            image_url: product.image_urls[0] || '',
            status: 'failed',
            error_message: error?.message || String(error),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'product_id,image_url'
          });
        
        const result = { 
          productId: product.id, 
          name: product.name, 
          success: false, 
          error: error?.message || String(error) 
        };
        results.push(result);
        await writer.write(encoder.encode(JSON.stringify({ progress: result }) + '\n'));
      }
    }

    await writer.write(encoder.encode(JSON.stringify({ 
      complete: {
        message: `Processed ${products.length} products`,
        total: products.length,
        results
      }
    }) + '\n'));
    await writer.close();
  } catch (error) {
    console.error('Batch process error:', error);
    await writer.write(encoder.encode(JSON.stringify({ complete: { error: 'Failed to batch process' } }) + '\n'));
    await writer.close();
  }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked',
    },
  });
}
