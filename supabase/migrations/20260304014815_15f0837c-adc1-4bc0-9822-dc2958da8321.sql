
CREATE OR REPLACE FUNCTION public.attempt_proof_increment(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_used       INTEGER;
  v_limit      INTEGER;
  v_plan       TEXT;
  v_period_end TIMESTAMPTZ;
BEGIN
  SELECT proofs_used, proofs_limit, plan, current_period_end
  INTO v_used, v_limit, v_plan, v_period_end
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PROFILE_NOT_FOUND';
  END IF;

  -- Auto-reset if paid plan and period has passed (webhook safety net)
  IF v_plan != 'free'
     AND v_period_end IS NOT NULL
     AND v_period_end < NOW()
  THEN
    UPDATE profiles SET proofs_used = 0, period_reset_at = NOW()
    WHERE id = p_user_id;
    v_used := 0;
  END IF;

  IF v_used >= v_limit THEN
    RETURN FALSE;
  END IF;

  UPDATE profiles
  SET proofs_used = proofs_used + 1, updated_at = NOW()
  WHERE id = p_user_id;

  RETURN TRUE;
END;
$$;
