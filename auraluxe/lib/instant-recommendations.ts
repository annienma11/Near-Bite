import { Product } from '@/types';

export function calculateInstantRecommendations(
  products: Product[],
  viewedProducts: any[],
  favorites: string[],
  cartItems: string[]
): Product[] {
  if (!products || products.length === 0) return [];

  const viewedCategories = [...new Set(viewedProducts.map(p => p.category))];
  const viewedMaterials = [...new Set(viewedProducts.map(p => p.material))];
  const viewedPrices = viewedProducts.map(p => p.price);
  const avgPrice = viewedPrices.length > 0 ? viewedPrices.reduce((a, b) => a + b, 0) / viewedPrices.length : 0;

  const scored = products.map(product => {
    let score = 0;

    if (viewedCategories.includes(product.category)) score += 50;
    if (viewedMaterials.includes(product.material)) score += 30;
    if (favorites.includes(product.id)) score += 20;
    if (cartItems.includes(product.id)) score += 10;

    if (avgPrice > 0) {
      const priceDiff = Math.abs(product.price - avgPrice);
      const priceScore = Math.max(0, 20 - (priceDiff / avgPrice) * 20);
      score += priceScore;
    }

    const viewedIds = viewedProducts.map(p => p.id);
    if (viewedIds.includes(product.id)) score -= 100;

    return { product, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 14).map(s => s.product);
}
