
-- 1. danger_reports: restrict SELECT to authenticated users
DROP POLICY IF EXISTS "Users can view all danger reports" ON public.danger_reports;
CREATE POLICY "Authenticated users can view danger reports"
ON public.danger_reports
FOR SELECT
TO authenticated
USING (true);

-- 2. incident_reports: remove anonymous NULL user_id insert
DROP POLICY IF EXISTS "Authenticated users can create incident reports" ON public.incident_reports;
CREATE POLICY "Authenticated users can create incident reports"
ON public.incident_reports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. personal_stories: remove anonymous NULL user_id insert (keep one INSERT policy)
DROP POLICY IF EXISTS "Authenticated users can create stories" ON public.personal_stories;
DROP POLICY IF EXISTS "Users can create stories" ON public.personal_stories;
CREATE POLICY "Authenticated users can create stories"
ON public.personal_stories
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. Storage policies for 'recordings' and 'emergency-recordings' buckets
-- Owners can update/delete their own files (folder = user id)
CREATE POLICY "Users can update their own recordings"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id IN ('recordings', 'emergency-recordings')
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own recordings"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id IN ('recordings', 'emergency-recordings')
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins/govt_admins can view all recordings
CREATE POLICY "Admins can view all recordings"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id IN ('recordings', 'emergency-recordings')
  AND public.can_view_all_profiles(auth.uid())
);
