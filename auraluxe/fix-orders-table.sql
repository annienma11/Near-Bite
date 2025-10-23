-- Fix orders table schema
-- Run this in Supabase SQL Editor

-- Check current structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- Add missing columns
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10,2) DEFAULT 0;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_address TEXT;

-- Drop old 'total' column if it exists (since total_amount already exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'total') THEN
    ALTER TABLE orders DROP COLUMN total;
  END IF;
END $$;

-- Disable RLS for testing
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Verify the updated structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;
