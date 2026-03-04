
-- sync_subscription: upsert subscription + update profile in one call
CREATE OR REPLACE FUNCTION public.sync_subscription(
  p_user_id UUID,
  p_polar_subscription_id TEXT,
  p_polar_product_id TEXT,
  p_plan TEXT,
  p_status TEXT,
  p_proofs_limit INTEGER,
  p_current_period_start TIMESTAMPTZ,
  p_current_period_end TIMESTAMPTZ,
  p_cancel_at_period_end BOOLEAN DEFAULT false,
  p_canceled_at TIMESTAMPTZ DEFAULT NULL,
  p_polar_customer_id TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Upsert subscription record
  INSERT INTO subscriptions (
    user_id, polar_subscription_id, polar_product_id, plan, status,
    current_period_start, current_period_end,
    cancel_at_period_end, canceled_at, updated_at
  ) VALUES (
    p_user_id, p_polar_subscription_id, p_polar_product_id, p_plan, p_status,
    p_current_period_start, p_current_period_end,
    p_cancel_at_period_end, p_canceled_at, NOW()
  )
  ON CONFLICT (polar_subscription_id) DO UPDATE SET
    plan = EXCLUDED.plan,
    status = EXCLUDED.status,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    cancel_at_period_end = EXCLUDED.cancel_at_period_end,
    canceled_at = EXCLUDED.canceled_at,
    updated_at = NOW();

  -- Update profile
  UPDATE profiles SET
    plan = p_plan,
    proofs_limit = p_proofs_limit,
    plan_status = CASE
      WHEN p_status = 'active' THEN 'active'
      WHEN p_status = 'canceled' THEN 'canceled'
      ELSE p_status
    END,
    proofs_used = CASE WHEN p_plan = 'free' THEN proofs_used ELSE 0 END,
    period_reset_at = p_current_period_start,
    current_period_end = p_current_period_end,
    polar_customer_id = COALESCE(p_polar_customer_id, polar_customer_id),
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;

-- Add unique constraint on polar_subscription_id if missing
DO $$ BEGIN
  ALTER TABLE public.subscriptions
    ADD CONSTRAINT uq_subscriptions_polar_subscription_id UNIQUE (polar_subscription_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- reset_proofs_for_period: reset usage on renewal
CREATE OR REPLACE FUNCTION public.reset_proofs_for_period(
  p_user_id UUID,
  p_polar_subscription_id TEXT,
  p_current_period_start TIMESTAMPTZ,
  p_current_period_end TIMESTAMPTZ
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update subscription period
  UPDATE subscriptions SET
    current_period_start = p_current_period_start,
    current_period_end = p_current_period_end,
    status = 'active',
    updated_at = NOW()
  WHERE polar_subscription_id = p_polar_subscription_id;

  -- Reset profile usage
  UPDATE profiles SET
    proofs_used = 0,
    period_reset_at = p_current_period_start,
    current_period_end = p_current_period_end,
    plan_status = 'active',
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;
