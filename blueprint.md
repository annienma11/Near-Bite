# Gilded Vault — Full Blueprint

> **Luxury jewelry e‑commerce with AI style advisor**

**Tech stack**
- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS
- Backend: Supabase (Postgres + Auth + Storage + Realtime)
- Deployment: Vercel
- CI/CD: GitHub Actions (deploy to Vercel)
- AI (integration-ready): OpenAI / Replicate (for style advisor) — stubbed initially

---

## Table of Contents
1. Project summary
2. User stories
3. Pages & routes
4. Data model (tables + full SQL schema)
5. API & server-side flows
6. Supabase configuration (Auth, Storage, policies)
7. Frontend architecture & file/folder structure
8. UI / Design system & Tailwind config
9. AI Style Advisor integration plan
10. CI/CD, environment variables & deployment
11. Seed data & testing
12. Next steps / roadmap

---

## 1. Project Summary
Gilded Vault is a refined, minimalist jewelry store focused on an elevated shopping experience. Key differentiators:
- AI Style Advisor that recommends catalog items based on user-uploaded photos
- Elegant dark/light themes using a gold/copper/dark-brown palette
- Mobile-first responsive design with emphasis on high-quality product imagery

Primary goals for MVP:
- Product browsing & filtering
- Persistent user cart + checkout flow (mock/placeholder payment)
- Supabase Auth (Google + email/password)
- Orders, reviews, favorites
- AI Style Advisor stub & saved sessions

---

## 2. User Stories (high level)
- As a visitor, I can browse the catalog and filter by category.
- As a visitor, I can view product details and reviews.
- As a user, I can sign up / sign in (Google & email) and manage my profile.
- As a user, I can add items to my cart, persist them, and create an order.
- As a user, I can leave reviews with optional photos for purchased items.
- As a user, I can upload a photo to receive AI style recommendations.
- As a user, I can favorite products and view saved favorites.

---

## 3. Pages & Routes (App Router)
```
/app
 ├─ layout.tsx                    # global layout, theme provider, header, footer
 ├─ page.tsx                      # landing / home
 ├─ /auth
 │   ├─ login/page.tsx
 │   ├─ signup/page.tsx
 │   └─ callbacks (if needed)
 ├─ /shop
 │   ├─ page.tsx                   # product listing + filters
 │   └─ /[slug]/page.tsx           # product detail
 ├─ /cart/page.tsx                 # cart & checkout summary
 ├─ /orders/page.tsx               # list of user's orders
 ├─ /orders/[id]/page.tsx          # order detail
 ├─ /favorites/page.tsx            # user favorites
 ├─ /profile/page.tsx              # user account settings
 ├─ /style-advisor/page.tsx        # photo upload + results
 └─ /api
     ├─ /stripe (optional)         # serverless endpoints for payments (later)
     └─ /ai-style (optional)       # proxy to AI provider (server-side)
```

---

## 4. Data Model & Full SQL Schema
Below is a Postgres schema you can paste into `supabase/schema.sql` and run. It includes tables, relations, indexes, and basic constraints.

```sql
-- Enable uuid extension (Supabase usually has it)
create extension if not exists "pgcrypto";

-- users: supplement to Supabase Auth (optional profile table)
create table if not exists public.users (
  id uuid primary key, -- should match auth.users id
  name text,
  email text,
  profile_photo text,
  address text,
  created_at timestamp with time zone default now()
);

-- products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  category text not null,
  price numeric(10,2) not null check (price >= 0),
  stock integer default 0 check (stock >= 0),
  image_urls text[] default '{}',
  material text,
  created_at timestamp with time zone default now()
);

-- cart_items: one per user per product (unique constraint)
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  quantity integer default 1 check (quantity > 0),
  added_at timestamp with time zone default now(),
  constraint unique_cart_item unique (user_id, product_id)
);

-- orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  status text not null default 'pending', -- pending, paid, shipped, delivered, cancelled
  total_amount numeric(10,2) not null check (total_amount >= 0),
  shipping_address text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- order_items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null check (quantity > 0),
  price numeric(10,2) not null check (price >= 0)
);

-- reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  photo_urls text[] default '{}',
  created_at timestamp with time zone default now()
);

-- ai_style_sessions
create table if not exists public.ai_style_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  uploaded_photo text, -- Supabase Storage URL
  suggested_products uuid[] default '{}', -- array of product ids
  ai_summary text,
  created_at timestamp with time zone default now()
);

-- favorites
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  created_at timestamp with time zone default now(),
  constraint unique_favorite unique (user_id, product_id)
);

-- Indexes
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_reviews_product on public.reviews(product_id);
```

