# Auraluxe — Luxury Jewelry E-Commerce

Auraluxe is a modern, elegant online jewelry store built with Next.js 14 and Supabase. It focuses on premium jewelry shopping with an integrated AI-powered Style Advisor and a refined royal brown & gold design system.

Key experiences:
- Browse curated jewelry collections (rings, necklaces, bracelets, earrings)
- Upload a photo and get personalized jewelry recommendations
- Save favorites, write reviews, and manage orders
- Responsive design with light/dark themes

## Features (Complete)

- Product browsing and category filters (rings, necklaces, bracelets, earrings)
- Full product detail pages with multi-image gallery, video and 360° views
- Real-time search, material & price filters, and sorting
- Persistent shopping cart with quantity controls and cart sidebar
- Full checkout flow (shipping form, delivery options, mock payment methods)
- Orders list and order detail/confirmation pages
- Favorites / Wishlist with add/remove and quick-add-to-cart
- Reviews with star ratings and review list
- Authentication (Supabase Email/Password + Google OAuth)
- AI Style Advisor (photo upload + recommendations)
- RAG-powered AI recommendations (behavior-driven suggestions)
- Light/Dark theme toggle and minimalist royal-brown/gold design

## AI Systems & Models

Auraluxe contains two AI systems that work together to power recommendations and conversational features:

- Gini (Conversational AI)
	- Used in the site as `GiniChat` for interactive product/help conversations.
	- Integrates to conversational endpoints and can proxy to model providers.

- Paris (Style Advisor)
	- The Style Advisor UI (page: `/style-advisor`) is branded as "Paris" for the stylist persona.
	- Upload a photo and Paris will analyze the image and recommend products.

Models used by server endpoints (configured by env):

1. Google Gemini (via `@google/generative-ai`) — used in image-aware analysis and as a primary model for style analysis where available.
2. OpenAI (GPT-4o-mini or similar & embeddings `text-embedding-3-small`) — used as a fallback for analysis, for extracting structured product IDs from analysis text, and for generating text embeddings for the RAG pipeline.
3. pgvector + Supabase stored vectors — not an LLM but used for vector similarity search (RAG) and matching product/user behavior embeddings in the database.

Notes:
- The app attempts to use Gemini first when configured, then falls back to OpenAI where needed.
- The RAG pipeline uses OpenAI embeddings plus Supabase's vector DB to retrieve behavior-similar users and recommend products.

## Tech Stack

- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS
- Backend: Supabase (PostgreSQL, Auth, Storage, Realtime)
- AI: Google Gemini, OpenAI embeddings and chat models, RAG with Supabase vectors
- Deployment: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account and project
- npm or yarn

### Install

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Add a `.env.local` file with the required environment variables (example below)

### Required environment variables (example)

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
# Server-only (do not expose in client builds)
OPENAI_API_KEY=your-openai-key
GEMINI_API_KEY=your-gemini-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

4. Run dev server:

```bash
npm run dev
```

5. Open http://localhost:3000

## Database & Seed

Run the SQL files in the `auraluxe/` folder in your Supabase SQL editor to create the schema and seed sample products (`seed-products.sql`). The schema includes tables for users, products, cart_items, orders, order_items, reviews, favorites, and ai_style_sessions.

## Important notes before production

- Ensure server-only keys (`OPENAI_API_KEY`, `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are kept secret and set in your Vercel project environment variables.
- Re-enable and configure Row-Level Security (RLS) on user tables before going to production; some RLS rules may be disabled for testing.
- Review the photo upload and retention policy for privacy (users can upload photos to the Style Advisor).
- If you plan to enable real payments, integrate Stripe and store keys as server-only env variables.

## Project structure

```
auraluxe/
├── app/                    # Next.js app router pages (home, shop, cart, checkout, orders, favorites, style-advisor)
├── components/             # Reusable UI components (ProductCard, Header, Footer, StarRating, ReviewForm, etc.)
├── lib/                    # Utilities & integrations (supabase client, embeddings, behavior-tracker)
├── types/                  # TypeScript definitions
└── public/                 # Static assets (images, videos)
```

## Deployment

Deploy to Vercel and add the environment variables to the project settings. Vercel will automatically build and deploy the Next.js app from `main`.

## License

MIT
