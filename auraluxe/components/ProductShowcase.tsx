'use client';

import { useEffect, useState, useRef } from 'react';
import { Product } from '@/types';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { calculateInstantRecommendations } from '@/lib/instant-recommendations';

const gridLayout = [
  { col: 'col-span-2', row: 'row-span-2' },
  { col: 'col-span-1', row: 'row-span-1' },
  { col: 'col-span-1', row: 'row-span-2' },
  { col: 'col-span-2', row: 'row-span-1' },
  { col: 'col-span-1', row: 'row-span-1' },
  { col: 'col-span-1', row: 'row-span-1' },
  { col: 'col-span-1', row: 'row-span-1' },
];

export default function ProductShowcase() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingAI, setUsingAI] = useState(false);
  const aiRetryInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadInstantRecommendations() {
      const { data: allProds } = await supabase.from('products').select('*').limit(50);
      if (!allProds) return;

      const recentViews = JSON.parse(localStorage.getItem('recentViews') || '[]');
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');

      let viewedProducts: any[] = [];
      if (recentViews.length > 0) {
        const { data } = await supabase.from('products').select('*').in('id', recentViews);
        viewedProducts = data || [];
      }

      const instant = calculateInstantRecommendations(
        allProds,
        viewedProducts,
        favorites,
        cart.map((item: any) => item.product_id)
      );

      setAllProducts(instant);
      setDisplayProducts(instant.slice(0, 7));
      setLoading(false);
    }

    async function fetchAIRecommendations() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const recentViews = JSON.parse(localStorage.getItem('recentViews') || '[]');
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const searches = JSON.parse(localStorage.getItem('searches') || '[]');
        const sessionId = localStorage.getItem('sessionId') || `session_${Date.now()}`;
        localStorage.setItem('sessionId', sessionId);
        
        if (recentViews.length > 0 || favorites.length > 0 || cart.length > 0) {
          fetch('/api/capture-behavior', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user?.id,
              sessionId,
              recentViews,
              favorites,
              cartItems: cart.map((item: any) => item.product_id),
              searches,
            }),
          });
        }
        
        const res = await fetch('/api/ai-recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user?.id,
            recentViews,
            favorites,
            cartItems: cart.map((item: any) => item.product_id),
          }),
        });

        if (res.ok) {
          const { recommendations } = await res.json();
          if (recommendations && recommendations.length > 0) {
            setAllProducts(recommendations);
            setDisplayProducts(recommendations.slice(0, 7));
            setUsingAI(true);
            if (aiRetryInterval.current) {
              clearInterval(aiRetryInterval.current);
              aiRetryInterval.current = null;
            }
          }
        } else {
          throw new Error('AI failed');
        }
      } catch (error) {
        console.error('AI recommendations failed, using fallback:', error);
        if (!aiRetryInterval.current) {
          aiRetryInterval.current = setInterval(() => {
            fetchAIRecommendations();
          }, 30000);
        }
      }
    }

    loadInstantRecommendations();
    fetchAIRecommendations();

    return () => {
      if (aiRetryInterval.current) {
        clearInterval(aiRetryInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (allProducts.length <= 7) return;

    const interval = setInterval(() => {
      setDisplayProducts(prev => {
        const currentIndices = prev.map(p => allProducts.findIndex(prod => prod.id === p.id));
        const newProducts = currentIndices.map(idx => {
          const nextIdx = (idx + 1) % allProducts.length;
          return allProducts[nextIdx];
        });
        return newProducts;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [allProducts]);

  if (loading) {
    return (
      <div className="grid grid-cols-3 grid-rows-4 gap-2 md:gap-3 h-full p-4 md:p-8">
        {gridLayout.map((layout, i) => (
          <div key={i} className={`${layout.col} ${layout.row} bg-cream-200 dark:bg-brown-800 animate-pulse`} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-yellow-500 text-brown-900 px-6 py-2 text-xs tracking-widest font-medium" style={{ borderRadius: '50px' }}>
        AI Suggestions
      </div>
      <div className="grid grid-cols-3 grid-rows-4 gap-2 md:gap-3 h-full p-4 md:p-8 pt-16">
        {displayProducts.map((product, idx) => (
          <Link
            key={product.id}
            href={`/shop/${product.slug}`}
            className={`${gridLayout[idx].col} ${gridLayout[idx].row} overflow-hidden border border-brown-300 dark:border-brown-700 group relative animate-fade-in`}
            style={{ animationDelay: `${idx * 0.15}s` }}
          >
            {product.image_urls?.[0] ? (
              <img
                src={product.image_urls[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-cream-200 dark:bg-brown-800 text-gold-500 text-2xl">
                ◇
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-brown-900/90 via-brown-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
              <p className="text-cream-50 text-sm font-light truncate">{product.name}</p>
              <p className="text-gold-400 text-sm">${product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
