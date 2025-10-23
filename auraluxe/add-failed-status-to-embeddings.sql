-- Add status column to track failed processing attempts
ALTER TABLE public.product_visual_embeddings 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'success';

-- Add error_message column to store failure reasons
ALTER TABLE public.product_visual_embeddings 
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Add index for filtering by status
CREATE INDEX IF NOT EXISTS product_embeddings_status_idx 
ON public.product_visual_embeddings(status);

COMMENT ON COLUMN public.product_visual_embeddings.status IS 'Processing status: success or failed';
COMMENT ON COLUMN public.product_visual_embeddings.error_message IS 'Error message if processing failed';
