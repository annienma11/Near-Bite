-- Fix Cart RLS Policies
-- Run this in your Supabase SQL Editor

-- Disable RLS temporarily for testing (REMOVE IN PRODUCTION)
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;

-- OR use proper policies (RECOMMENDED):
-- Enable RLS
-- ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own cart items
-- CREATE POLICY "Users can insert own cart items" ON cart_items
--   FOR INSERT
--   WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own cart items
-- CREATE POLICY "Users can view own cart items" ON cart_items
--   FOR SELECT
--   USING (auth.uid() = user_id);

-- Allow users to update their own cart items
-- CREATE POLICY "Users can update own cart items" ON cart_items
--   FOR UPDATE
--   USING (auth.uid() = user_id);

-- Allow users to delete their own cart items
-- CREATE POLICY "Users can delete own cart items" ON cart_items
--   FOR DELETE
--   USING (auth.uid() = user_id);
