
-- 1. Fix drivers SELECT: restrict to admins or the driver's own user
DROP POLICY IF EXISTS "Authenticated users can view drivers" ON public.drivers;
CREATE POLICY "Admins or own user can view drivers"
ON public.drivers FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR user_id = auth.uid());

-- 2. Fix collaborator_manager SELECT: restrict to admins or involved users
DROP POLICY IF EXISTS "Authenticated users can view collaborator_manager" ON public.collaborator_manager;
CREATE POLICY "Admins or involved users can view collaborator_manager"
ON public.collaborator_manager FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR collaborator_user_id = auth.uid());

-- 3. Add storage DELETE policy for checklist-photos (admin only)
CREATE POLICY "Admins can delete checklist photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'checklist-photos' AND has_role(auth.uid(), 'admin'::app_role));

-- 4. Add storage UPDATE policy for checklist-photos (admin only)
CREATE POLICY "Admins can update checklist photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'checklist-photos' AND has_role(auth.uid(), 'admin'::app_role));
