-- Create admin_password table
CREATE TABLE IF NOT EXISTS public.admin_password (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  password TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_password ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read (needed for frontend validation)
CREATE POLICY "Allow public read access" 
ON public.admin_password 
FOR SELECT 
USING (true);

-- Policy: Anyone can insert/update (needed for auto-rotation)
CREATE POLICY "Allow public write access" 
ON public.admin_password 
FOR ALL
USING (true);

-- Insert initial password (will be replaced by auto-generation)
INSERT INTO public.admin_password (password, expires_at)
VALUES ('temp123', NOW() + INTERVAL '24 hours')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.admin_password IS 'Stores auto-rotating admin password that expires every 24 hours';
