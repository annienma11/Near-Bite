'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types';
import Link from 'next/link';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setOrders(data);
    setLoading(false);
  }

  if (loading) return <div className="container mx-auto px-4 py-12">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-gold-600 dark:text-gold-400">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-brown-600 dark:text-brown-400 mb-4">No orders yet</p>
          <Link href="/shop" className="btn-primary inline-block">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-brown-600 dark:text-brown-400">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-brown-600 dark:text-brown-400">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  order.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                  order.status === 'paid' ? 'bg-green-200 text-green-800' :
                  'bg-blue-200 text-blue-800'
                }`}>
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xl font-bold text-gold-600 dark:text-gold-400">${order.total_amount.toFixed(2)}</p>
                <Link href={`/orders/${order.id}`} className="text-gold-600 dark:text-gold-400 hover:underline">
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
