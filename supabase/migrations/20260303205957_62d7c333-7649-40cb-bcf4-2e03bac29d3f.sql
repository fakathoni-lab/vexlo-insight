
CREATE TABLE public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  domain TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own clients" ON public.clients
  FOR ALL USING (auth.uid() = user_id);

CREATE TABLE public.system_status (
  id SERIAL PRIMARY KEY,
  service_name TEXT UNIQUE NOT NULL,
  status TEXT CHECK (status IN ('operational','degraded','down')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.system_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "System status publicly readable" ON public.system_status
  FOR SELECT USING (true);

INSERT INTO public.system_status (service_name, status) VALUES
  ('DataForSEO API','operational'),
  ('Proof Engine','operational'),
  ('AI Narrative Gen','operational'),
  ('Domain Reseller','degraded');
