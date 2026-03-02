

## Supabase Database Audit Report — Domain A

### Migration File Conflict Warning

There are **8 migration files** with **3 competing versions** of the schema. The actual applied schema depends on which migrations Supabase ran. The most recent timestamped migration (`20260226190615`) appears to be the canonical one, and the generated `types.ts` matches it. I will audit against that schema.

---

### A.1 SCHEMA INTEGRITY

#### A.1.1 Tables and Columns (per `20260226190615` + `types.ts`)

| Table | Columns | Notes |
|-------|---------|-------|
| waitlist | id, email, source, referrer, ip_hash, created_at | OK |
| profiles | id, email, full_name, avatar_url, plan, plan_status, proofs_used, proofs_limit, stripe_id, created_at, updated_at | OK |
| proofs | id, user_id, domain, keyword, score, current_rank, delta_30, ai_overview, narrative, rankings, created_at | **Missing: status, public_slug, is_public, error_message, serp_features** |
| subscriptions | id, user_id, stripe_customer_id, stripe_subscription_id, status, current_period_end | OK |
| proof_views | id, proof_id, viewer_ip_hash, viewed_at | OK |

#### A.1.2 Primary Keys
All 5 tables use UUID with `gen_random_uuid()` default. **PASS**.

#### A.1.3 Foreign Keys and CASCADE rules

| FK | CASCADE on DELETE? | Status |
|----|--------------------|--------|
| profiles.id → auth.users | **NO** — migration `20260226190615` has no `ON DELETE CASCADE` | **CRITICAL FAIL** |
| proofs.user_id → profiles | **NO** — `REFERENCES public.profiles(id)` without CASCADE | **CRITICAL FAIL** |
| subscriptions.user_id → profiles | **NO** — no CASCADE | **CRITICAL FAIL** |
| proof_views.proof_id → proofs | **NO** — no CASCADE | **CRITICAL FAIL** |

Earlier migrations (`001_build_01_schema`, `20260225180256`) include CASCADE, but the latest migration (`20260226190615`) does **not**. If this migration was the one applied, all CASCADE rules are missing.

#### A.1.4 CHECK Constraints
- `profiles.plan` — **NO CHECK** in `20260226190615` (migration `20260225180256` has one but may not have been applied). **FAIL**
- `profiles.plan_status` — **NO CHECK**. **FAIL**
- `proofs.score` — **NO CHECK** (0-100 range). **FAIL**
- `proofs.status` — Column doesn't exist, so N/A.
- `waitlist.source` — Only in migration `20260225175924` (ALTER TABLE ADD CONSTRAINT). **UNCERTAIN** — depends on migration order.
- `waitlist.email` — Email format check only in `20260225175924`. **UNCERTAIN**.

#### A.1.5 Missing Columns (code references columns that don't exist in schema)
- `proofs.status` — Used by `ProofResult.tsx` derivation logic (worked around with `score === 0` check). Code is aligned but column is absent.
- `proofs.public_slug` — Used by `useProofs.ts` `shareProof()`. **BROKEN** — will fail at runtime.
- `proofs.is_public` — Same as above. **BROKEN**.
- `proofs.serp_features` — Referenced in earlier code. Not in schema.

---

### A.2 ROW LEVEL SECURITY AUDIT

#### A.2.1 RLS Enabled

| Table | RLS Enabled? | Status |
|-------|-------------|--------|
| waitlist | Yes | PASS |
| profiles | Yes | PASS |
| proofs | Yes | PASS |
| subscriptions | **UNCERTAIN** — `20260226190615` does NOT have `ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY` | **CRITICAL FAIL** (if this migration was applied alone) |
| proof_views | Yes | PASS |

#### A.2.2 RLS Policies (per `20260226190615`)

| Table | Policy | Status |
|-------|--------|--------|
| waitlist | INSERT WITH CHECK (true) | **WARN** — allows anon inserts. Acceptable for waitlist but no rate limiting at DB level. |
| waitlist | SELECT USING (false) | PASS |
| profiles | SELECT own | PASS |
| profiles | UPDATE own | PASS |
| profiles | **INSERT own** | **WARN** — has INSERT policy (`auth.uid() = id`). Plan says trigger-only. Both exist, so authenticated users could insert duplicate profiles. |
| proofs | SELECT own | PASS |
| proofs | INSERT own | PASS |
| proofs | DELETE own | PASS |
| proofs | **SELECT public** (`is_public = true AND status = 'complete'`) | **CRITICAL FAIL** — references columns `is_public` and `status` that don't exist in the table. This policy will error on evaluation. |
| proofs | **UPDATE own** — mentioned in memory but **NOT in migration** | **FAIL** — Edge Function cannot update proofs via user token without UPDATE policy. |
| subscriptions | SELECT own | Only if migration `20260226190615` section ran. **UNCERTAIN**. |
| subscriptions | **No write policies** | PASS (webhook-only writes via service_role). |
| proof_views | INSERT (true) | PASS |
| proof_views | SELECT (subquery on proofs.user_id) | PASS |

#### A.2.3 Critical RLS Issues
1. **proofs UPDATE policy missing** — The Edge Function authenticates as the user and calls `supabase.from("proofs").update(...)`. Without an UPDATE policy, this will silently fail (0 rows updated). The proof will stay at `score: 0` forever.
2. **proofs public SELECT policy references non-existent columns** — `is_public` and `status` don't exist. This will cause query errors for any anon SELECT on proofs.
3. **Edge Function error handler uses `service_role` key** — Lines 576-584 create a new client with `SUPABASE_SERVICE_ROLE_KEY` to mark failures. This bypasses RLS, which is correct for error handling but means the UPDATE policy gap only affects the success path.

---

### A.3 INDEX PERFORMANCE AUDIT

