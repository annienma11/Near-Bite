-- Fix storage policies for productimg bucket

-- Allow public uploads (for admin and users)
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'productimg');

-- Allow public updates
CREATE POLICY "Allow public updates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'productimg');

-- Allow public reads
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
USING (bucket_id = 'productimg');

-- Allow public deletes
CREATE POLICY "Allow public deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'productimg');
