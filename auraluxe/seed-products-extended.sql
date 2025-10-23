-- Extended Mock Product Data - 50 Brand New Luxury Jewelry Products
-- Run this after the initial seed-products.sql

-- MORE RINGS (12 additional)
INSERT INTO public.products (name, slug, description, category, price, stock, image_urls, material)
VALUES
  ('Pavé Diamond Band', 'pave-diamond-band', 'Micro-set diamonds create continuous sparkle. Modern brilliance.', 'ring', 1899.00, 6, ARRAY['https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800', 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800'], 'white gold'),
  ('Braided Gold Ring', 'braided-gold-ring', 'Woven strands in warm yellow gold. Textured elegance.', 'ring', 289.00, 14, ARRAY['https://images.unsplash.com/photo-1588444650700-c5886e55238b?w=800'], '18k gold'),
  ('Opal Cabochon Ring', 'opal-cabochon-ring', 'Fiery opal in smooth dome setting. Iridescent magic.', 'ring', 459.00, 8, ARRAY['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800'], 'yellow gold'),
  ('Wave Ring', 'wave-ring', 'Flowing curves inspired by ocean. Organic beauty.', 'ring', 199.00, 22, ARRAY['https://images.unsplash.com/photo-1590927239780-c3a8c4c6e8c0?w=800'], 'sterling silver'),
  ('Cushion Cut Engagement Ring', 'cushion-cut-engagement-ring', 'Soft square diamond in halo setting. Romantic glamour.', 'ring', 2799.00, 3, ARRAY['https://images.unsplash.com/photo-1612595541308-0676e1c0f7e8?w=800', 'https://images.unsplash.com/photo-1614527082613-e4e3d3e3c1e1?w=800'], 'platinum'),
  ('Midi Ring Set', 'midi-ring-set', 'Three delicate rings for above knuckle. Trendy layers.', 'ring', 149.00, 28, ARRAY['https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?w=800'], 'gold plated'),
  ('Amethyst Cocktail Ring', 'amethyst-cocktail-ring', 'Purple gemstone in ornate setting. Regal statement.', 'ring', 689.00, 7, ARRAY['https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800'], 'white gold'),
  ('Bypass Ring', 'bypass-ring', 'Open ends create modern silhouette. Contemporary twist.', 'ring', 239.00, 19, ARRAY['https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800'], 'rose gold'),
  ('Filigree Ring', 'filigree-ring', 'Intricate metalwork with vintage appeal. Delicate artistry.', 'ring', 379.00, 11, ARRAY['https://images.unsplash.com/photo-1603561596112-0a132b757442?w=800'], 'sterling silver'),
  ('Citrine Ring', 'citrine-ring', 'Sunny yellow stone in classic prong setting. Warm radiance.', 'ring', 319.00, 13, ARRAY['https://images.unsplash.com/photo-1634712282287-14ed57b9cc89?w=800'], '14k gold'),
  ('Stacking Ring Trio', 'stacking-ring-trio', 'Mix of textures and finishes. Versatile collection.', 'ring', 259.00, 17, ARRAY['https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=800'], 'mixed metals'),
  ('Garnet Solitaire Ring', 'garnet-solitaire-ring', 'Deep red gemstone in elegant setting. Passionate beauty.', 'ring', 429.00, 9, ARRAY['https://images.unsplash.com/photo-1610695768255-f6a0d2a4e99b?w=800'], 'yellow gold'),

-- MORE NECKLACES (13 additional)
  ('Box Chain Necklace', 'box-chain-necklace', 'Sturdy square links in polished finish. Masculine elegance.', 'necklace', 399.00, 12, ARRAY['https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800'], '18k gold'),
  ('Infinity Pendant', 'infinity-pendant', 'Endless loop symbolizes eternal bond. Meaningful gift.', 'necklace', 189.00, 24, ARRAY['https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=800'], 'sterling silver'),
  ('Anchor Pendant', 'anchor-pendant', 'Nautical symbol in detailed design. Steadfast charm.', 'necklace', 279.00, 16, ARRAY['https://images.unsplash.com/photo-1623874228601-f4193c7b1818?w=800'], 'gold vermeil'),
  ('Gemstone Bar Necklace', 'gemstone-bar-necklace', 'Horizontal bar with birthstone accents. Personal touch.', 'necklace', 229.00, 21, ARRAY['https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=800'], '14k gold'),
  ('Feather Pendant', 'feather-pendant', 'Delicate plume design with texture. Free spirit.', 'necklace', 199.00, 18, ARRAY['https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800'], 'rose gold'),
  ('Rosary Necklace', 'rosary-necklace', 'Beaded chain with cross detail. Spiritual elegance.', 'necklace', 349.00, 10, ARRAY['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800'], 'gold plated'),
  ('Tree of Life Pendant', 'tree-of-life-pendant', 'Celtic symbol with intricate branches. Growth and strength.', 'necklace', 259.00, 15, ARRAY['https://images.unsplash.com/photo-1609587312208-cea54be969e7?w=800'], 'sterling silver'),
  ('Paperclip Chain', 'paperclip-chain', 'Elongated links create modern look. Trendy essential.', 'necklace', 429.00, 13, ARRAY['https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800'], '18k gold'),
  ('Zodiac Pendant', 'zodiac-pendant', 'Constellation design for your sign. Celestial connection.', 'necklace', 179.00, 26, ARRAY['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800'], 'gold plated'),
  ('Solitaire Pendant', 'solitaire-pendant', 'Single diamond on invisible chain. Floating elegance.', 'necklace', 1599.00, 5, ARRAY['https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=800'], 'white gold'),
  ('Compass Pendant', 'compass-pendant', 'Directional charm for the wanderer. Adventure awaits.', 'necklace', 299.00, 14, ARRAY['https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800'], '14k gold'),
  ('Figaro Chain', 'figaro-chain', 'Alternating link pattern in gold. Italian classic.', 'necklace', 549.00, 9, ARRAY['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800'], '18k gold'),
  ('Wishbone Pendant', 'wishbone-pendant', 'Lucky charm in delicate form. Make a wish.', 'necklace', 169.00, 23, ARRAY['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800'], 'gold vermeil'),

-- MORE BRACELETS (13 additional)
  ('Omega Bracelet', 'omega-bracelet', 'Flat mesh design hugs wrist. Sleek sophistication.', 'bracelet', 479.00, 11, ARRAY['https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800'], '18k gold'),
  ('Anklet Chain', 'anklet-chain', 'Delicate chain for ankle. Summer essential.', 'bracelet', 139.00, 29, ARRAY['https://images.unsplash.com/photo-1588444650700-c5886e55238b?w=800'], 'gold plated'),
  ('Gemstone Tennis Bracelet', 'gemstone-tennis-bracelet', 'Colorful stones in continuous line. Rainbow elegance.', 'bracelet', 1299.00, 4, ARRAY['https://images.unsplash.com/photo-1612595541308-0676e1c0f7e8?w=800'], 'white gold'),
  ('Curb Chain Bracelet', 'curb-chain-bracelet', 'Chunky interlocking links. Bold statement.', 'bracelet', 389.00, 13, ARRAY['https://images.unsplash.com/photo-1611652022419-a9419f74343a?w=800'], '14k gold'),
  ('Evil Eye Bracelet', 'evil-eye-bracelet', 'Protective symbol on delicate chain. Mystical guard.', 'bracelet', 189.00, 21, ARRAY['https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800'], 'gold plated'),
  ('Figaro Bracelet', 'figaro-bracelet', 'Classic Italian link pattern. Timeless style.', 'bracelet', 429.00, 10, ARRAY['https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=800'], '18k gold'),
  ('Jade Bangle', 'jade-bangle', 'Green stone in traditional setting. Eastern elegance.', 'bracelet', 349.00, 8, ARRAY['https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800'], 'gold vermeil'),
  ('Bar Bracelet', 'bar-bracelet', 'Horizontal plate for engraving. Personalized elegance.', 'bracelet', 249.00, 19, ARRAY['https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=800'], '14k gold'),
  ('Infinity Bracelet', 'infinity-bracelet', 'Endless symbol on chain. Eternal connection.', 'bracelet', 179.00, 25, ARRAY['https://images.unsplash.com/photo-1610695768255-f6a0d2a4e99b?w=800'], 'sterling silver'),
  ('Mariner Link Bracelet', 'mariner-link-bracelet', 'Nautical chain design. Seafaring style.', 'bracelet', 459.00, 12, ARRAY['https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800'], '18k gold'),
  ('Macrame Bracelet', 'macrame-bracelet', 'Woven cord with gold beads. Bohemian chic.', 'bracelet', 119.00, 32, ARRAY['https://images.unsplash.com/photo-1623874228601-f4193c7b1818?w=800'], 'mixed materials'),
  ('Spike Cuff', 'spike-cuff', 'Edgy studs on wide band. Rock and roll.', 'bracelet', 329.00, 14, ARRAY['https://images.unsplash.com/photo-1609587312208-cea54be969e7?w=800'], 'sterling silver'),
  ('Pearl Bracelet', 'pearl-bracelet', 'Lustrous pearls on silk thread. Classic grace.', 'bracelet', 399.00, 9, ARRAY['https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=800'], 'freshwater pearl'),

-- MORE EARRINGS (12 additional)
  ('Dangle Hoops', 'dangle-hoops', 'Hoops with hanging charms. Playful movement.', 'earring', 219.00, 20, ARRAY['https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800'], '14k gold'),
  ('Crawler Earrings', 'crawler-earrings', 'Follow the curve of ear. Modern edge.', 'earring', 269.00, 16, ARRAY['https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800'], 'rose gold'),
  ('Emerald Studs', 'emerald-studs', 'Green gemstones in classic setting. Vibrant elegance.', 'earring', 1199.00, 5, ARRAY['https://images.unsplash.com/photo-1588444650700-c5886e55238b?w=800', 'https://images.unsplash.com/photo-1612595541308-0676e1c0f7e8?w=800'], 'white gold'),
  ('Leaf Earrings', 'leaf-earrings', 'Nature-inspired design with veins. Botanical beauty.', 'earring', 189.00, 22, ARRAY['https://images.unsplash.com/photo-1590927239780-c3a8c4c6e8c0?w=800'], 'gold plated'),
  ('Teardrop Earrings', 'teardrop-earrings', 'Elegant drops with sparkle. Timeless glamour.', 'earring', 349.00, 13, ARRAY['https://images.unsplash.com/photo-1614527082613-e4e3d3e3c1e1?w=800'], '18k gold'),
  ('Cuff Earrings', 'cuff-earrings', 'Wrap around ear without piercing. No-pierce style.', 'earring', 159.00, 24, ARRAY['https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?w=800'], 'sterling silver'),
  ('Citrine Drops', 'citrine-drops', 'Yellow gemstones catch light. Sunny disposition.', 'earring', 279.00, 15, ARRAY['https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800'], '14k gold'),
  ('Double Hoop Earrings', 'double-hoop-earrings', 'Two hoops connected. Layered look.', 'earring', 239.00, 18, ARRAY['https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800'], 'gold vermeil'),
  ('Starburst Studs', 'starburst-studs', 'Radiating design with sparkle. Celestial charm.', 'earring', 199.00, 21, ARRAY['https://images.unsplash.com/photo-1603561596112-0a132b757442?w=800'], 'white gold'),
  ('Crescent Moon Earrings', 'crescent-moon-earrings', 'Lunar shape with mystique. Night sky beauty.', 'earring', 169.00, 26, ARRAY['https://images.unsplash.com/photo-1634712282287-14ed57b9cc89?w=800'], 'gold plated'),
  ('Chain Drop Earrings', 'chain-drop-earrings', 'Delicate chains create movement. Flowing elegance.', 'earring', 289.00, 14, ARRAY['https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=800'], '18k gold'),
  ('Topaz Studs', 'topaz-studs', 'Blue gemstones in simple setting. Ocean depths.', 'earring', 449.00, 10, ARRAY['https://images.unsplash.com/photo-1610695768255-f6a0d2a4e99b?w=800'], 'white gold');

-- Verify insertion
SELECT category, COUNT(*) as count FROM public.products GROUP BY category ORDER BY category;
SELECT COUNT(*) as total_products FROM public.products;
