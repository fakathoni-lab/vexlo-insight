
## Domain A — Database Audit Fixes

### Status: READY TO APPLY

Run the following SQL in **Supabase SQL Editor** (Dashboard → SQL Editor → New Query → paste → Run).

This single script fixes all 4 CRITICAL FAILS and 8 MAJOR WARNS from the audit.

---

### SQL Migration (copy & run in Supabase SQL Editor)

```sql
-- ============================================================
-- VEXLO Database Audit Fixes — Domain A
-- Addresses: 4 CRITICAL FAILS + 8 MAJOR WARNS
-- Safe to run idempotently (uses IF NOT EXISTS / DROP IF EXISTS)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- FIX 1: Add ON DELETE CASCADE to all foreign keys
-- ────────────────────────────────────────────────────────────

-- proofs.user_id → profiles.id
ALTER TABLE public.proofs
  DROP CONSTRAINT IF EXISTS proofs_user_id_fkey;
ALTER TABLE public.proofs
  ADD CONSTRAINT proofs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- subscriptions.user_id → profiles.id
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- proof_views.proof_id → proofs.id
ALTER TABLE public.proof_views
  DROP CONSTRAINT IF EXISTS proof_views_proof_id_fkey;
ALTER TABLE public.proof_views
  ADD CONSTRAINT proof_views_proof_id_fkey
  FOREIGN KEY (proof_id) REFERENCES public.proofs(id) ON DELETE CASCADE;

-- ────────────────────────────────────────────────────────────
-- FIX 2: Add missing columns to proofs
-- ────────────────────────────────────────────────────────────

ALTER TABLE public.proofs ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE public.proofs ADD COLUMN IF NOT EXISTS public_slug TEXT;
ALTER TABLE public.proofs ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.proofs ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE public.proofs ADD COLUMN IF NOT EXISTS serp_features JSONB;

-- Unique index on public_slug (partial — only non-null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_proofs_public_slug
  ON public.proofs (public_slug) WHERE public_slug IS NOT NULL;

-- ────────────────────────────────────────────────────────────
-- FIX 3: Add CHECK constraints
-- ────────────────────────────────────────────────────────────

DO $$ BEGIN
  ALTER TABLE public.proofs ADD CONSTRAINT chk_proofs_status
    CHECK (status IN ('pending', 'processing', 'complete', 'failed'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.proofs ADD CONSTRAINT chk_proofs_score
    CHECK (score >= 0 AND score <= 100);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT chk_profiles_plan
    CHECK (plan IN ('free', 'starter', 'pro', 'elite'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT chk_profiles_plan_status
    CHECK (plan_status IN ('active', 'past_due', 'canceled', 'trialing'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ────────────────────────────────────────────────────────────
-- FIX 4: RLS — UPDATE policy on proofs + fix public SELECT + subscriptions
-- ────────────────────────────────────────────────────────────

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own proofs" ON public.proofs;
CREATE POLICY "Users can update their own proofs"
  ON public.proofs FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "public_proofs" ON public.proofs;
CREATE POLICY "public_proofs"
  ON public.proofs FOR SELECT
  USING (is_public = true AND status = 'complete');

-- ────────────────────────────────────────────────────────────
-- FIX 5: Missing indexes
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_proofs_user_created
  ON public.proofs (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_proof_views_proof_id
  ON public.proof_views (proof_id);

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_id
  ON public.profiles (stripe_id) WHERE stripe_id IS NOT NULL;

-- ────────────────────────────────────────────────────────────
-- FIX 6: Secure handle_new_user() with explicit search_path
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ────────────────────────────────────────────────────────────
-- Backfill: Mark existing proofs with score > 0 as 'complete'
-- ────────────────────────────────────────────────────────────

UPDATE public.proofs SET status = 'complete' WHERE score > 0 AND status = 'pending';
```

---

### What This Fixes

| # | Issue | Fix |
|---|-------|-----|
| C1 | No ON DELETE CASCADE on FKs | Added CASCADE to all 3 FKs |
| C2 | proofs UPDATE RLS missing | Added UPDATE policy |
| C3 | public SELECT references missing columns | Added columns first, then recreated policy |
| C4 | subscriptions RLS not enabled | Enabled + added SELECT policy |
| W1 | No CHECK constraints | Added on status, score, plan, plan_status |
| W2 | Missing proof_views index | Added idx_proof_views_proof_id |
| W3 | Missing profiles.stripe_id index | Added idx_profiles_stripe_id |
| W4 | handle_new_user lacks search_path | Recreated with SET search_path |
| W5 | score=0 ambiguity | Added status column + backfill |
| W6 | Missing public_slug/is_public | Added columns + unique index |

### After Running

1. Confirm "Success" in SQL Editor
2. Go to **Table Editor → proofs** and verify `status`, `public_slug`, `is_public` columns exist
3. Come back here and tell me it's done — I'll update the app code to use the new columns
