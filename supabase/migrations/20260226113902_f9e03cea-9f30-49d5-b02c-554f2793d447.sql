
CREATE TABLE public.checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_plate TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  km TEXT NOT NULL,
  checks JSONB NOT NULL,
  observations TEXT DEFAULT '',
  photo_urls TEXT[] DEFAULT '{}',
  problem_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;

-- Public read/insert since there's no auth in this app
CREATE POLICY "Anyone can view checklists"
ON public.checklists FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert checklists"
ON public.checklists FOR INSERT
WITH CHECK (true);
