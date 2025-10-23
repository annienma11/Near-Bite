'use client';

import Link from 'next/link';
import { Product } from '@/types';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    checkFavorite();
  }, [product.id]);

  async function checkFavorite() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .maybeSingle();
    setIsFavorite(!!data);
  }

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please login to save favorites');
      return;
    }

    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', product.id);
      setIsFavorite(false);
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, product_id: product.id });
      setIsFavorite(true);
    }
  }

  useEffect(() => {
    if (isHovered && product.image_urls.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % product.image_urls.length);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCurrentImageIndex(0);
    }
  }, [isHovered, product.image_urls.length]);

  return (
    <Link 
      href={`/shop/${product.slug}`} 
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="border border-brown-200 dark:border-brown-700 hover:border-gold-500 dark:hover:border-gold-400 transition-all duration-300 relative">
        <div className="aspect-square bg-cream-100 dark:bg-brown-800 overflow-hidden relative">
          {product.image_urls.length > 0 ? (
            <>
              <img
                src={product.image_urls[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {product.image_urls.length > 1 && isHovered && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {product.image_urls.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        idx === currentImageIndex ? 'bg-gold-500 w-3' : 'bg-brown-300 dark:bg-brown-600'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gold-500">◇</div>
          )}
        </div>
        {isHovered && (
          <button
            onClick={toggleFavorite}
            className="absolute top-4 right-4 text-2xl transition-all hover:scale-110 bg-white dark:bg-brown-900 p-2 border border-brown-200 dark:border-brown-700 z-10"
          >
            {isFavorite ? '♥' : '♡'}
          </button>
        )}
        <div className="p-6 space-y-2">
          <p className="text-xs tracking-widest text-brown-500 dark:text-cream-400">{product.category.toUpperCase()}</p>
          <h3 className="font-light text-lg text-brown-900 dark:text-cream-50 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between pt-2">
            <p className="text-lg font-light text-gold-600 dark:text-gold-400">${product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            {product.stock < 5 && product.stock > 0 && (
              <p className="text-xs text-brown-500 dark:text-cream-400">Limited</p>
            )}
            {product.stock === 0 && (
              <p className="text-xs text-brown-500 dark:text-cream-400">Sold Out</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
