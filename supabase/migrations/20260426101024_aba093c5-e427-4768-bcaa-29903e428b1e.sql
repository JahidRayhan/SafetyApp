UPDATE storage.buckets SET public = false WHERE id = 'support-content';

-- Drop the now-unnecessary public read policy
DROP POLICY IF EXISTS "Public can read individual support-content files" ON storage.objects;

-- Allow authenticated users to read approved support content via signed URLs / direct access
CREATE POLICY "Authenticated users can read support-content"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'support-content');
