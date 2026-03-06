
CREATE TABLE public.maintenances (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  vehicle_plate text NOT NULL,
  type text NOT NULL,
  description text NOT NULL DEFAULT '',
  date date NOT NULL,
  cost numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'agendada',
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.maintenances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view maintenances"
ON public.maintenances FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can insert maintenances"
ON public.maintenances FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update maintenances"
ON public.maintenances FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete maintenances"
ON public.maintenances FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'));
