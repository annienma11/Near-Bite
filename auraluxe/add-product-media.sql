-- Add YouTube URL and 360 view images to products table
-- Run this in your Supabase SQL Editor

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS view_360_images TEXT[];

-- Update some products with sample data
UPDATE products SET 
  youtube_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  view_360_images = ARRAY[
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800',
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800',
    'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800'
  ]
WHERE slug = 'auric-signet-ring';

-- Verify
SELECT name, youtube_url, view_360_images FROM products WHERE youtube_url IS NOT NULL LIMIT 5;
