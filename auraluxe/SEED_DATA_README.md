# 📦 Seed Data Instructions

## How to Add Mock Products to Your Database

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"

### Step 2: Run the Seed Script
1. Open the file `seed-products.sql` in this directory
2. Copy all the SQL code
3. Paste it into the Supabase SQL Editor
4. Click "Run" or press `Ctrl/Cmd + Enter`

### Step 3: Verify the Data
The script will:
- Insert 24 luxury jewelry products
- Display a count summary by category at the end

You should see:
```
category  | count
----------|------
bracelet  | 5
earring   | 6
necklace  | 5
ring      | 5
```

### What's Included

**24 Products Total:**
- 5 Rings ($129 - $1,299)
- 5 Necklaces ($179 - $899)
- 5 Bracelets ($159 - $1,599)
- 6 Earrings ($129 - $449)

**Each Product Has:**
- Unique name and slug
- Detailed description
- Category
- Material (18k gold, platinum, rose gold, etc.)
- Price
- Stock quantity
- Multiple image URLs (from Unsplash)

### Image URLs
All images are hosted on Unsplash and are free to use. They show:
- High-quality jewelry photography
- Various angles and styles
- Professional product shots

### Optional: Clear Existing Data
If you want to start fresh, uncomment this line in the SQL file:
```sql
DELETE FROM public.products;
```

### Troubleshooting

**Error: "relation public.products does not exist"**
- Make sure you've run the schema creation SQL first
- Check that your products table exists in Supabase

**Error: "duplicate key value violates unique constraint"**
- The script uses `gen_random_uuid()` so duplicates shouldn't occur
- If you're re-running, uncomment the DELETE line first

**Images not loading?**
- Unsplash URLs should work directly
- If blocked, you can replace with your own image URLs
- Format: `ARRAY['url1', 'url2', 'url3']`

## Next Steps

After seeding:
1. Run `npm run dev` in your terminal
2. Navigate to `/shop` in your browser
3. You should see all 24 products
4. Test filtering, searching, and sorting
5. Click on products to see the detail page with gallery

Enjoy testing! 🎉
