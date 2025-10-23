-- Test Data Setup for Auraluxe
-- Run this in Supabase SQL Editor to set up test data

-- 1. Disable RLS for testing (IMPORTANT: Re-enable for production)
ALTER TABLE IF EXISTS cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;

-- 2. Add sample reviews for testing
-- First, get a product ID
DO $$
DECLARE
  test_product_id UUID;
  test_user_id UUID;
BEGIN
  -- Get first product
  SELECT id INTO test_product_id FROM products LIMIT 1;
  
  -- Get first user (you'll need to create a user first via signup)
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  -- Insert sample reviews if user exists
  IF test_user_id IS NOT NULL AND test_product_id IS NOT NULL THEN
    INSERT INTO reviews (user_id, product_id, rating, body) VALUES
      (test_user_id, test_product_id, 5, 'Absolutely stunning piece! The craftsmanship is exceptional and it arrived beautifully packaged.'),
      (test_user_id, test_product_id, 4, 'Beautiful jewelry, exactly as described. Shipping was fast and secure.');
  END IF;
END $$;

-- 3. Update some products with YouTube videos and 360 views
UPDATE products SET 
  youtube_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  view_360_images = ARRAY[
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800',
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800',
    'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
    'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800',
    'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=800'
  ]
WHERE id IN (SELECT id FROM products WHERE category = 'ring' LIMIT 3);

UPDATE products SET 
  youtube_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  view_360_images = ARRAY[
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800',
    'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800',
    'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=800',
    'https://images.unsplash.com/photo-1623874228601-f4193c7b1818?w=800'
  ]
WHERE id IN (SELECT id FROM products WHERE category = 'necklace' LIMIT 2);

-- 4. Verify setup
SELECT 'Products with media' as check_type, COUNT(*) as count 
FROM products 
WHERE youtube_url IS NOT NULL OR view_360_images IS NOT NULL;

SELECT 'Total products' as check_type, COUNT(*) as count FROM products;

SELECT 'Total reviews' as check_type, COUNT(*) as count FROM reviews;

SELECT 'Categories' as check_type, category, COUNT(*) as count 
FROM products 
GROUP BY category 
ORDER BY category;

-- 5. Quick test queries
-- Check if cart items table is working
SELECT 'Cart items test' as test, COUNT(*) FROM cart_items;

-- Check if favorites table is working
SELECT 'Favorites test' as test, COUNT(*) FROM favorites;

-- Check if orders table is working
SELECT 'Orders test' as test, COUNT(*) FROM orders;

-- Display sample products for testing
SELECT 
  name, 
  category, 
  price, 
  stock,
  CASE WHEN youtube_url IS NOT NULL THEN 'Yes' ELSE 'No' END as has_video,
  CASE WHEN view_360_images IS NOT NULL THEN 'Yes' ELSE 'No' END as has_360
FROM products 
LIMIT 10;
