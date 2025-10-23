import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getUserContext(userId: string) {
  const [
    { data: profile },
    { data: cartItems },
    { data: orders },
  ] = await Promise.all([
    supabase.from('profiles').select('name').eq('id', userId).single(),
    supabase.from('cart_items').select('quantity, products(name, price)').eq('user_id', userId),
    supabase.from('orders').select('id').eq('user_id', userId).limit(5),
  ]);

  return {
    profile: profile || {},
    cart: cartItems?.map((c: any) => ({ name: c.products?.name, quantity: c.quantity, price: c.products?.price })) || [],
    totalOrders: orders?.length || 0,
    favorites: [],
  };
}

export async function getAllProducts() {
  const { data } = await supabase
    .from('products')
    .select('id, name, price, image_urls, slug')
    .limit(50);
  return data || [];
}

export function buildAIContext(userContext: any, products: any[]) {
  const context = {
    user: {
      name: userContext.profile?.name || 'Guest',
      totalOrders: userContext.totalOrders,
      totalSpent: userContext.totalSpent,
      hasHistory: userContext.totalOrders > 0,
    },
    preferences: {
      favoriteCategories: [...new Set(userContext.favorites.map((f: any) => f.category))],
      favoriteMaterials: [...new Set(userContext.favorites.map((f: any) => f.material))],
      priceRange: {
        min: Math.min(...userContext.favorites.map((f: any) => f.price || 0)),
        max: Math.max(...userContext.favorites.map((f: any) => f.price || 0)),
      },
    },
    recentActivity: {
      viewedProducts: userContext.recentlyViewed.slice(0, 5),
      searches: userContext.searches,
      cartItems: userContext.cart.map((c: any) => c.name),
    },
    purchaseHistory: {
      categories: [...new Set(userContext.purchaseHistory.map((p: any) => p.category))],
      products: userContext.purchaseHistory.slice(0, 5).map((p: any) => p.name),
    },
    availableProducts: products.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      material: p.material,
    })),
  };

  return JSON.stringify(context, null, 2);
}
