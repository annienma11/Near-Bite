'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import Link from 'next/link';

export default function StyleAdvisorPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [aiSummary, setAiSummary] = useState('');
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [usedProducts, setUsedProducts] = useState<Set<string>>(new Set());
  const [userContext, setUserContext] = useState('');

  const [thinking, setThinking] = useState('');
  const [showThinking, setShowThinking] = useState(false);

  const imageAnalysisThoughts = [
    "Hmm, let me take a closer look at this photo...",
    "I'm noticing the lighting and how it plays with the colors...",
    "Analyzing the outfit style and formality level...",
    "Checking who's in the photo and what they're wearing...",
    "Looking at the color palette and how metals would complement...",
    "Considering the occasion and setting...",
    "Browsing our collection for the perfect matches...",
    "Thinking about proportions and styling principles...",
    "Almost there... finalizing my recommendations..."
  ];

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function analyzeStyle() {
    if (!selectedImage) return;
    setAnalyzing(true);
    setShowThinking(true);
    
    let thoughtIndex = 0;
    const thinkingInterval = setInterval(() => {
      if (thoughtIndex < imageAnalysisThoughts.length) {
        setThinking(imageAnalysisThoughts[thoughtIndex]);
        thoughtIndex++;
      }
    }, 1400);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const analysisRes = await fetch('/api/analyze-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: selectedImage, userId: user?.id, userContext }),
      });

      clearInterval(thinkingInterval);
      const { analysis } = await analysisRes.json();
      setAiSummary(analysis || 'Unable to analyze style.');
      setShowThinking(false);

      const recommendRes = await fetch('/api/recommend-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis }),
      });

      const { recommendations: recs } = await recommendRes.json();
      setRecommendations(recs || []);
    } catch (error) {
      clearInterval(thinkingInterval);
      console.error('Analysis error:', error);
      setAiSummary('Failed to analyze style. Please try again.');
      setShowThinking(false);
    }

    setAnalyzing(false);
  }





  return (
    <div className="min-h-screen">
      <div className="border-b border-brown-200 dark:border-brown-700">
        <div className="container mx-auto px-4 md:px-8 py-4">
          <p className="text-sm text-brown-600 dark:text-cream-300">
            <Link href="/" className="hover:text-gold-600 dark:hover:text-gold-400">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gold-600 dark:text-gold-400">AI Style Advisor</span>
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-light text-brown-900 dark:text-cream-50 mb-4">
            AI Style Advisor
          </h1>
          <p className="text-brown-600 dark:text-cream-300 max-w-2xl mx-auto mb-2">
            Upload a photo and let our AI recommend jewelry pieces that match your style
          </p>
          <p className="text-gold-600 dark:text-gold-400 text-sm font-light">
            Advisory by Paris
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {!selectedImage ? (
            <div className="border-2 border-dashed border-brown-200 dark:border-brown-700 p-12 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="text-6xl text-gold-500 mb-4">📸</div>
                <p className="text-lg text-brown-900 dark:text-cream-50 mb-2">Upload Your Photo</p>
                <p className="text-sm text-brown-600 dark:text-cream-300">
                  Click to select an image or drag and drop
                </p>
              </label>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-light text-brown-900 dark:text-cream-50 mb-4">Your Photo</h3>
                  <img src={selectedImage} alt="Uploaded" className="w-full border border-brown-200 dark:border-brown-700" />
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setRecommendations([]);
                      setAiSummary('');
                    }}
                    className="mt-4 text-sm text-brown-600 dark:text-cream-300 hover:text-gold-600"
                  >
                    Upload Different Photo
                  </button>
                </div>

                <div className="lg:col-span-3">
                  <h3 className="text-lg font-light text-brown-900 dark:text-cream-50 mb-4">Analysis</h3>
                  {!analyzing && recommendations.length === 0 && (
                    <div className="space-y-4">
                      <textarea
                        value={userContext}
                        onChange={(e) => setUserContext(e.target.value)}
                        placeholder="Optional: Add context (e.g., 'for a wedding', 'budget $500', 'prefer gold')..."
                        className="w-full px-4 py-3 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 text-sm focus:outline-none focus:border-gold-500 resize-none"
                        rows={3}
                      />
                      <button
                        onClick={analyzeStyle}
                        className="w-full px-8 py-4 border border-brown-900 dark:border-cream-50 text-brown-900 dark:text-cream-50 hover:bg-brown-900 hover:text-cream-50 dark:hover:bg-cream-50 dark:hover:text-brown-900 transition-colors"
                      >
                        Analyze My Style
                      </button>
                    </div>
                  )}
                  {analyzing && (
                    <div className="text-center py-12">
                      <div className="w-1 h-20 bg-gold-500 mx-auto animate-bounce-vertical mb-4" />
                      <p className="text-brown-600 dark:text-cream-300">Analyzing your style...</p>
                    </div>
                  )}
                  {showThinking && (
                    <div className="mb-4">
                      <p className="text-brown-600 dark:text-cream-300 text-sm italic underline">
                        {thinking}
                      </p>
                    </div>
                  )}
                  {aiSummary && (
                            <div className="py-2">
                              <div className="text-brown-700 dark:text-cream-200 leading-relaxed font-extralight text-base">
                        {(() => {
                          console.log('Recommendations:', recommendations.map(r => r.name));
                          console.log('AI Summary:', aiSummary);
                          
                          let processedText = aiSummary.replace(/[#*]/g, '');
                          const usedProducts = new Set();
                          
                          recommendations.forEach(product => {
                            if (usedProducts.has(product.id)) return;
                            const escapedName = product.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                            const regex = new RegExp(`(${escapedName})(?=\\s*[-:]|$)`, 'gi');
                            const match = processedText.match(regex);
                            console.log(`Checking ${product.name}:`, match ? 'FOUND' : 'NOT FOUND');
                            if (match && product.image_urls[0]) {
                              usedProducts.add(product.id);
                              processedText = processedText.replace(regex, `<PRODUCT_${product.id}>$1</PRODUCT_${product.id}>`);
                            }
                          });
                          
                          console.log('Processed text:', processedText);
                          
                          return processedText.split('\n\n').filter(p => p.trim()).map((paragraph, pIdx) => (
                            <p key={pIdx} className="mb-6">
                              {paragraph.split(/(<PRODUCT_[^>]+>.*?<\/PRODUCT_[^>]+>)/g).map((part, idx) => {
                                const productMatch = part.match(/<PRODUCT_([^>]+)>(.*?)<\/PRODUCT_/);
                                if (productMatch) {
                                  const productId = productMatch[1];
                                  const productName = productMatch[2];
                                  const product = recommendations.find(p => p.id === productId);
                                  if (product && product.image_urls[0]) {
                                    const uniqueKey = `${productId}-${pIdx}-${idx}`;
                                    return (
                                      <span key={uniqueKey}>
                                        <span className="text-gold-600 dark:text-gold-400">{productName}</span>
                                        <span className="relative inline-block align-middle ml-1">
                                          <span
                                            className="inline-block relative"
                                            onMouseEnter={() => setHoveredProduct(uniqueKey)}
                                            onMouseLeave={() => setHoveredProduct(null)}
                                          >
                                            <Link href={`/shop/${product.slug}`}>
                                              <img 
                                                src={product.image_urls[0]} 
                                                alt={product.name}
                                                className="w-5 h-5 object-cover border border-gold-400 cursor-pointer hover:border-gold-600 transition-colors"
                                              />
                                            </Link>
                                            {hoveredProduct === uniqueKey && (
                                              <span className="absolute left-0 top-full mt-2 z-50 pointer-events-none block">
                                                <img 
                                                  src={product.image_urls[0]} 
                                                  alt={product.name}
                                                  className="border-2 border-gold-500 shadow-xl bg-white dark:bg-brown-800"
                                                  style={{ width: '250px', height: '250px', minWidth: '250px', minHeight: '250px', objectFit: 'cover' }}
                                                />
                                              </span>
                                            )}
                                          </span>
                                        </span>
                                      </span>
                                    );
                                  }
                                }
                                return <span key={`${pIdx}-${idx}`}>{part}</span>;
                              })}
                            </p>
                          ));
                        })()}
                              </div>
                            </div>
                          )}
                </div>
              </div>

              {recommendations.length > 0 && (
                <div>
                  <h3 className="text-2xl font-light text-brown-900 dark:text-cream-50 mb-6">Recommended For You</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {recommendations.map((product) => (
                      <Link key={product.id} href={`/shop/${product.slug}`} className="group">
                        <div className="border border-brown-200 dark:border-brown-700 hover:border-gold-500 transition-all">
                          <div className="aspect-square bg-cream-100 dark:bg-brown-800 overflow-hidden">
                            {product.image_urls[0] ? (
                              <img src={product.image_urls[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl text-gold-500">◇</div>
                            )}
                          </div>
                          <div className="p-4">
                            <h4 className="text-sm font-light text-brown-900 dark:text-cream-50 group-hover:text-gold-600 transition-colors">
                              {product.name}
                            </h4>
                            <p className="text-sm text-gold-600 dark:text-gold-400 mt-1">${product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
