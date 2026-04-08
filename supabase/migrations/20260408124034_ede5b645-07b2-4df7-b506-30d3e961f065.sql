
-- 1. Fix checklist INSERT: enforce user_id = auth.uid()
DROP POLICY IF EXISTS "Authenticated users can insert checklists" ON public.checklists;
CREATE POLICY "Users can insert own checklists"
ON public.checklists FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Fix storage: drop public INSERT policy, add authenticated-only
DROP POLICY IF EXISTS "Anyone can upload checklist photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload checklist photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'checklist-photos');

-- 3. Fix managers SELECT: restrict to admins or the manager themselves
DROP POLICY IF EXISTS "Authenticated users can view managers" ON public.managers;
CREATE POLICY "Admins or self can view managers"
ON public.managers FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR user_id = auth.uid());
