
ALTER TABLE public.checklists 
ADD COLUMN checklist_type text NOT NULL DEFAULT 'retirada',
ADD COLUMN reservation_id uuid REFERENCES public.reservations(id) ON DELETE SET NULL;
