-- Mock Product Data for Gilded Vault (Auraluxe)
-- Run this in your Supabase SQL Editor

-- Clear existing products (optional - comment out if you want to keep existing data)
-- DELETE FROM public.products;

-- RINGS
INSERT INTO public.products (name, slug, description, category, price, stock, image_urls, material)
VALUES
  ('Auric Signet Ring', 'auric-signet-ring', 'Classic signet ring with polished 18k gold finish. Timeless elegance for everyday wear.', 'ring', 249.00, 12, ARRAY['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800'], '18k gold'),
  
  ('Celestial Band', 'celestial-band', 'Delicate band featuring engraved star patterns. Perfect for stacking or solo wear.', 'ring', 189.00, 8, ARRAY['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800', 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800'], '14k gold'),
  
  ('Eternal Promise Ring', 'eternal-promise-ring', 'Elegant engagement ring with a brilliant solitaire diamond set in platinum.', 'ring', 1299.00, 3, ARRAY['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800', 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800'], 'platinum'),
  
  ('Vintage Rose Ring', 'vintage-rose-ring', 'Rose gold ring with intricate floral engravings. A romantic statement piece.', 'ring', 329.00, 15, ARRAY['https://images.unsplash.com/photo-1603561596112-0a132b757442?w=800'], 'rose gold'),
  
  ('Minimalist Stack Ring', 'minimalist-stack-ring', 'Ultra-thin stackable ring in brushed gold. Modern simplicity at its finest.', 'ring', 129.00, 25, ARRAY['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800'], '14k gold'),

-- NECKLACES
  ('Luna Pendant Necklace', 'luna-pendant-necklace', 'Delicate chain with crescent moon pendant. Celestial beauty for day or night.', 'necklace', 179.00, 20, ARRAY['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800'], 'gold plated'),
  
  ('Baroque Pearl Strand', 'baroque-pearl-strand', 'Natural baroque pearls on silk thread. Each pearl uniquely shaped by nature.', 'necklace', 459.00, 6, ARRAY['https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800'], 'freshwater pearl'),
  
  ('Serpent Chain Necklace', 'serpent-chain-necklace', 'Sleek serpentine chain in polished gold. Versatile length for layering.', 'necklace', 289.00, 18, ARRAY['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800'], '18k gold'),
  
  ('Diamond Drop Pendant', 'diamond-drop-pendant', 'Single diamond suspended on invisible chain. Understated luxury.', 'necklace', 899.00, 4, ARRAY['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800', 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800'], 'white gold'),
  
  ('Layered Coin Necklace', 'layered-coin-necklace', 'Three-strand necklace with antique coin charms. Bohemian elegance.', 'necklace', 349.00, 10, ARRAY['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800'], 'gold vermeil'),

-- BRACELETS
  ('Herringbone Bracelet', 'herringbone-bracelet', 'Classic herringbone weave in lustrous gold. Timeless sophistication.', 'bracelet', 399.00, 14, ARRAY['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800', 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800'], '18k gold'),
  
  ('Tennis Bracelet', 'tennis-bracelet', 'Line of brilliant-cut diamonds in platinum setting. Red carpet ready.', 'bracelet', 1599.00, 2, ARRAY['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800'], 'platinum'),
  
  ('Cuff Bangle', 'cuff-bangle', 'Wide hammered cuff with open design. Bold statement for any occasion.', 'bracelet', 279.00, 11, ARRAY['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800'], 'sterling silver'),
  
  ('Charm Bracelet', 'charm-bracelet', 'Delicate chain bracelet with five removable charms. Tell your story.', 'bracelet', 229.00, 16, ARRAY['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800'], '14k gold'),
  
  ('Beaded Gemstone Bracelet', 'beaded-gemstone-bracelet', 'Natural gemstone beads with gold accents. Earthy elegance.', 'bracelet', 159.00, 22, ARRAY['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800'], 'mixed metals'),

-- EARRINGS
  ('Hoop Earrings', 'hoop-earrings', 'Classic gold hoops in medium size. Essential everyday elegance.', 'earring', 199.00, 30, ARRAY['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800'], '14k gold'),
  
  ('Pearl Stud Earrings', 'pearl-stud-earrings', 'Lustrous white pearls on gold posts. Timeless grace.', 'earring', 149.00, 28, ARRAY['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800'], 'akoya pearl'),
  
  ('Chandelier Earrings', 'chandelier-earrings', 'Dramatic drop earrings with cascading crystals. Evening glamour.', 'earring', 379.00, 7, ARRAY['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800'], 'gold plated'),
  
  ('Geometric Studs', 'geometric-studs', 'Modern angular design in brushed gold. Contemporary minimalism.', 'earring', 129.00, 35, ARRAY['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800'], '18k gold'),
  
  ('Threader Earrings', 'threader-earrings', 'Delicate chain threaders with tiny diamonds. Effortless elegance.', 'earring', 259.00, 12, ARRAY['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800'], 'white gold'),
  
  ('Vintage Drop Earrings', 'vintage-drop-earrings', 'Art deco inspired drops with emerald accents. Old Hollywood glamour.', 'earring', 449.00, 5, ARRAY['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800'], 'yellow gold');

-- Verify insertion
SELECT category, COUNT(*) as count FROM public.products GROUP BY category ORDER BY category;
