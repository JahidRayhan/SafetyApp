-- 1) Fix support-content bucket: remove any public read policy, allow only authenticated reads of approved content or uploader's own files
DROP POLICY IF EXISTS "Anyone can view support content" ON storage.objects;
DROP POLICY IF EXISTS "Public can read support-content files" ON storage.objects;
DROP POLICY IF EXISTS "Public can read individual support-content files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read support-content" ON storage.objects;

CREATE POLICY "Authenticated users can read approved support-content"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'support-content'
  AND (
    EXISTS (
      SELECT 1 FROM public.support_content sc
      WHERE sc.file_url IS NOT NULL
        AND sc.status = 'approved'
        AND position(storage.objects.name in sc.file_url) > 0
    )
    OR EXISTS (
      SELECT 1 FROM public.support_content sc
      WHERE sc.uploaded_by = auth.uid()
        AND sc.file_url IS NOT NULL
        AND position(storage.objects.name in sc.file_url) > 0
    )
  )
);

-- 2) Emergency recordings bucket: enforce ownership on uploads via folder name
DROP POLICY IF EXISTS "Users can upload their own emergency recordings" ON storage.objects;

CREATE POLICY "Users can upload their own emergency recordings"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'emergency-recordings'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Also lock down SELECT/UPDATE/DELETE on emergency-recordings to owners
DROP POLICY IF EXISTS "Users can read their own emergency recordings" ON storage.objects;
CREATE POLICY "Users can read their own emergency recordings"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'emergency-recordings'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can update their own emergency recordings" ON storage.objects;
CREATE POLICY "Users can update their own emergency recordings"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'emergency-recordings'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete their own emergency recordings" ON storage.objects;
CREATE POLICY "Users can delete their own emergency recordings"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'emergency-recordings'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 3) Privilege escalation: prevent users from approving their own role escalation,
--    restrict allowed requested_role values, and ensure the approval RPC blocks self-approval.

-- Restrict INSERT on admin_approvals: only permitted requested_role values, and not self-promotion to admin without an existing admin
DROP POLICY IF EXISTS "Users can insert their own approval requests" ON public.admin_approvals;

CREATE POLICY "Users can insert their own approval requests"
ON public.admin_approvals
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND requested_role IN ('admin', 'govt_admin')
  AND status = 'pending'
  AND approved_by IS NULL
  AND approved_at IS NULL
  AND rejection_reason IS NULL
);

-- Prevent admins from approving their own elevation request (separation of duties)
CREATE OR REPLACE FUNCTION public.handle_admin_approval(
  approval_id uuid,
  action text,
  approved_by_id uuid,
  rejection_reason text DEFAULT NULL::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  approval_record public.admin_approvals%ROWTYPE;
BEGIN
  -- Caller must be authenticated and equal approved_by_id
  IF auth.uid() IS NULL OR auth.uid() <> approved_by_id THEN
    RAISE EXCEPTION 'Unauthorized.';
  END IF;

  -- Caller must be admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  SELECT * INTO approval_record
  FROM public.admin_approvals
  WHERE id = approval_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Approval request not found.';
  END IF;

  -- Block self-approval / self-rejection of own elevation
  IF approval_record.user_id = auth.uid() THEN
    RAISE EXCEPTION 'Admins cannot review their own role requests.';
  END IF;

  IF approval_record.status <> 'pending' THEN
    RAISE EXCEPTION 'Approval request already processed.';
  END IF;

  IF action NOT IN ('approve', 'reject') THEN
    RAISE EXCEPTION 'Invalid action.';
  END IF;

  UPDATE public.admin_approvals
  SET
    status = CASE WHEN action = 'approve' THEN 'approved' ELSE 'rejected' END,
    approved_by = approved_by_id,
    approved_at = NOW(),
    rejection_reason = CASE WHEN action = 'reject' THEN handle_admin_approval.rejection_reason ELSE NULL END,
    updated_at = NOW()
  WHERE id = approval_id;

  IF action = 'approve' THEN
    UPDATE public.profiles
    SET
      role = approval_record.requested_role::user_role,
      updated_at = NOW()
    WHERE id = approval_record.user_id;
  END IF;
END;
$function$;

-- Also harden the request creation RPC to restrict role values and force user_id = auth.uid()
CREATE OR REPLACE FUNCTION public.create_admin_approval_request(
  user_id uuid,
  requested_role_input text,
  requested_by_email_input text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> user_id THEN
    RAISE EXCEPTION 'Unauthorized.';
  END IF;

  IF requested_role_input NOT IN ('admin', 'govt_admin') THEN
    RAISE EXCEPTION 'Invalid requested role.';
  END IF;

  INSERT INTO public.admin_approvals (
    user_id,
    requested_role,
    requested_by_email,
    status
  ) VALUES (
    user_id,
    requested_role_input,
    requested_by_email_input,
    'pending'
  );
END;
$function$;