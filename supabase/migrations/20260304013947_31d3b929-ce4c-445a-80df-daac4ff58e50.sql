
-- Drop old subscriptions policies and table
DROP POLICY IF EXISTS "Users can read own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
DROP TABLE IF EXISTS public.subscriptions;

-- Recreate subscriptions with Polar schema
CREATE TABLE public.subscriptions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  polar_subscription_id  TEXT NOT NULL UNIQUE,
  polar_product_id       TEXT NOT NULL,
  plan                   TEXT NOT NULL,
  status                 TEXT NOT NULL
                           CHECK (status IN ('active','canceled','past_due',
                                             'trialing','paused','unpaid')),
  current_period_start   TIMESTAMPTZ NOT NULL,
  current_period_end     TIMESTAMPTZ NOT NULL,
  cancel_at_period_end   BOOLEAN NOT NULL DEFAULT false,
  canceled_at            TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
  ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status
  ON subscriptions(status) WHERE status = 'active';

-- Webhook events: idempotency
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id     TEXT NOT NULL UNIQUE,
  event_type     TEXT NOT NULL,
  payload        JSONB NOT NULL,
  user_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  processed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processing_ms  INTEGER
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_webhook_id
  ON webhook_events(webhook_id);

-- RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscriptions_select_own ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- webhook_events: no policies = service_role only

-- Add columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS period_reset_at   TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS polar_customer_id TEXT;
