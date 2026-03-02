

## Edge Function Audit Report — Domain B

### Scope Adjustment

Of the 5 functions listed for audit, **only 1 exists**:

| Function | Status |
|----------|--------|
| `supabase/functions/generate-proof/index.ts` | **EXISTS** — 581 lines |
| `supabase/functions/waitlist/index.ts` | **DOES NOT EXIST** |
| `supabase/functions/billing-checkout/index.ts` | **DOES NOT EXIST** |
| `supabase/functions/billing-webhook/index.ts` | **DOES NOT EXIST** |
| `supabase/functions/billing-portal/index.ts` | **DOES NOT EXIST** |

Waitlist inserts go directly from the client to Supabase (RLS INSERT policy allows anon). Billing functions have not been built. The `config.toml` only contains the project ID — no function-level config at all (no `verify_jwt` settings).

---

### B.1 SECURITY CHECKLIST — `generate-proof`

| Check | Result | Detail |
|-------|--------|--------|
| B.1.1 Secret Exposure | **PASS** | Zero hardcoded secrets. All via `Deno.env.get()` (DATAFORSEO_LOGIN/PASSWORD, UPSTASH_*, LOVABLE_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY) |
| B.1.2 Env null handling | **PASS** | Redis: null-checked (lines 29-31). DataForSEO: throws on missing (line 39). LOVABLE_API_KEY: null-checked (line 264). **WARN**: `SUPABASE_URL` and `SUPABASE_ANON_KEY` use `!` non-null assertion (lines 389-390) — will crash with unhelpful error if missing |
| B.1.3 CORS Headers | **WARN** | Uses `Access-Control-Allow-Origin: *` (line 7). OPTIONS handler present (line 374). Missing `Access-Control-Allow-Methods` header |
| B.1.4 Input Validation | **FAIL** | No Zod. Uses manual regex + length checks (lines 19-25). Functional but violates project constraint requiring Zod validation |
| B.1.5 Auth Verification | **PASS** | Extracts Authorization header (line 380), calls `supabase.auth.getUser()` (line 394), returns 401 on failure (lines 396-399) |

---

### B.2 LOGIC FLOW AUDIT — `generate-proof`

| Step | Check | Result | Detail |
|------|-------|--------|--------|
| 1 | Request parsing | **WARN** | `req.json()` (line 403) is not wrapped in try/catch — malformed JSON will throw and hit the outer catch as a 500 instead of 400. Domain not lowercased. No `https://` or `www.` stripping |
| 2 | Auth — JWT user match | **CRITICAL FAIL** | Auth verifies the JWT is valid (line 394), but **never checks that `user.id` matches the owner of `proof_id`**. Any authenticated user can trigger generation for any proof by passing another user's `proof_id`. The UPDATE succeeds because the Edge Function creates a user-scoped Supabase client, but if an UPDATE RLS policy is `auth.uid() = user_id`, the update would silently fail for wrong users — still wasting DataForSEO credits |
| 3 | Plan enforcement | **CRITICAL FAIL** | **No plan check at all.** `proofs_used` and `proofs_limit` are never queried. DataForSEO is called unconditionally. Users on the free plan can generate unlimited proofs, burning API credits with zero enforcement |
| 4 | Redis cache | **PASS** | Checked before DataForSEO (line 419-448). Key format: `proof:{domain}:{keyword}`. TTL: 86400 (24h). Graceful fallback if Redis unavailable |
| 5 | DataForSEO parallel calls | **PASS** | Uses `Promise.allSettled` inside `Promise.race` with 24s timeout (lines 455-464). Individual call timeout is 20s with 1 retry (line 49). Partial failure produces result with defaults |
| 6 | Scoring | **PASS** | All 4 factors present. Score clamped to 0-100 via `Math.max(0, Math.min(100, final))` (line 369) |
| 7 | AI narrative | **PASS** | 8s AbortController timeout (line 291). Returns `null` on failure (not throw). Proof completes with `narrative: null` if AI fails. No unfilled placeholder check but output is validated for length > 10 (line 319) |
| 8 | Database UPDATE | **MAJOR FAIL** | Uses the **user-scoped** Supabase client (line 535-538), not service_role. This works only if the UPDATE RLS policy exists (added in Domain A audit). **`proofs_used` is never incremented** — no `profiles` update happens anywhere in the function. `apiCostUnits` is calculated (line 451) but never written anywhere |
| 9 | Response | **PASS** | Returns `{ proof_id, proof_score, status: "complete" }`. Total execution well within 150s wall clock |

#### Additional Logic Issues

- **Duplicate DataForSEO call**: `fetchOrganicRankings` (Call 1) and `fetchSerpFeatures` (Call 3) send the **exact same request** to the same endpoint (`serp/google/organic/live/advanced`) with identical parameters. This wastes 1 API credit per proof. They should be merged into a single call with results parsed for both organic items and SERP features.

- **Cache returns `narrative: null`** (line 440): Cached proofs always get `null` narrative, losing the originally generated narrative. Should cache and restore the narrative.

