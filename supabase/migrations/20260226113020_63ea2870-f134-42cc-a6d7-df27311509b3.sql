
INSERT INTO storage.buckets (id, name, public)
VALUES ('checklist-photos', 'checklist-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Checklist photos are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'checklist-photos');

CREATE POLICY "Anyone can upload checklist photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'checklist-photos');
