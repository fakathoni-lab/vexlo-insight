-- Migration: fix_handle_new_user_trigger_users.sql
-- Purpose: Fix handle_new_user() trigger to match users table schema
-- WARNING: This migration targets a 'users' table. Current codebase uses 'profiles' table.
-- Review carefully before running.

-- ══════════════════════════════════════════════════════════════════════════════
-- FIX: handle_new_user() trigger for users table
-- Columns: id, email, tier, proofs_used, proofs_limit
-- ══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, tier, proofs_used, proofs_limit)
  VALUES (
    new.id,
    new.email,
    'free',
    0,
    3
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger is attached to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