---

## 5. API & Server-side Flows
### Client -> Supabase (direct)
Use Supabase client in frontend for most CRUD: products (read), cart_items (read/write), favorites, reviews, orders. Secure write operations behind RLS (see Sec 6).

### Serverless API Endpoints (Next.js API routes)
- `/api/ai-style` — Uploads the photo (or accepts a Storage URL), proxies request to AI provider (OpenAI/Replicate), returns suggested products and ai_summary. Keep API key server-side.
- `/api/checkout` — (Optional) Server-side checkout: calculate totals, create order, optionally call payment provider (Stripe) and update order status.

### Realtime
Use Supabase Realtime for live order status updates (if you plan to push shipping updates).

---

## 6. Supabase Configuration (Auth, Storage, Policies)
### Auth
- Enable Email + Password and Google OAuth in Supabase Auth settings.
- Configure redirect URLs for Vercel deployment.

### Storage
- Create bucket `user-uploads` (public or private depending on access control) for profile photos & style advisor uploads.

### Row-Level Security (RLS)
Enable RLS on tables that contain user data (cart_items, orders, reviews, favorites, ai_style_sessions). Example policy snippets:

```sql
-- Allow authenticated users to insert into cart_items for their own user_id
alter table public.cart_items enable row level security;
create policy "insert_own_cart" on public.cart_items
  for insert using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Similarly create policies for select/insert/update/delete where appropriate
```

> Note: Policies must be carefully tested. For early dev you can temporarily disable RLS, but enable before production.

---

## 7. Frontend Architecture & Folder Structure
```
/gilded-vault
 ├─ app/
 │   ├─ layout.tsx
 │   ├─ globals.css
 │   ├─ page.tsx
 │   ├─ auth/
 │   ├─ shop/
 │   ├─ product/[slug]/
 │   ├─ cart/
 │   ├─ orders/
 │   ├─ favorites/
 │   └─ style-advisor/
 ├─ components/
 │   ├─ Header.tsx
 │   ├─ Footer.tsx
 │   ├─ ProductCard.tsx
 │   ├─ ProductGallery.tsx
 │   ├─ CartSidebar.tsx
 │   ├─ StarRating.tsx
 │   └─ ThemeToggle.tsx
 ├─ lib/
 │   ├─ supabaseClient.ts
 │   └─ helpers.ts
 ├─ styles/
 │   └─ tailwind.css
 ├─ hooks/
 │   └─ useTheme.ts
 ├─ types/
 │   └─ index.ts
 ├─ supabase/schema.sql
 └─ package.json
```

### Important frontend details
- Use `@supabase/supabase-js` with browser-safe keys (anon/public) and server-side endpoints for sensitive operations.
- Protect pages requiring auth with a `withAuth` wrapper or check `session` in layout.
- Persist theme in `localStorage` and apply class `dark` to `html` tag.

---

## 8. UI / Design System & Tailwind Setup
### Colors / tokens
- `--color-primary: #FFD700;` (Gold)
- `--color-bg: #262623;` (Dark brown)
- `--color-accent: #B87333;` (Copper)
- Provide light theme variants with lighter browns and neutral backgrounds.

