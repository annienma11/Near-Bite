'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CartItem as CartItemType } from '@/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: ''
  });

  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('stripe');

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
      console.error('Checkout cart error:', error);
      setLoading(false);
      return;
    }

    if (!cartData || cartData.length === 0) {
      router.push('/cart');
      return;
    }

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
    setLoading(false);
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const deliveryCosts = {
    standard: 0,
    express: 15,
    overnight: 35
  };
  const shippingCost = deliveryCosts[deliveryMethod as keyof typeof deliveryCosts];
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const addressString = `${shippingAddress.fullName}, ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}, ${shippingAddress.country}. Phone: ${shippingAddress.phone}`;

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: total,
        shipping_address: addressString,
        status: 'pending'
      })
      .select()
      .single();

    if (error || !order) {
      console.error('Order creation error:', error);
      alert(`Error creating order: ${error?.message || 'Unknown error'}`);
      setProcessing(false);
      return;
    }

    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.product?.price || 0
    }));

    await supabase.from('order_items').insert(orderItems);
    await supabase.from('cart_items').delete().eq('user_id', user.id);

    router.push(`/orders/${order.id}`);
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
            <Link href="/cart" className="hover:text-gold-600 dark:hover:text-gold-400">Cart</Link>
            <span className="mx-2">/</span>
            <span className="text-gold-600 dark:text-gold-400">Checkout</span>
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-light text-brown-900 dark:text-cream-50 mb-8">Checkout</h1>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Address */}
              <div className="border border-brown-200 dark:border-brown-700 p-6">
                <h2 className="text-xl font-light text-brown-900 dark:text-cream-50 mb-6">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress({...shippingAddress, fullName: e.target.value})}
                    className="col-span-2 px-4 py-2 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 focus:border-gold-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    required
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                    className="col-span-2 px-4 py-2 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 focus:border-gold-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    required
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                    className="px-4 py-2 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 focus:border-gold-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="State/Province"
                    required
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                    className="px-4 py-2 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 focus:border-gold-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="ZIP/Postal Code"
                    required
                    value={shippingAddress.zipCode}
                    onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                    className="px-4 py-2 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 focus:border-gold-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    required
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                    className="px-4 py-2 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 focus:border-gold-500 outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    required
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                    className="col-span-2 px-4 py-2 border border-brown-200 dark:border-brown-700 bg-transparent text-brown-900 dark:text-cream-50 focus:border-gold-500 outline-none"
                  />
                </div>
              </div>

              {/* Delivery Method */}
              <div className="border border-brown-200 dark:border-brown-700 p-6">
                <h2 className="text-xl font-light text-brown-900 dark:text-cream-50 mb-6">Delivery Method</h2>
                <div className="space-y-3">
                  {[
                    { id: 'standard', name: 'Standard Delivery', time: '5-7 business days', cost: 0 },
                    { id: 'express', name: 'Express Delivery', time: '2-3 business days', cost: 15 },
                    { id: 'overnight', name: 'Overnight Delivery', time: 'Next business day', cost: 35 }
                  ].map((method) => (
                    <label key={method.id} className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${deliveryMethod === method.id ? 'border-gold-500 bg-gold-50 dark:bg-brown-800' : 'border-brown-200 dark:border-brown-700 hover:border-gold-400'}`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="delivery"
                          value={method.id}
                          checked={deliveryMethod === method.id}
                          onChange={(e) => setDeliveryMethod(e.target.value)}
                          className="w-4 h-4"
                        />
                        <div>
                          <p className="text-brown-900 dark:text-cream-50">{method.name}</p>
                          <p className="text-sm text-brown-600 dark:text-cream-300">{method.time}</p>
                        </div>
                      </div>
                      <span className="text-gold-600 dark:text-gold-400">{method.cost === 0 ? 'Free' : `$${method.cost}`}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="border border-brown-200 dark:border-brown-700 p-6">
                <h2 className="text-xl font-light text-brown-900 dark:text-cream-50 mb-6">Payment Method</h2>
                <div className="space-y-3">
                  {[
                    { id: 'stripe', name: 'Stripe', desc: 'Pay securely with Stripe' },
                    { id: 'card', name: 'Credit/Debit Card', desc: 'Visa, Mastercard, Amex' },
                    { id: 'paystack', name: 'Paystack', desc: 'African payment gateway' },
                    { id: 'bitcoin', name: 'Bitcoin', desc: 'Cryptocurrency payment' }
                  ].map((method) => (
                    <label key={method.id} className={`flex items-center p-4 border cursor-pointer transition-colors ${paymentMethod === method.id ? 'border-gold-500 bg-gold-50 dark:bg-brown-800' : 'border-brown-200 dark:border-brown-700 hover:border-gold-400'}`}>
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 mr-3"
                      />
                      <div>
                        <p className="text-brown-900 dark:text-cream-50">{method.name}</p>
                        <p className="text-sm text-brown-600 dark:text-cream-300">{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="border border-brown-200 dark:border-brown-700 p-6 sticky top-4">
                <h2 className="text-xl font-light text-brown-900 dark:text-cream-50 mb-6">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-brown-600 dark:text-cream-300">{item.product?.name} × {item.quantity}</span>
                      <span className="text-brown-900 dark:text-cream-50">${((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 mb-6 pb-6 border-b border-brown-200 dark:border-brown-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-brown-600 dark:text-cream-300">Subtotal</span>
                    <span className="text-brown-900 dark:text-cream-50">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-brown-600 dark:text-cream-300">Shipping</span>
                    <span className="text-brown-900 dark:text-cream-50">{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-brown-600 dark:text-cream-300">Tax</span>
                    <span className="text-brown-900 dark:text-cream-50">${tax.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between text-lg font-light mb-6">
                  <span className="text-brown-900 dark:text-cream-50">Total</span>
                  <span className="text-gold-600 dark:text-gold-400">${total.toFixed(2)}</span>
                </div>
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full px-8 py-3 border border-brown-900 dark:border-cream-50 text-brown-900 dark:text-cream-50 hover:bg-brown-900 hover:text-cream-50 dark:hover:bg-cream-50 dark:hover:text-brown-900 transition-colors disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
