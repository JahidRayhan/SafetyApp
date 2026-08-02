-- 1. Fix activity_logs INSERT policy to require auth.uid() = user_id
DROP POLICY IF EXISTS "System can insert activity logs" ON public.activity_logs;

CREATE POLICY "Users can insert their own activity logs"
ON public.activity_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Restrict profile INSERT to only allow role = 'user'
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id AND role = 'user'::user_role);

-- 3. Add DELETE policies for support-content storage bucket
CREATE POLICY "Users can delete their own support content files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'support-content'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can delete any support content files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'support-content'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin'::user_role, 'govt_admin'::user_role)
  )
);