'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Favorite } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchFavorites();
  }, []);

  async function fetchFavorites() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const { data: favData } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id);

    if (favData && favData.length > 0) {
      const productIds = favData.map(f => f.product_id);
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      const favsWithProducts = favData.map(fav => ({
        ...fav,
        product: productsData?.find(p => p.id === fav.product_id)
      }));
      setFavorites(favsWithProducts);
    }
    setLoading(false);
  }

  async function removeFavorite(favoriteId: string) {
    await supabase.from('favorites').delete().eq('id', favoriteId);
    fetchFavorites();
  }

  async function addToCart(productId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: existing } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .single();

    if (existing) {
      await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + 1 })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('cart_items')
        .insert({ user_id: user.id, product_id: productId, quantity: 1 });
    }
    alert('Added to cart!');
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-32">
          <div className="w-px h-16 bg-gold-500 mx-auto animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-brown-200 dark:border-brown-700">
        <div className="container mx-auto px-4 md:px-8 py-4">
          <p className="text-sm text-brown-600 dark:text-cream-300">
            <Link href="/" className="hover:text-gold-600 dark:hover:text-gold-400">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gold-600 dark:text-gold-400">Favorites</span>
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-light text-brown-900 dark:text-cream-50">My Favorites</h1>
          <p className="text-sm text-brown-600 dark:text-cream-300">{favorites.length} items</p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-brown-600 dark:text-cream-300 mb-6">Your favorites list is empty</p>
            <Link href="/shop" className="inline-block px-8 py-3 border border-brown-900 dark:border-cream-50 text-brown-900 dark:text-cream-50 hover:bg-brown-900 hover:text-cream-50 dark:hover:bg-cream-50 dark:hover:text-brown-900 transition-colors">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {favorites.map((fav) => (
              <div key={fav.id} className="border border-brown-200 dark:border-brown-700 group">
                <Link href={`/shop/${fav.product?.slug}`} className="block">
                  <div className="aspect-square bg-cream-100 dark:bg-brown-800 overflow-hidden">
                    {fav.product?.image_urls[0] ? (
                      <img src={fav.product.image_urls[0]} alt={fav.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-gold-500">◇</div>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <Link href={`/shop/${fav.product?.slug}`}>
                    <h3 className="font-light text-brown-900 dark:text-cream-50 hover:text-gold-600 dark:hover:text-gold-400 transition-colors mb-2">
                      {fav.product?.name}
                    </h3>
                  </Link>
                  <p className="text-lg text-gold-600 dark:text-gold-400 mb-3">${fav.product?.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(fav.product_id)}
                      className="flex-1 px-4 py-2 text-sm border border-brown-900 dark:border-cream-50 text-brown-900 dark:text-cream-50 hover:bg-brown-900 hover:text-cream-50 dark:hover:bg-cream-50 dark:hover:text-brown-900 transition-colors"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => removeFavorite(fav.id)}
                      className="px-4 py-2 text-sm border border-brown-200 dark:border-brown-700 text-brown-600 dark:text-cream-300 hover:border-red-500 hover:text-red-500 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
