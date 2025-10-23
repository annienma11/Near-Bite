# Paris Visual Embeddings Setup Guide

## Overview
Paris now has visual memory! Product images are analyzed using AI and stored as embeddings for intelligent style matching.

## Setup Steps

### 1. Run SQL Migration
Copy and run the SQL from `create-product-embeddings.sql` in your Supabase SQL Editor:
- Enables pgvector extension
- Creates `product_visual_embeddings` table
- Creates similarity search function
- Sets up RLS policies

### 2. Process Existing Products
After running the SQL, process all existing products:

```bash
# Option A: Via API call (recommended)
curl -X POST http://localhost:3000/api/batch-process-products

# Option B: Via browser
# Navigate to: http://localhost:3000/api/batch-process-products
# (Make a POST request)
```

This will:
- Analyze each product image using OpenAI Vision
- Extract fashion features (colors, style, formality, etc.)
- Generate embeddings
- Store in database

**Note**: Processing takes ~1-2 seconds per product. For 50 products = ~2 minutes.

### 3. Process New Products
When adding new products, call the processing API:

```javascript
// After creating a product
await fetch('/api/process-product-image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ productId: newProduct.id })
});
```

## How It Works

### Visual Analysis
Each product image is analyzed for:
- **Dominant colors**: Main color palette
- **Metal type**: Gold, silver, rose gold, etc.
- **Style**: Classic, modern, bohemian, minimalist
- **Formality**: Casual, semi-formal, formal, luxury
- **Suitable skin tones**: Warm, cool, neutral
- **Design elements**: Minimalist, ornate, geometric, etc.
- **Occasions**: Wedding, evening, casual, work
- **Face shapes**: (for earrings) Oval, round, heart, etc.

### Embedding Generation
- Text description generated from visual analysis
- Converted to 1536-dimension vector using OpenAI
- Stored for fast similarity search

### Smart Recommendations
When user uploads photo:
1. Paris analyzes user's photo
2. Generates embedding from user's style
3. Searches for visually similar products
4. Recommends based on similarity + fashion principles

## API Endpoints

### `/api/process-product-image`
Process a single product image
```json
POST { "productId": "uuid" }
```

### `/api/batch-process-products`
Process all products at once
```json
POST {}
```

## Database Schema

```sql
product_visual_embeddings
├── id (UUID)
├── product_id (UUID) → products.id
├── image_url (TEXT)
├── embedding (VECTOR(1536))
├── visual_analysis (JSONB)
│   ├── dominant_colors
│   ├── metal_type
│   ├── style
│   ├── formality
│   ├── suitable_skin_tones
│   ├── design_elements
│   ├── occasion
│   └── description
├── created_at
└── updated_at
```

## Benefits

✅ **Visual Memory**: Paris "sees" and remembers each product
✅ **Smart Matching**: Finds products that visually match user's style
✅ **Fashion Intelligence**: Uses color theory and styling principles
✅ **Fast Search**: Vector similarity search is extremely fast
✅ **Scalable**: Works with unlimited products
✅ **Automatic**: Process images in background

## Cost Estimate

Per product:
- OpenAI Vision API: ~$0.01
- OpenAI Embeddings API: ~$0.0001
- **Total**: ~$0.01 per product (one-time)

For 100 products: ~$1.00 total

## Troubleshooting

### Products not being recommended?
- Check if embeddings exist: `SELECT COUNT(*) FROM product_visual_embeddings;`
- Run batch processing again
- Lower similarity threshold in search (default: 0.7)

### Batch processing fails?
- Check OpenAI API key is valid
- Ensure products have valid image URLs
- Check Supabase connection

### Similarity search not working?
- Verify pgvector extension is enabled: `SELECT * FROM pg_extension WHERE extname = 'vector';`
- Check if index was created: `\d product_visual_embeddings`

## Next Steps

1. Run the SQL migration
2. Process existing products
3. Test Paris recommendations
4. Monitor and adjust similarity thresholds
5. Add automatic processing for new products

Paris is now ready to provide intelligent, visually-aware recommendations! 🎨✨