### Tailwind config (excerpt)
```js
// tailwind.config.js
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gilded: '#FFD700',
        copper: '#B87333',
        vault: '#262623'
      },
      fontFamily: {
        serif: ['Alegreya', 'serif']
      }
    }
  }
}
```

### Fonts & icons
- Load `Alegreya` from Google Fonts in `layout.tsx`.
- Use refined minimalist icon set (Heroicons or custom thin-line SVGs).

### Motion
- Add small fade-in and translate transitions for product cards and modals.

---

## 9. AI Style Advisor Integration Plan
Start with a server-side stub and evolve to a robust AI pipeline.

### MVP (stub):
- User uploads photo → saved to Supabase Storage → serverless `/api/ai-style` calls local mock logic to return `ai_summary` and suggested product IDs (random or based on product tags).
- Save session into `ai_style_sessions`.

### Phase 2 (real AI):
- Use an image model (e.g., OpenAI Vision or a Replicate model) to detect skin tone, outfit colors, and features.
- Generate a prompt for a generative model to produce styling advice and rank product matches from catalog by embedding similarity.
- Architecture:
  1. Upload image (Storage)
  2. Serverless endpoint fetches image → sends to AI inference → receives attributes
  3. Query products table to match attributes (material, color, style tags)
  4. Return top N product suggestions + textual advice

### Security and privacy
- Clearly inform users how images are used and stored.
- Allow deleting uploaded photos from user profile.

---

## 10. CI/CD, Environment Variables & Deployment
### Environment variables (Vercel & local `.env.local`)
- `NEXT_PUBLIC_SUPABASE_URL` (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (public)
- `SUPABASE_SERVICE_ROLE_KEY` (server only; never expose to client)
- `OPENAI_API_KEY` or other AI provider keys (server only)
- `STRIPE_SECRET_KEY` (if using Stripe)

### GitHub Actions (simple flow)
- On push to `main`: run tests, build Next.js, and deploy to Vercel via Vercel Git or Vercel CLI.
- Or rely on Vercel's Git integration (recommended): auto-deploy from main branch.

---

## 11. Seed Data & Testing
### Seed SQL (basic products)
```sql
insert into public.products (id, name, slug, description, category, price, stock, image_urls, material)
values
  (gen_random_uuid(), 'Auric Signet Ring', 'auric-signet-ring', 'Classic signet with polished finish', 'ring', 249.00, 12, '{"/images/ring1-1.jpg","/images/ring1-2.jpg"}', '18k gold'),
  (gen_random_uuid(), 'Luna Pendant Necklace', 'luna-pendant-necklace', 'Delicate chain with moon-shaped pendant', 'necklace', 179.00, 20, '{"/images/necklace1-1.jpg"}', 'gold plated');
```

### Testing
- Unit test critical helpers (price calculations, cart totals).
- End-to-end tests (Playwright) for sign up, add to cart, checkout flows.

---

## 12. Next Steps / Roadmap
**Short term**
- Scaffold app with create-next-app (TypeScript + Tailwind)
- Add Supabase client + env setup
- Implement Auth (email + Google) flows
- Build product listing + product detail + cart

**Medium term**
- Add reviews, favorites, orders
- Harden RLS policies and storage permissions
- Add AI style advisor stub and serverless endpoint

**Long term**
- Integrate real AI model for style advisor
- Payment provider + shipping integration
- Marketing pages, SEO optimizations, analytics

---

## Appendix — Helpful Commands
```bash
# create project
npx create-next-app@latest gilded-vault --typescript --experimental-app
cd gilded-vault

# install deps
npm install @supabase/supabase-js tailwindcss postcss autoprefixer
npx tailwindcss init -p

# run dev
npm run dev
```

---

End of blueprint. Build iteratively: scaffold the MVP first, then add AI features and polish.

Good luck — say the word and I can also generate:
- `schema.sql` file (ready to import into Supabase)
- Full `tailwind.config.js` and `globals.css`
- Example `supabaseClient.ts` and `getServerSideProps`/serverless API stubs


