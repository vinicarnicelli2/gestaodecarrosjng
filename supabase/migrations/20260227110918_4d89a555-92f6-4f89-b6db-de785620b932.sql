
-- Tabela de gestores
CREATE TABLE public.managers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL
);

ALTER TABLE public.managers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view managers"
  ON public.managers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert managers"
  ON public.managers FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update managers"
  ON public.managers FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete managers"
  ON public.managers FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Vínculo colaborador → gestor
CREATE TABLE public.collaborator_manager (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collaborator_user_id UUID NOT NULL,
  manager_id UUID NOT NULL REFERENCES public.managers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (collaborator_user_id)
);

ALTER TABLE public.collaborator_manager ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view collaborator_manager"
  ON public.collaborator_manager FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert collaborator_manager"
  ON public.collaborator_manager FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update collaborator_manager"
  ON public.collaborator_manager FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete collaborator_manager"
  ON public.collaborator_manager FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Tabela de reservas
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pendente',
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reservations"
  ON public.reservations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can insert reservations"
  ON public.reservations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update reservations"
  ON public.reservations FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete reservations"
  ON public.reservations FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));
