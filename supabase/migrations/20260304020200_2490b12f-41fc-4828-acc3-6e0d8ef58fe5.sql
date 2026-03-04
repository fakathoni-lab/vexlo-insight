-- STEP 4: Replace handle_new_user trigger with improved version

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email      TEXT;
  v_free_limit INTEGER;
BEGIN
  v_email := COALESCE(
    NEW.email,
    NEW.raw_user_meta_data->>'email'
  );

  SELECT proofs_limit INTO v_free_limit
  FROM plans
  WHERE name = 'free' AND is_active = true
  LIMIT 1;

  v_free_limit := COALESCE(v_free_limit, 5);

  INSERT INTO public.profiles (
    id, email, plan, plan_status, proofs_used,
    proofs_limit, period_reset_at, created_at, updated_at
  ) VALUES (
    NEW.id, v_email, 'free', 'active', 0,
    v_free_limit, NOW(), NOW(), NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'handle_new_user failed for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill: fix existing profiles with NULL email
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND p.email IS NULL
  AND u.email IS NOT NULL;