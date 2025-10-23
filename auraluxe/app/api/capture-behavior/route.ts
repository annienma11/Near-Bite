import { NextRequest, NextResponse } from 'next/server';
import { captureBehavior } from '@/lib/behavior-tracker';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionId, recentViews, favorites, cartItems, searches } = await request.json();

    let viewedProducts: any[] = [];
    let favoriteProducts: any[] = [];
    let cartProducts: any[] = [];
    let userOrders: any[] = [];
    let userName: string | undefined;
    let userLocation: string | undefined;

    if (recentViews.length > 0) {
      const { data } = await supabase
        .from('products')
        .select('*')
        .in('id', recentViews);
      viewedProducts = data || [];
    }

    if (favorites.length > 0) {
      const { data } = await supabase
        .from('products')
        .select('*')
        .in('id', favorites);
      favoriteProducts = data || [];
    }

    if (cartItems.length > 0) {
      const { data } = await supabase
        .from('products')
        .select('*')
        .in('id', cartItems);
      cartProducts = data || [];
    }

    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, address')
        .eq('id', userId)
        .single();
      
      userName = profile?.name;
      userLocation = profile?.address;

      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId);
      userOrders = orders || [];
    }

    await captureBehavior({
      userId,
      sessionId,
      userName,
      userLocation,
      viewedProducts,
      favorites: favoriteProducts,
      cartItems: cartProducts,
      searches: searches || [],
      orders: userOrders,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Behavior capture error:', error);
    return NextResponse.json({ error: 'Failed to capture behavior' }, { status: 500 });
  }
}
