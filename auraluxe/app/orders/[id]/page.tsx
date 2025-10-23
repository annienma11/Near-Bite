'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Order, OrderItem } from '@/types';
import Link from 'next/link';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  async function fetchOrder() {
    const { data: orderData } = await supabase
      .from('orders')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (orderData) {
      setOrder(orderData);
      
      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*, product:products(*)')
        .eq('order_id', params.id);
      
      if (itemsData) setOrderItems(itemsData);
    }
  }

  if (!order) {
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
            <Link href="/orders" className="hover:text-gold-600 dark:hover:text-gold-400">Orders</Link>
            <span className="mx-2">/</span>
            <span className="text-gold-600 dark:text-gold-400">#{order.id.slice(0, 8)}</span>
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 border-2 border-gold-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✓</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-light text-brown-900 dark:text-cream-50 mb-2">Order Confirmed</h1>
          <p className="text-brown-600 dark:text-cream-300">Order #{order.id.slice(0, 8).toUpperCase()}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="border border-brown-200 dark:border-brown-700 p-6">
              <h2 className="text-xl font-light text-brown-900 dark:text-cream-50 mb-4">Order Items</h2>
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-brown-200 dark:border-brown-700 last:border-0">
                    <div className="w-20 h-20 border border-brown-200 dark:border-brown-700 flex-shrink-0">
                      {item.product?.image_urls[0] ? (
                        <img src={item.product.image_urls[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gold-500">◇</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-brown-900 dark:text-cream-50">{item.product?.name}</h3>
                      <p className="text-sm text-brown-600 dark:text-cream-300">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gold-600 dark:text-gold-400 mt-1">${item.price.toFixed(2)} each</p>
                    </div>
                    <p className="text-brown-900 dark:text-cream-50">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-brown-200 dark:border-brown-700 p-6">
              <h2 className="text-xl font-light text-brown-900 dark:text-cream-50 mb-4">Shipping Address</h2>
              <p className="text-brown-600 dark:text-cream-300 whitespace-pre-line">{order.shipping_address}</p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="border border-brown-200 dark:border-brown-700 p-6 space-y-4">
              <h2 className="text-xl font-light text-brown-900 dark:text-cream-50 mb-4">Order Summary</h2>
              <div className="space-y-3 pb-4 border-b border-brown-200 dark:border-brown-700">
                <div className="flex justify-between text-sm">
                  <span className="text-brown-600 dark:text-cream-300">Status</span>
                  <span className="text-brown-900 dark:text-cream-50 capitalize">{order.status}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brown-600 dark:text-cream-300">Date</span>
                  <span className="text-brown-900 dark:text-cream-50">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex justify-between text-lg font-light">
                <span className="text-brown-900 dark:text-cream-50">Total</span>
                <span className="text-gold-600 dark:text-gold-400">${order.total_amount.toFixed(2)}</span>
              </div>
              <Link href="/shop" className="block w-full text-center px-8 py-3 border border-brown-900 dark:border-cream-50 text-brown-900 dark:text-cream-50 hover:bg-brown-900 hover:text-cream-50 dark:hover:bg-cream-50 dark:hover:text-brown-900 transition-colors mt-6">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
