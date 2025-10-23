'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CartItem as CartItemType } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCart();
  }, []);

  async function fetchCart() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const { data: cartData, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Cart fetch error:', error);
      setLoading(false);
      return;
    }

    if (cartData && cartData.length > 0) {
      const productIds = cartData.map(item => item.product_id);
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      const itemsWithProducts = cartData.map(item => ({
        ...item,
        product: productsData?.find(p => p.id === item.product_id)
      }));
      setCartItems(itemsWithProducts);
    }
    setLoading(false);
  }

  async function updateQuantity(itemId: string, newQuantity: number) {
    if (newQuantity < 1) return;
    await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', itemId);
    fetchCart();
  }

  async function removeItem(itemId: string) {
    await supabase.from('cart_items').delete().eq('id', itemId);
    fetchCart();
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

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
            <span className="text-gold-600 dark:text-gold-400">Cart</span>
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-light text-brown-900 dark:text-cream-50 mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-brown-600 dark:text-cream-300 mb-6">Your cart is empty</p>
            <Link href="/shop" className="inline-block px-8 py-3 border border-brown-900 dark:border-cream-50 text-brown-900 dark:text-cream-50 hover:bg-brown-900 hover:text-cream-50 dark:hover:bg-cream-50 dark:hover:text-brown-900 transition-colors">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="border border-brown-200 dark:border-brown-700 p-4 md:p-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 border border-brown-200 dark:border-brown-700 flex-shrink-0">
                      {item.product?.image_urls[0] ? (
                        <img src={item.product.image_urls[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gold-500">◇</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Link href={`/shop/${item.product?.slug}`} className="text-lg font-light text-brown-900 dark:text-cream-50 hover:text-gold-600 dark:hover:text-gold-400">
                        {item.product?.name}
                      </Link>
                      <p className="text-sm text-brown-600 dark:text-cream-300 mt-1">{item.product?.material}</p>
                      <p className="text-lg text-gold-600 dark:text-gold-400 mt-2">${item.product?.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button onClick={() => removeItem(item.id)} className="text-sm text-brown-600 dark:text-cream-300 hover:text-gold-600 dark:hover:text-gold-400">
                        Remove
                      </button>
                      <div className="flex items-center gap-2 border border-brown-200 dark:border-brown-700">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 hover:bg-brown-100 dark:hover:bg-brown-800">-</button>
                        <span className="px-3">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 hover:bg-brown-100 dark:hover:bg-brown-800">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="border border-brown-200 dark:border-brown-700 p-6 sticky top-4">
                <h2 className="text-xl font-light text-brown-900 dark:text-cream-50 mb-6">Order Summary</h2>
                <div className="space-y-3 mb-6 pb-6 border-b border-brown-200 dark:border-brown-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-brown-600 dark:text-cream-300">Subtotal</span>
                    <span className="text-brown-900 dark:text-cream-50">${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-brown-600 dark:text-cream-300">Shipping</span>
                    <span className="text-brown-900 dark:text-cream-50">Calculated at checkout</span>
                  </div>
                </div>
                <div className="flex justify-between text-lg font-light mb-6">
                  <span className="text-brown-900 dark:text-cream-50">Total</span>
                  <span className="text-gold-600 dark:text-gold-400">${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <Link href="/checkout" className="block w-full text-center px-8 py-3 border border-brown-900 dark:border-cream-50 text-brown-900 dark:text-cream-50 hover:bg-brown-900 hover:text-cream-50 dark:hover:bg-cream-50 dark:hover:text-brown-900 transition-colors mb-3">
                  Proceed to Checkout
                </Link>
                <Link href="/shop" className="block w-full text-center text-sm text-brown-600 dark:text-cream-300 hover:text-gold-600 dark:hover:text-gold-400">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
