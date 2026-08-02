DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE OR REPLACE FUNCTION public.can_view_all_profiles(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND role = ANY (ARRAY['admin'::user_role, 'govt_admin'::user_role])
  )
$$;

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.can_view_all_profiles(auth.uid()));