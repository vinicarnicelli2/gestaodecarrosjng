CREATE OR REPLACE FUNCTION public.create_problem_notifications(p_user_ids uuid[], p_title text, p_message text, p_type text DEFAULT 'problem'::text, p_checklist_id uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_title IS NULL OR p_title = '' THEN
    RAISE EXCEPTION 'Title is required';
  END IF;
  IF p_message IS NULL OR p_message = '' THEN
    RAISE EXCEPTION 'Message is required';
  END IF;

  INSERT INTO public.notifications (user_id, title, message, type, checklist_id)
  SELECT ur.user_id, p_title, p_message, p_type, p_checklist_id
  FROM public.user_roles ur
  WHERE ur.user_id = ANY(p_user_ids)
    AND ur.role = 'admin';
END;
$function$;