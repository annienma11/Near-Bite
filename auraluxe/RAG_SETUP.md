# RAG (Retrieval Augmented Generation) Setup for Auraluxe

## Overview
Implemented a complete RAG system with vector embeddings for personalized jewelry recommendations.

## Database Setup

### 1. Run SQL Scripts in Supabase SQL Editor (in order):

```sql 11
-- Step 1: Create embeddings table with vector support
-- File: create-embeddings-table.sql
```

```sql
-- Step 2: Create similarity search function
-- File: create-similarity-function.sql
```

## Architecture

### Components:

1. **Vector Database (Supabase + pgvector)**
   - Stores user behavior embeddings (1536 dimensions)
   - Enables semantic similarity search
   - Tracks: user_id, session_id, preferences, behavior_data

2. **Embedding Generation (OpenAI)**
   - Model: `text-embedding-3-small`
   - Converts user behavior to vectors
   - Captures: categories, materials, price range, searches

3. **Behavior Tracking**
   - **localStorage**: Browser-side persistence
   - **Supabase**: Server-side with embeddings
   - Captures: views, favorites, cart, searches, orders

4. **RAG Retrieval**
   - Vector similarity search
   - Finds users with similar behavior
   - Recommends based on similar user preferences

## Features

### Personalization Factors:
- ✅ User ID & Name
- ✅ Location/Address
- ✅ Viewed Products (category, material, price)
- ✅ Favorites
- ✅ Cart Items
- ✅ Search History
- ✅ Purchase History
- ✅ Session Tracking (for guests)

### Data Storage:
- **localStorage**: Immediate access, persists across sessions
- **Supabase Embeddings**: Semantic search, cross-device sync

## API Endpoints

### `/api/capture-behavior`
Captures and embeds user behavior
- Input: userId, sessionId, recentViews, favorites, cartItems, searches
- Output: Stores embedding in Supabase + localStorage

### `/api/ai-recommendations`
RAG-powered recommendations
- Retrieves similar user behaviors
- Uses embeddings for semantic matching
- Returns 7 personalized products

### `/api/analyze-style`
Photo analysis with user context
- Vision AI + user behavior embeddings
- Personalized style recommendations

## How It Works

1. **User Browses**: Views products, adds favorites, searches
2. **Behavior Capture**: Automatically tracked in localStorage + Supabase
3. **Embedding Generation**: OpenAI converts behavior to vector
4. **Storage**: Vector stored with metadata in Supabase
5. **Retrieval**: When requesting recommendations:
   - Query user's current behavior
   - Find similar users via vector search
   - Recommend products they liked
6. **AI Enhancement**: GPT-4o uses retrieved context for better recommendations

## Benefits

- **Personalized**: Learns from each interaction
- **Semantic**: Understands behavior patterns, not just exact matches
- **Scalable**: Vector search is fast even with millions of users
- **Cross-Device**: Syncs via Supabase (logged-in users)
- **Guest Support**: Session-based tracking for non-logged users

## Next Steps

1. Run SQL scripts in Supabase
2. Test behavior capture by browsing products
3. Check `user_behavior_embeddings` table for stored data
4. Verify recommendations improve over time
