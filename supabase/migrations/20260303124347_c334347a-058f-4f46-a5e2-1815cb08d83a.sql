CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  proofs_limit integer NOT NULL,
  price_monthly numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plans are publicly readable"
  ON public.plans
  FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO public.plans (name, display_name, proofs_limit, price_monthly) VALUES
  ('free', 'Free', 5, 0),
  ('starter', 'Starter', 50, 39),
  ('agency_pro', 'Agency Pro', 200, 79),
  ('agency_elite', 'Agency Elite', 999999, 149);