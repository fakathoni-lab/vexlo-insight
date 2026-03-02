
-- Fix 1: Revoke client-side access to increment_proofs_used RPC
-- This function is only called from edge functions via service_role,
-- so no authenticated/anon user should be able to call it directly.
REVOKE EXECUTE ON FUNCTION public.increment_proofs_used(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.increment_proofs_used(uuid) FROM authenticated;

-- Fix 2: Enable RLS on domain check tables with deny-all policies
-- These tables are only accessed via service_role in edge functions.

-- domain_availability_cache
ALTER TABLE public.domain_availability_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deny_all_cache" ON public.domain_availability_cache
  FOR ALL USING (false);

-- domain_check_rate_limit
ALTER TABLE public.domain_check_rate_limit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deny_all_rate_limit" ON public.domain_check_rate_limit
  FOR ALL USING (false);
