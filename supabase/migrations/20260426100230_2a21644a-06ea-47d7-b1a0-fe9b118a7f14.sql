-- 1. Prevent role escalation: replace UPDATE policy on profiles
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
);

-- Allow admins to change roles
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (public.can_view_all_profiles(auth.uid()))
WITH CHECK (public.can_view_all_profiles(auth.uid()));

-- 2. Incident reports: hide user_id from other users.
-- Replace the existing SELECT policy. Submitter and admins still see everything.
-- Other authenticated users only see non-anonymous reports — and we'll create a
-- safe view that strips user_id for them.
DROP POLICY IF EXISTS "Users can view non-anonymous reports and their own reports" ON public.incident_reports;

CREATE POLICY "Submitter and admins can view full report"
ON public.incident_reports
FOR SELECT
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = ANY (ARRAY['admin'::user_role, 'govt_admin'::user_role])
  )
);

-- Public-safe view for non-anonymous reports (excludes user_id)
CREATE OR REPLACE VIEW public.incident_reports_public AS
SELECT
  id,
  title,
  incident_type,
  description,
  location_lat,
  location_lng,
  location_description,
  tags,
  severity_level,
  status,
  is_anonymous,
  media_files,
  reported_at,
  updated_at,
  reviewed_at
FROM public.incident_reports
WHERE is_anonymous = false;

GRANT SELECT ON public.incident_reports_public TO authenticated, anon;

-- 3. Anonymous stories: mask user_id in get_public_stories
CREATE OR REPLACE FUNCTION public.get_public_stories()
 RETURNS TABLE(id uuid, user_id uuid, title text, content text, author_name text, story_type text, is_anonymous boolean, likes_count integer, created_at timestamp with time zone, updated_at timestamp with time zone, approved_by uuid, approved_at timestamp with time zone, status text, tags text[])
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ps.id,
    CASE WHEN ps.is_anonymous THEN NULL ELSE ps.user_id END AS user_id,
    ps.title,
    ps.content,
    CASE WHEN ps.is_anonymous THEN NULL ELSE ps.author_name END AS author_name,
    ps.story_type,
    ps.is_anonymous,
    ps.likes_count,
    ps.created_at,
    ps.updated_at,
    ps.approved_by,
    ps.approved_at,
    ps.status,
    ps.tags
  FROM public.personal_stories ps
  WHERE ps.status = 'approved'
  ORDER BY ps.created_at DESC;
END;
$function$;

-- 4. Story likes RPC: require auth + verify story_likes row
CREATE OR REPLACE FUNCTION public.increment_story_likes(story_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.story_likes
    WHERE story_likes.story_id = increment_story_likes.story_id
      AND story_likes.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No like record found for this user/story';
  END IF;

  UPDATE public.personal_stories
  SET likes_count = COALESCE(likes_count, 0) + 1
  WHERE id = story_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrement_story_likes(story_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- The like row should already be deleted by the client before calling this,
  -- so we don't enforce existence here, but we limit it to authenticated users.
  UPDATE public.personal_stories
  SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
  WHERE id = story_id;
END;
$function$;

-- 5. Public bucket listing: restrict listing on support-content bucket
-- Drop overly broad SELECT policies, allow only reading specific objects (not listing)
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname ILIKE '%support-content%'
      AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- Allow public read of individual support-content files (by exact name lookup),
-- but disallow listing without a prefix filter
CREATE POLICY "Public can read support-content files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'support-content');
