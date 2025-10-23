-- Fix RLS policies for favorites table

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;

-- Enable RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own favorites
CREATE POLICY "Users can view their own favorites"
ON favorites FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own favorites
CREATE POLICY "Users can insert their own favorites"
ON favorites FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own favorites
CREATE POLICY "Users can delete their own favorites"
ON favorites FOR DELETE
USING (auth.uid() = user_id);
