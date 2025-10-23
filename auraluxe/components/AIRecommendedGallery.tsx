'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import Link from 'next/link';

export default function AIRecommendedGallery() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const recentViews = JSON.parse(localStorage.getItem('recentViews') || '[]');
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');

        const res = await fetch('/api/ai-recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'guest',
            recentViews,
            favorites,
            cartItems: cart.map((item: any) => item.product_id),
          }),
        });

        const { recommendations } = await res.json();
        setProducts(recommendations || []);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="w-px h-16 bg-gold-500 mx-auto animate-pulse" />
      </div>
    );
  }

  return (
    <section className="border-t border-brown-200 dark:border-brown-700 w-full">
      <div className="container mx-auto px-6 md:px-8 py-12 md:py-20">
        <div className="flex flex-col items-center mb-8 md:mb-12">
          <div className="bg-yellow-500 text-brown-900 px-6 py-2 text-xs tracking-widest font-medium mb-6" style={{ borderRadius: '50px' }}>
            AI RECOMMENDED
          </div>
          <h2 className="text-3xl md:text-4xl font-light text-brown-900 dark:text-cream-50">
            Curated For You
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {products.map((product) => (
            <Link key={product.id} href={`/shop/${product.slug}`} className="group">
              <div className="border border-brown-200 dark:border-brown-700 hover:border-gold-500 transition-all overflow-hidden">
                <div className="aspect-square bg-cream-100 dark:bg-brown-800 overflow-hidden">
                  {product.image_urls?.[0] ? (
                    <img 
                      src={product.image_urls[0]} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl text-gold-500">◇</div>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="text-xs font-light text-brown-900 dark:text-cream-50 truncate group-hover:text-gold-600 transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-xs text-gold-600 dark:text-gold-400 mt-1">${product.price.toFixed(2)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
