import { supabase } from './supabase';

export async function trackInteraction(
  userId: string | undefined,
  type: 'view' | 'favorite' | 'cart_add' | 'purchase' | 'search',
  productId?: string,
  metadata?: any
) {
  if (!userId) return;

  try {
    await supabase.from('user_interactions').insert({
      user_id: userId,
      interaction_type: type,
      product_id: productId,
      metadata,
    });
  } catch (error) {
    console.error('Failed to track interaction:', error);
  }
}
