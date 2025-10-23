'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CartItem as CartItemType } from '@/types';
import Link from 'next/link';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);

  useEffect(() => {
    if (isOpen) fetchCart();
  }, [isOpen]);

  async function fetchCart() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: cartData, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .limit(5);
    
    if (error) {
      console.error('Cart sidebar error:', error);
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
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full md:w-96 bg-cream-50 dark:bg-brown-900 border-l border-brown-200 dark:border-brown-700 z-50 animate-slide-in">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-brown-200 dark:border-brown-700">
            <h2 className="text-xl font-light text-brown-900 dark:text-cream-50">Shopping Cart</h2>
            <button onClick={onClose} className="text-2xl text-brown-600 dark:text-cream-300 hover:text-gold-600">×</button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {cartItems.length === 0 ? (
              <p className="text-center text-brown-600 dark:text-cream-300 py-8">Your cart is empty</p>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-brown-200 dark:border-brown-700">
                    <div className="w-20 h-20 border border-brown-200 dark:border-brown-700 flex-shrink-0">
                      {item.product?.image_urls[0] ? (
                        <img src={item.product.image_urls[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gold-500">◇</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm text-brown-900 dark:text-cream-50">{item.product?.name}</h3>
                      <p className="text-xs text-brown-600 dark:text-cream-300 mt-1">Qty: {item.quantity}</p>
                      <p className="text-sm text-gold-600 dark:text-gold-400 mt-1">${((item.product?.price || 0) * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="p-6 border-t border-brown-200 dark:border-brown-700">
              <div className="flex justify-between mb-4">
                <span className="text-brown-900 dark:text-cream-50">Subtotal</span>
                <span className="text-gold-600 dark:text-gold-400">${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <Link href="/cart" onClick={onClose} className="block w-full text-center px-8 py-3 border border-brown-900 dark:border-cream-50 text-brown-900 dark:text-cream-50 hover:bg-brown-900 hover:text-cream-50 dark:hover:bg-cream-50 dark:hover:text-brown-900 transition-colors mb-3">
                View Cart
              </Link>
              <Link href="/checkout" onClick={onClose} className="block w-full text-center px-8 py-3 bg-brown-900 dark:bg-cream-50 text-cream-50 dark:text-brown-900 hover:bg-brown-800 dark:hover:bg-cream-100 transition-colors">
                Checkout
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
