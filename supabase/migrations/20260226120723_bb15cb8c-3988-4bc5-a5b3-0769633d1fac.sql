
-- Tabela de veículos
CREATE TABLE public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plate text NOT NULL UNIQUE,
  model text NOT NULL,
  year integer NOT NULL,
  km integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'disponível',
  next_oil_change integer DEFAULT 0,
  last_oil_change date,
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view vehicles"
  ON public.vehicles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert vehicles"
  ON public.vehicles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update vehicles"
  ON public.vehicles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete vehicles"
  ON public.vehicles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Tabela de motoristas
CREATE TABLE public.drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cnh text NOT NULL,
  cnh_expiry date NOT NULL,
  cnh_category text NOT NULL DEFAULT 'B',
  phone text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'ativo',
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL
);

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view drivers"
  ON public.drivers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert drivers"
  ON public.drivers FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update drivers"
  ON public.drivers FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete drivers"
  ON public.drivers FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
