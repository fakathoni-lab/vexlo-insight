

## Production Domain Check System Upgrade

### What Changes

The existing `domain-check` Edge Function works but uses in-memory rate limiting (resets on cold start) and has no caching. This upgrade adds database-backed caching and rate limiting, structured error codes, observability logging, and cache cleanup.

### Step 1: Database Migration

New migration creating two tables:

- **`domain_availability_cache`** — stores domain check results with `expires_at` for TTL-based cache. Unique on `domain`. Indexed on `domain` and `expires_at`.
- **`domain_check_rate_limit`** — tracks per-user request counts with sliding window. Indexed on `user_id` (not IP hash — we already authenticate users, and Supabase Edge Functions don't reliably expose client IPs behind the proxy).

RLS enabled on both. Policies: only `service_role` can read/write (Edge Functions use `SUPABASE_SERVICE_ROLE_KEY`).

### Step 2: Rewrite `domain-check/index.ts`

Major changes from current implementation:

1. **Auth** — keep existing `getClaims` pattern but use `service_role` client for DB operations (cache/rate-limit tables have restrictive RLS)
2. **Rate limiting** — move from in-memory Map to `domain_check_rate_limit` table. Upsert pattern: if user has >10 requests in last 60s, return `RATE_LIMITED`
3. **Cache check** — before calling Dynadot, query `domain_availability_cache` where `domain = $1 AND expires_at > now()`. If hit, return cached result with `source: "cache"`
4. **Dynadot call** — same API call, but on success/failure write to cache table. Available domains cached 1 hour, unavailable cached 10 minutes
5. **Normalized error codes** — all Dynadot failures (timeout, auth, API error) return `SERVICE_UNAVAILABLE`. Input errors return `INVALID_DOMAIN`. Rate limit returns `RATE_LIMITED`
6. **Response shape** — add `checked_at`, `source`, `ttl` fields alongside existing `pricing`, `premium`, `available`
7. **Structured logging** — JSON logs with `request_id`, `domain_tld` (TLD only), `cache_hit`, `latency_ms`, `user_id_hash`. Never log full domain or raw Dynadot response
8. **IP hashing** — hash user ID (not IP) with SHA-256 for logging, since we're behind Supabase proxy

**CORS note**: The frontend uses `supabase.functions.invoke()` which proxies through the Supabase URL. Custom origin restriction in the Edge Function would break this pattern. Keeping `Access-Control-Allow-Origin: *` is the standard Supabase approach — access control is handled by the auth token, not CORS.

### Step 3: Update `useDomainCheck` Hook

Update the `DomainCheckResult` interface to include new fields: `checked_at`, `source`, `ttl`. Map error codes to user-friendly messages.

### Step 4: Update `DomainSearch.tsx` UI

Add a subtle indicator showing whether the result came from cache or live lookup (e.g., "Cached result · refreshes in X min"). No major layout changes needed.

### Step 5: Cache Cleanup via pg_cron

SQL to schedule a cron job every 30 minutes that deletes expired rows from `domain_availability_cache` and stale rate limit entries older than 2 minutes.

### Files Modified
| File | Action |
|---|---|
| `supabase/migrations/[new].sql` | Create tables, indexes, RLS |
| `supabase/functions/domain-check/index.ts` | Full rewrite |
| `src/hooks/useDomainCheck.ts` | Update interface + error mapping |
| `src/pages/DomainSearch.tsx` | Add cache/source indicator |

### Not Changing
- `domain-register/index.ts` — remains Phase 2 scaffold
- `supabase/config.toml` — already configured
- CORS approach — stays wildcard per Supabase standard

