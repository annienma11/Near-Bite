'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Product, Review } from '@/types';
import { trackInteraction } from '@/lib/track-interaction';
import ProductGallery from '@/components/ProductGallery';
import Toast from '@/components/Toast';
import CartSidebar from '@/components/CartSidebar';
import ReviewForm from '@/components/ReviewForm';
import ReviewList from '@/components/ReviewList';
import Link from 'next/link';

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showCartSidebar, setShowCartSidebar] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [params.slug]);

  useEffect(() => {
    if (product) {
      const recentViews = JSON.parse(localStorage.getItem('recentViews') || '[]');
      const updated = [product.id, ...recentViews.filter((id: string) => id !== product.id)].slice(0, 10);
      localStorage.setItem('recentViews', JSON.stringify(updated));
      
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) trackInteraction(user.id, 'view', product.id);
      });
    }
  }, [product]);

  async function fetchProduct() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('slug', params.slug)
      .single();
    if (data) {
      setProduct(data);
      fetchReviews(data.id);
      fetchRelated(data.category, data.id);
      checkFavorite(data.id);
    }
  }

  async function fetchReviews(productId: string) {
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    
    if (reviewsData) {
      const userIds = [...new Set(reviewsData.map(r => r.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds);
      
      const reviewsWithUser = reviewsData.map(review => ({
        ...review,
        user: profilesData?.find(p => p.id === review.user_id) || { name: 'Anonymous' }
      }));
      setReviews(reviewsWithUser);
    }
  }

  async function fetchRelated(category: string, currentId: string) {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .neq('id', currentId)
      .limit(4);
    if (data) setRelatedProducts(data);
  }

  async function checkFavorite(productId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle();
    setIsFavorite(!!data);
  }

  async function addToCart() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setToast({ message: 'Please login to add items to cart', type: 'error' });
      return;
    }

    // Check if item already exists
    const { data: existing } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', product!.id)
      .single();

    let error;
    if (existing) {
      // Update quantity
      const result = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
      error = result.error;
    } else {
      // Insert new
      const result = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: product!.id,
          quantity
        });
      error = result.error;
    }

    if (!error) {
      setToast({ message: 'Added to cart successfully!', type: 'success' });
      setShowCartSidebar(true);
    } else {
      console.error('Cart error:', error);
      setToast({ message: 'Failed to add to cart. Please try again.', type: 'error' });
    }
  }

  async function toggleFavorite() {
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
        .eq('product_id', product!.id);
      setIsFavorite(false);
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, product_id: product!.id });
      setIsFavorite(true);
    }
  }

  const stockStatus = product?.stock === 0 ? 'Out of Stock' : product?.stock && product.stock < 5 ? 'Low Stock' : 'In Stock';

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-32">
          <div className="w-px h-16 bg-gold-500 mx-auto animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <CartSidebar isOpen={showCartSidebar} onClose={() => setShowCartSidebar(false)} />
      <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-brown-200 dark:border-brown-700">
        <div className="container mx-auto px-4 md:px-8 py-4">
          <p className="text-sm text-brown-600 dark:text-cream-300">
            <Link href="/" className="hover:text-gold-600 dark:hover:text-gold-400">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/shop" className="hover:text-gold-600 dark:hover:text-gold-400">Shop</Link>
            <span className="mx-2">/</span>
            <span className="capitalize hover:text-gold-600 dark:hover:text-gold-400">{product.category}</span>
            <span className="mx-2">/</span>
            <span className="text-gold-600 dark:text-gold-400">{product.name}</span>
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 mb-16">
          {/* Gallery */}
          <div>
            <ProductGallery 
              images={product.image_urls} 
              productName={product.name}
              youtubeUrl={product.youtube_url}
              view360Images={product.view_360_images}
            />
          </div>

          {/* Details */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs tracking-widest text-brown-500 dark:text-cream-400 mb-2">{product.category.toUpperCase()}</p>
                <h1 className="text-3xl md:text-4xl font-light text-brown-900 dark:text-cream-50 mb-4">{product.name}</h1>
              </div>
              <div className="flex items-center gap-3">
                {reviews.length > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-gold-600 dark:text-gold-400">★</span>
                    <span className="text-brown-900 dark:text-cream-50 font-medium">
                      {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                    </span>
                    <span className="text-brown-500 dark:text-cream-400">({reviews.length})</span>
                  </div>
                )}
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: product.name,
                        text: `Check out ${product.name} at Auraluxe`,
                        url: window.location.href
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }
                  }}
                  className="text-xl transition-colors hover:scale-110 transform"
                  title="Share"
                >
                  ⤴
                </button>
                <button
                  onClick={toggleFavorite}
                  className="text-2xl transition-colors hover:scale-110 transform"
                  title="Add to favorites"
                >
                  {isFavorite ? '♥' : '♡'}
                </button>
              </div>
            </div>

            <p className="text-3xl font-light text-gold-600 dark:text-gold-400 mb-6">${product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            
            <div className="mb-6 pb-6 border-b border-brown-200 dark:border-brown-700">
              <p className="text-brown-600 dark:text-cream-300 leading-relaxed">{product.description}</p>
            </div>

            {/* Specifications */}
            <div className="mb-6 pb-6 border-b border-brown-200 dark:border-brown-700 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-brown-600 dark:text-cream-300">Material</span>
                <span className="text-sm text-brown-900 dark:text-cream-50">{product.material || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-brown-600 dark:text-cream-300">Availability</span>
                <span className={`text-sm ${
                  product.stock === 0 ? 'text-red-600' : product.stock < 5 ? 'text-orange-600' : 'text-green-600'
                }`}>{stockStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-brown-600 dark:text-cream-300">SKU</span>
                <span className="text-sm text-brown-900 dark:text-cream-50">{product.slug.toUpperCase()}</span>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-4 mb-6">
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-20 px-4 py-3 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 text-center focus:border-gold-500 outline-none transition-colors"
                disabled={product.stock === 0}
              />
              <button
                onClick={addToCart}
                disabled={product.stock === 0}
                className="flex-1 px-8 py-3 border border-brown-900 dark:border-cream-50 text-brown-900 dark:text-cream-50 hover:bg-brown-900 hover:text-cream-50 dark:hover:bg-cream-50 dark:hover:text-brown-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-16 border-t border-brown-200 dark:border-brown-700">
            <h2 className="text-2xl font-light text-brown-900 dark:text-cream-50 mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((related) => (
                <Link key={related.id} href={`/shop/${related.slug}`} className="group">
                  <div className="border border-brown-200 dark:border-brown-700 hover:border-gold-500 transition-all">
                    <div className="aspect-square bg-cream-100 dark:bg-brown-800 overflow-hidden">
                      {related.image_urls[0] ? (
                        <img src={related.image_urls[0]} alt={related.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl text-gold-500">◇</div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-light text-brown-900 dark:text-cream-50 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">{related.name}</p>
                      <p className="text-sm text-gold-600 dark:text-gold-400 mt-1">${related.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-16 pt-16 border-t border-brown-200 dark:border-brown-700">
          <h2 className="text-2xl font-light text-brown-900 dark:text-cream-50 mb-8">Customer Reviews</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ReviewList reviews={reviews} />
            </div>
            <div className="lg:col-span-1">
              {product?.id && <ReviewForm productId={product.id} onReviewSubmitted={() => fetchReviews(product.id)} />}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
