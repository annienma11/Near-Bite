-- Sales tracking table for detailed sales analytics and reporting
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Order Reference
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  order_number TEXT,
  
  -- Customer Info
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  
  -- Product Info
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_category TEXT,
  product_sku TEXT,
  
  -- Pricing
  unit_price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  
  -- Payment Info
  payment_method TEXT, -- credit_card, paypal, cash_on_delivery, etc.
  payment_status TEXT DEFAULT 'pending', -- pending, completed, failed, refunded
  transaction_id TEXT,
  
  -- Shipping Info
  shipping_method TEXT,
  shipping_cost NUMERIC(10,2) DEFAULT 0,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_country TEXT,
  shipping_zip TEXT,
  tracking_number TEXT,
  
  -- Status & Fulfillment
  sale_status TEXT DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled, refunded
  fulfillment_status TEXT, -- unfulfilled, partially_fulfilled, fulfilled
  
  -- Source & Attribution
  sale_source TEXT, -- web, mobile, ai_recommendation, paris_advisor, direct
  referral_source TEXT,
  campaign_id TEXT,
  
  -- Timestamps
  sale_date TIMESTAMPTZ DEFAULT NOW(),
  payment_date TIMESTAMPTZ,
  shipped_date TIMESTAMPTZ,
  delivered_date TIMESTAMPTZ,
  cancelled_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Additional Metadata
  notes TEXT,
  metadata JSONB,
  
  -- Analytics
  is_first_purchase BOOLEAN DEFAULT false,
  customer_lifetime_value NUMERIC(10,2),
  
  CONSTRAINT sales_subtotal_check CHECK (subtotal >= 0),
  CONSTRAINT sales_total_check CHECK (total_amount >= 0)
) TABLESPACE pg_default;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sales_order_id ON public.sales USING btree (order_id);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON public.sales USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON public.sales USING btree (product_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON public.sales USING btree (sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_status ON public.sales USING btree (sale_status);
CREATE INDEX IF NOT EXISTS idx_sales_payment_status ON public.sales USING btree (payment_status);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales USING btree (created_at DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_sales_user_date ON public.sales USING btree (user_id, sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_product_date ON public.sales USING btree (product_id, sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_status_date ON public.sales USING btree (sale_status, sale_date DESC);

-- Enable RLS
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own sales
CREATE POLICY "Users can view own sales" 
ON public.sales 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Allow service role full access (for admin and system)
CREATE POLICY "Service role full access" 
ON public.sales 
FOR ALL 
USING (auth.jwt()->>'role' = 'service_role');

-- Policy: Allow insert for authenticated users (system creates sales)
CREATE POLICY "Allow authenticated insert" 
ON public.sales 
FOR INSERT 
WITH CHECK (true);

COMMENT ON TABLE public.sales IS 'Detailed sales tracking and analytics for all transactions';
COMMENT ON COLUMN public.sales.sale_source IS 'Source of sale: web, mobile, ai_recommendation, paris_advisor, direct';
COMMENT ON COLUMN public.sales.metadata IS 'Flexible JSONB field for additional sale-specific data';
