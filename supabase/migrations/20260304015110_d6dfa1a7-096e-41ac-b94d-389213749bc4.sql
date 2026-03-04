
CREATE OR REPLACE FUNCTION public.rollback_proof_increment(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET proofs_used = GREATEST(0, proofs_used - 1),
      updated_at  = NOW()
  WHERE id = p_user_id;
END;
$$;
