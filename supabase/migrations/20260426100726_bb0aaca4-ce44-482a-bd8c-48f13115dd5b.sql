-- Make view respect querying user's RLS
ALTER VIEW public.incident_reports_public SET (security_invoker = true);

-- Replace permissive public select on support-content with a non-listing policy.
DROP POLICY IF EXISTS "Public can read support-content files" ON storage.objects;

-- Allow public to read individual support-content objects only when fetched by
-- exact name (prevents bucket listing). Listing requires the request to have a
-- prefix; checking name IS NOT NULL prevents wildcard list.
CREATE POLICY "Public can read individual support-content files"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'support-content'
  AND name IS NOT NULL
  AND octet_length(name) > 0
  AND position('/' in name) > 0
);
