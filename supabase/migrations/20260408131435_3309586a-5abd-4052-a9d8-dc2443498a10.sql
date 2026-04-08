
-- Drop existing permissive SELECT policy on checklist-photos
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view checklist photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view checklist photos" ON storage.objects;

-- Restrict SELECT to authenticated users only
CREATE POLICY "Authenticated users can view checklist photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'checklist-photos');

-- Drop existing INSERT policy and recreate scoped to user folder
DROP POLICY IF EXISTS "Anyone can upload checklist photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload checklist photos" ON storage.objects;

CREATE POLICY "Users can upload to own folder in checklist-photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'checklist-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
