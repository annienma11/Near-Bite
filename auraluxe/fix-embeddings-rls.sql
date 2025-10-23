-- Fix RLS policies for product_visual_embeddings
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.product_visual_embeddings;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.product_visual_embeddings;

-- Allow anyone to insert/update (since we're using anon key from server)
CREATE POLICY "Allow insert for all" 
ON public.product_visual_embeddings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow update for all" 
ON public.product_visual_embeddings 
FOR UPDATE 
USING (true);