- **Error handler re-parses request body** (line 562): Uses `req.clone().json()` in the catch block. Since `req.json()` was already consumed on line 403, `req.clone()` at this point may not work reliably. The `proof_id` should be captured in a variable before the try block or early in the try.

- **`serp_features` column not written**: The Edge Function calculates `serpResult.serpFeatures` but never writes it to the `serp_features` column (added in Domain A migration). Only `ai_overview` (a boolean) is saved.

---

### B.3 BILLING WEBHOOK AUDIT

**NOT APPLICABLE** — `billing-webhook` function does not exist. No Stripe webhook handling is implemented.

**CRITICAL GAP**: Without this function, there is:
- No subscription activation after Stripe checkout
- No plan downgrade on cancellation
- No `proofs_used` monthly reset
- No `past_due` handling

---

### B.4 ERROR RESPONSE AUDIT — `generate-proof`

| Check | Result | Detail |
|-------|--------|--------|
| Status codes correct | **WARN** | Auth failure: 401 (correct). Validation: 400 (correct). All other errors: 500 (too broad — DataForSEO failure should be 502, timeout should be 504) |
| No stack trace leaks | **PASS** | Error response only returns `"timeout"` or `"internal_error"` string (line 577) |
| No internal path leaks | **PASS** | Console.error logs details server-side only |
| CORS on error responses | **PASS** | All responses include `corsHeaders` |

---

### B.5 MISSING FUNCTIONS AUDIT

| Function | Impact | Priority |
|----------|--------|----------|
| `waitlist` | Waitlist inserts bypass Edge Function, going directly client→Supabase via RLS. No rate limiting, no IP hashing, no duplicate protection beyond UNIQUE constraint. Email validation relies on DB CHECK constraint only | **MAJOR WARN** |
| `billing-checkout` | No way to create Stripe checkout sessions. Pricing page exists but checkout flow is dead | **CRITICAL** |
| `billing-webhook` | No Stripe event processing. Subscriptions table will never be populated. Plan upgrades/downgrades impossible | **CRITICAL** |
| `billing-portal` | No customer portal access. Users cannot manage billing | **MAJOR** |

---

### B.6 CONFIG AUDIT

| Check | Result | Detail |
|-------|--------|--------|
| `config.toml` function config | **FAIL** | No `[functions.generate-proof]` section. No `verify_jwt = false` setting. Default behavior depends on Supabase version — may reject requests without valid JWT header |

---

## Summary Table

| Function | Critical | Major | Warn | Pass |
|----------|----------|-------|------|------|
| generate-proof | 2 | 2 | 4 | 7 |
| waitlist | — | 1 (missing) | — | — |
| billing-checkout | 1 (missing) | — | — | — |
| billing-webhook | 1 (missing) | — | — | — |
| billing-portal | — | 1 (missing) | — | — |
| **TOTAL** | **4** | **4** | **4** | **7** |

## All Findings — Ordered by Severity

### CRITICAL FAILS (4)
1. **No plan enforcement** — `proofs_used`/`proofs_limit` never checked. Free users can generate unlimited proofs, burning DataForSEO credits
2. **No proof ownership check** — Any authenticated user can trigger generation for any `proof_id`. Wastes API credits even if the DB update fails due to RLS
3. **`billing-checkout` missing** — Pricing page has no checkout flow
4. **`billing-webhook` missing** — Subscriptions can never be activated or managed

### MAJOR FAILS (4)
5. **`proofs_used` never incremented** — Even if plan check existed, the counter is never updated after proof generation
6. **`serp_features` column never written** — Data is calculated but discarded; only `ai_overview` boolean is saved
7. **`billing-portal` missing** — No customer self-service billing management
8. **`waitlist` function missing** — No server-side rate limiting or IP hashing for waitlist submissions

### WARNS (4)
9. **Duplicate DataForSEO call** — Calls 1 and 3 send identical requests, wasting 1 API credit per proof (~33% cost overhead)
10. **CORS uses wildcard `*`** — Should be restricted to app domain in production
11. **No Zod validation** — Manual validation works but violates project constraint
12. **`config.toml` missing function config** — No `verify_jwt` setting for generate-proof

### RECOMMENDED FIXES (Priority Order)
1. Add plan enforcement: query `profiles` for `proofs_used`/`proofs_limit` before DataForSEO calls, return 403 if exceeded
2. Add proof ownership verification: confirm `proof.user_id === user.id` before processing
3. Increment `proofs_used` on profiles after successful proof generation
4. Merge DataForSEO Calls 1 and 3 into a single request (saves ~33% API cost)
5. Write `serp_features` JSONB to the proofs table
6. Build `billing-checkout`, `billing-webhook`, `billing-portal` Edge Functions
7. Build `waitlist` Edge Function with rate limiting
8. Add `[functions.generate-proof]` with `verify_jwt = false` to `config.toml`
9. Replace manual validation with Zod schemas
10. Restrict CORS origin to production domain

