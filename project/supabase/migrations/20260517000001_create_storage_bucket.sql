/*
  # Supabase Storage - Product Images Bucket

  Creates a public bucket for product images with admin-only write access.
*/

-- Create the bucket (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Product images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Only admins can upload
CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND (
      SELECT role FROM profiles WHERE id = auth.uid()
    ) = 'admin'
  );

-- Only admins can update images
CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND (
      SELECT role FROM profiles WHERE id = auth.uid()
    ) = 'admin'
  );

-- Only admins can delete images
CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND (
      SELECT role FROM profiles WHERE id = auth.uid()
    ) = 'admin'
  );
