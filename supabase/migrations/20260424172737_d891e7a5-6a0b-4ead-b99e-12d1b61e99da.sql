CREATE POLICY "Admins can view all emergency incidents"
ON public.emergency_incidents
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = ANY (ARRAY['admin'::user_role, 'govt_admin'::user_role])
  )
);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles AS viewer
    WHERE viewer.id = auth.uid()
      AND viewer.role = ANY (ARRAY['admin'::user_role, 'govt_admin'::user_role])
  )
);