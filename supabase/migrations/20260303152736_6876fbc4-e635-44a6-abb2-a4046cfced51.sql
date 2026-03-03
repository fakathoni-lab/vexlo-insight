CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _plan_limit integer;
BEGIN
  SELECT proofs_limit INTO _plan_limit
    FROM public.plans
   WHERE name = 'free' AND is_active = true
   LIMIT 1;

  IF _plan_limit IS NULL THEN
    _plan_limit := 5;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, plan, proofs_limit)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    'free',
    _plan_limit
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;