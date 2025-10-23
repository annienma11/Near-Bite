import { storeBehaviorEmbedding } from './embeddings';

export async function captureBehavior(data: {
  userId?: string;
  sessionId?: string;
  userName?: string;
  userLocation?: string;
  viewedProducts: any[];
  favorites: any[];
  cartItems: any[];
  searches: string[];
  orders: any[];
}) {
  const viewedCategories = [...new Set(data.viewedProducts.map(p => p.category))];
  const viewedMaterials = [...new Set(data.viewedProducts.map(p => p.material))];
  const priceRange = data.viewedProducts.length > 0 ? {
    min: Math.min(...data.viewedProducts.map(p => p.price)),
    max: Math.max(...data.viewedProducts.map(p => p.price)),
    avg: data.viewedProducts.reduce((sum, p) => sum + p.price, 0) / data.viewedProducts.length,
  } : null;

  const interactionSummary = `
User: ${data.userName || 'Guest'} from ${data.userLocation || 'Unknown location'}.
Viewed ${data.viewedProducts.length} products in categories: ${viewedCategories.join(', ')}.
Preferred materials: ${viewedMaterials.join(', ')}.
Price range: $${priceRange?.min || 0}-$${priceRange?.max || 0} (avg: $${priceRange?.avg.toFixed(0) || 0}).
Favorites: ${data.favorites.map(f => f.name).join(', ') || 'none'}.
Cart: ${data.cartItems.map(c => c.name).join(', ') || 'empty'}.
Searches: ${data.searches.join(', ') || 'none'}.
Orders: ${data.orders.length} total orders.
  `.trim();

  const preferences = {
    categories: viewedCategories,
    materials: viewedMaterials,
    priceRange,
    favoriteCategories: [...new Set(data.favorites.map(f => f.category))],
    searchTerms: data.searches,
    totalOrders: data.orders.length,
  };

  const behaviorData = {
    viewedProducts: data.viewedProducts.map(p => ({ id: p.id, name: p.name, category: p.category, price: p.price })),
    favorites: data.favorites.map(f => ({ id: f.id, name: f.name, category: f.category })),
    cartItems: data.cartItems.map(c => ({ id: c.id, name: c.name, quantity: c.quantity })),
    searches: data.searches,
    orders: data.orders.map(o => ({ id: o.id, total: o.total_amount, date: o.created_at })),
  };

  // Store in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('userBehavior', JSON.stringify({
      summary: interactionSummary,
      preferences,
      lastUpdated: new Date().toISOString(),
    }));
  }

  // Store in Supabase with embedding
  await storeBehaviorEmbedding({
    userId: data.userId,
    sessionId: data.sessionId,
    userName: data.userName,
    userLocation: data.userLocation,
    interactionSummary,
    behaviorData,
    preferences,
  });
}
