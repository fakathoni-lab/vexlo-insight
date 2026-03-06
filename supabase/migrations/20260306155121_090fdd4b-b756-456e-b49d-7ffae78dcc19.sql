-- Create domains table
CREATE TABLE public.domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_name text NOT NULL,
  tld text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  expires_at timestamptz,
  auto_renew boolean NOT NULL DEFAULT true,
  registered_at timestamptz NOT NULL DEFAULT now(),
  dynadot_domain_id text,
  purchase_price numeric,
  registration_years integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(domain_name)
);

ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own domains" ON public.domains
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own domains" ON public.domains
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Create domain_orders table
CREATE TABLE public.domain_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_name text NOT NULL,
  order_type text NOT NULL DEFAULT 'register',
  years integer NOT NULL DEFAULT 1,
  amount numeric,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'completed',
  dynadot_order_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.domain_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own domain orders" ON public.domain_orders
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);