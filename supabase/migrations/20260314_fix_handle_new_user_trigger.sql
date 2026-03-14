-- Migration: fix_handle_new_user_trigger.sql
-- Purpose: Fix proofs_used never resetting for free-tier users
-- Problem: Free plan users hit their limit and can never generate proofs again
-- Solution: Update attempt_proof_increment RPC to reset proofs_used at start of each month for ALL plans

-- ──────────────────────────────────────────────────────────────────────────────
-- UPDATE attempt_proof_increment to reset ALL plans (not just paid)
-- ──────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.attempt_proof_increment(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_used         INTEGER;
  v_limit        INTEGER;
  v_plan         TEXT;
  v_period_end   TIMESTAMPTZ;
  v_period_reset TIMESTAMPTZ;
  v_month_start  TIMESTAMPTZ;
BEGIN
  -- Get current month start (UTC)
  v_month_start := date_trunc('month', NOW());

  SELECT proofs_used, proofs_limit, plan, current_period_end, period_reset_at
  INTO v_used, v_limit, v_plan, v_period_end, v_period_reset
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PROFILE_NOT_FOUND';
  END IF;

  -- ── RESET LOGIC ──
  -- For PAID plans: reset if current_period_end has passed (webhook safety net)
  -- For FREE plans: reset at start of each calendar month using period_reset_at
  IF v_plan != 'free' THEN
    -- Paid plan: reset based on subscription period
    IF v_period_end IS NOT NULL AND v_period_end < NOW() THEN
      UPDATE profiles 
      SET proofs_used = 0, period_reset_at = NOW(), updated_at = NOW()
      WHERE id = p_user_id;
      v_used := 0;
    END IF;
  ELSE
    -- Free plan: reset at start of each calendar month
    IF v_period_reset IS NULL OR v_period_reset < v_month_start THEN
      UPDATE profiles 
      SET proofs_used = 0, period_reset_at = v_month_start, updated_at = NOW()
      WHERE id = p_user_id;
      v_used := 0;
    END IF;
  END IF;

  -- Check limit after potential reset
  IF v_used >= v_limit THEN
    RETURN FALSE;
  END IF;

  -- Increment proofs_used
  UPDATE profiles
  SET proofs_used = proofs_used + 1, updated_at = NOW()
  WHERE id = p_user_id;

  RETURN TRUE;
END;
$$;

-- ──────────────────────────────────────────────────────────────────────────────
-- Backfill: Set period_reset_at for existing free-tier users who have NULL
-- This ensures the next proof attempt will correctly evaluate the reset condition
-- ──────────────────────────────────────────────────────────────────────────────
UPDATE profiles
SET period_reset_at = date_trunc('month', created_at)
WHERE plan = 'free' 
  AND period_reset_at IS NULL;
