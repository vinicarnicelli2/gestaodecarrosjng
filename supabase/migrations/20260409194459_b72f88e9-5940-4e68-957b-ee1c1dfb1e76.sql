
-- 1. Fix notifications INSERT: replace permissive policy with a secure RPC
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;

-- Create a SECURITY DEFINER function to insert notifications safely
-- Only allows inserting notifications targeted at admin users
CREATE OR REPLACE FUNCTION public.create_problem_notifications(
  p_user_ids uuid[],
  p_title text,
  p_message text,
  p_type text DEFAULT 'problem',
  p_checklist_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
BEGIN
  -- Caller must be authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Validate inputs
  IF p_title IS NULL OR p_title = '' THEN
    RAISE EXCEPTION 'Title is required';
  END IF;
  IF p_message IS NULL OR p_message = '' THEN
    RAISE EXCEPTION 'Message is required';
  END IF;

  -- Only insert notifications for user_ids that actually have admin role
  INSERT INTO public.notifications (user_id, title, message, type, checklist_id)
  SELECT unnest(p_user_ids), p_title, p_message, p_type, p_checklist_id
  WHERE EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = ANY(p_user_ids) AND ur.role = 'admin'
  );
END;
$$;

-- 2. Fix user_roles: add explicit deny policies for write operations
-- Even though RLS denies by default without policies, explicit policies make intent clear

CREATE POLICY "Only admins can insert user_roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update user_roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete user_roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
