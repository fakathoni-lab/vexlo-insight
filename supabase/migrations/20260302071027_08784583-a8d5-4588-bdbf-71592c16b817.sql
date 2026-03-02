
-- Create atomic increment_proofs_used RPC function
CREATE OR REPLACE FUNCTION public.increment_proofs_used(user_id_input UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET proofs_used = COALESCE(proofs_used, 0) + 1,
      updated_at = now()
  WHERE id = user_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