#### Indexes Found (per migrations)
Only migration `20260225185302` creates indexes:
- `idx_proofs_user_id` on `proofs(user_id)` — PASS
- `idx_proofs_created_at` on `proofs(created_at desc)` — PASS

#### Missing Indexes

| Query Pattern | Expected Index | Status |
|--------------|----------------|--------|
| `proofs WHERE user_id = ? ORDER BY created_at DESC` | Composite `(user_id, created_at DESC)` | **WARN** — two separate indexes exist but not composite. Works but suboptimal. |
| `proofs WHERE public_slug = ?` | Unique index on `public_slug` | **N/A** — column doesn't exist. |
| `proof_views WHERE proof_id = ?` | Index on `proof_views(proof_id)` | **FAIL** — no index. Will seq scan as table grows. |
| `waitlist WHERE email = ?` | Implicit via `UNIQUE` constraint | PASS |
| `profiles WHERE stripe_id = ?` | Index on `profiles(stripe_id)` | **WARN** — no index. Stripe webhooks lookup by stripe_id will seq scan. |

---

### A.4 TRIGGER AUDIT

#### Triggers Found
- `on_auth_user_created` — AFTER INSERT on `auth.users` → `handle_new_user()` — PASS
- `update_profiles_updated_at` — BEFORE UPDATE on `profiles` → `update_updated_at_column()` — PASS

#### Trigger Issues
1. **`handle_new_user()` defined 4 times across migrations** — Only the last-applied definition matters. Latest version (`20260226190615`) inserts `id, email, full_name`. Earlier version (`001_build_01_schema`) only inserts `id`. If migrations ran out of order, the wrong trigger body may be active.
2. **`handle_new_user()` in `20260226190615` lacks `SET search_path = public`** — The function is `SECURITY DEFINER` but without explicit `search_path`, it's vulnerable to search_path hijacking. Migration `20260225180304` fixes this but may not have been applied after `20260226190615`.

---

### A.5 DATA INTEGRITY

Cannot run live queries, but based on schema analysis:

1. **Orphaned proofs risk** — No `ON DELETE CASCADE` on `proofs.user_id → profiles.id`. If a profile is deleted, orphaned proofs will remain and break queries.
2. **Stuck proofs** — With no `status` column, proofs with `score = 0` are indistinguishable from "pending" vs "score genuinely calculated as 0". The code treats `score === 0` as "processing" but the scoring algorithm can return 0 legitimately.
3. **proofs_used enforcement** — No database-level enforcement. The check `proofs_used > proofs_limit` depends entirely on application code. No trigger or constraint prevents exceeding the limit.

---

### A.6 STORAGE & SIZE

- `proofs.rankings` is JSONB storing up to 20 items with 4 fields each. Estimated ~2-4KB per row. **PASS** — well within limits.
- No TOAST or bloat concerns at current scale.

---

## Summary

### CRITICAL FAILS (4)
1. **No ON DELETE CASCADE on any FK** — User deletion will leave orphaned data in proofs, subscriptions, proof_views
2. **proofs UPDATE RLS policy missing** — Edge Function cannot update proof results; proofs stay at score=0 forever
3. **proofs public SELECT policy references non-existent columns** (`is_public`, `status`) — Will error on evaluation
4. **subscriptions RLS may not be enabled** — Depends on migration execution order

### MAJOR WARNS (6)
1. **No CHECK constraints** on `profiles.plan`, `profiles.plan_status`, `proofs.score`
2. **Missing index on `proof_views(proof_id)`** — Will seq scan for view counts
3. **Missing index on `profiles(stripe_id)`** — Stripe webhook lookups will seq scan
4. **`handle_new_user()` may lack `SET search_path`** — Security definer without search_path
5. **`score = 0` ambiguity** — No `status` column means legitimate score of 0 is treated as "processing"
6. **`proofs.public_slug` and `proofs.is_public` columns missing** — `shareProof()` in `useProofs.ts` will fail at runtime
7. **profiles has INSERT RLS policy** — Combined with trigger, allows duplicate profile creation attempts
8. **Multiple competing migration files** — 3 different schema versions; unclear which was actually applied

### PASSED (12)
1. All PKs are UUID with `gen_random_uuid()`
2. RLS enabled on waitlist, profiles, proofs, proof_views
3. waitlist SELECT denied (USING false)
4. profiles SELECT/UPDATE restricted to own
5. proofs SELECT/INSERT/DELETE restricted to own
6. proof_views INSERT open, SELECT restricted to proof owner
7. subscriptions SELECT restricted to own, no write policies
8. `on_auth_user_created` trigger exists
9. `update_profiles_updated_at` trigger exists
10. proofs has indexes on `user_id` and `created_at`
11. JSONB column sizes are reasonable
12. Edge Function uses `service_role` key for error fallback

### RECOMMENDED FIXES (Priority Order)
1. **Add UPDATE RLS policy on proofs** — `FOR UPDATE USING (auth.uid() = user_id)` — blocks proof generation completely
2. **Add ON DELETE CASCADE** to all 4 FK constraints — prevents orphaned data
3. **Add `status` column to proofs** — `TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','complete','failed'))` — resolves score=0 ambiguity
4. **Add `public_slug` and `is_public` columns to proofs** — unblocks share feature
5. **Remove or fix public SELECT policy on proofs** — currently references non-existent columns
6. **Verify subscriptions RLS is enabled** — check in Supabase dashboard
7. **Add CHECK constraints** on profiles.plan, proofs.score
8. **Add index on `proof_views(proof_id)`**
9. **Add index on `profiles(stripe_id)`**
10. **Set `search_path = public`** on `handle_new_user()` function
11. **Consolidate migration files** — remove unused drafts to prevent confusion

