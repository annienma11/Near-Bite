-- Comprehensive analytics table to track all user interactions and behaviors
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User & Session Info
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  anonymous_id TEXT,
  
  -- Event Details
  event_type TEXT NOT NULL, -- view, click, add_to_cart, remove_from_cart, favorite, unfavorite, search, filter, checkout_start, checkout_complete, ai_recommendation, paris_chat, gini_chat, etc.
  event_category TEXT, -- product, cart, checkout, ai, navigation, auth
  event_action TEXT, -- view, click, add, remove, search, filter, etc.
  event_label TEXT,
  
  -- Product/Resource Info
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT,
  product_category TEXT,
  product_price NUMERIC(10,2),
  
  -- Page/Location Info
  page_url TEXT,
  page_path TEXT,
  page_title TEXT,
  referrer_url TEXT,
  
  -- Device & Browser Info
  user_agent TEXT,
  device_type TEXT, -- mobile, tablet, desktop
  browser TEXT,
  os TEXT,
  screen_resolution TEXT,
  
  -- Interaction Metadata
  metadata JSONB, -- flexible field for additional data
  duration_ms INTEGER, -- time spent on page/action
  scroll_depth INTEGER, -- percentage scrolled
  
  -- AI Specific
  ai_session_id UUID REFERENCES ai_style_sessions(id) ON DELETE SET NULL,
  ai_recommendation_count INTEGER,
  
  -- E-commerce Specific
  cart_value NUMERIC(10,2),
  cart_item_count INTEGER,
  order_id UUID,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  event_timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Geo/Location (optional)
  ip_address TEXT,
  country TEXT,
  city TEXT
) TABLESPACE pg_default;

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON public.analytics_events USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics_events USING btree (event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_product_id ON public.analytics_events USING btree (product_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_events USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event_timestamp ON public.analytics_events USING btree (event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON public.analytics_events USING btree (session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_category ON public.analytics_events USING btree (event_category);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_user_event ON public.analytics_events USING btree (user_id, event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_product_event ON public.analytics_events USING btree (product_id, event_type, created_at DESC);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public insert (for tracking)
CREATE POLICY "Allow public insert" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (true);

-- Policy: Allow authenticated users to read their own data
CREATE POLICY "Allow users read own data" 
ON public.analytics_events 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Allow service role full access (for admin)
CREATE POLICY "Allow service role full access" 
ON public.analytics_events 
FOR ALL 
USING (auth.jwt()->>'role' = 'service_role');

COMMENT ON TABLE public.analytics_events IS 'Comprehensive analytics tracking for all user interactions and behaviors';
COMMENT ON COLUMN public.analytics_events.event_type IS 'Type of event: view, click, add_to_cart, favorite, search, ai_recommendation, etc.';
COMMENT ON COLUMN public.analytics_events.metadata IS 'Flexible JSONB field for additional event-specific data';
