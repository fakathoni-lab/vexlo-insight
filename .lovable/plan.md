

## Diagnosis: Proof Generation Fails Silently

### Root Cause

The **Supabase types are out of sync with the actual database schema**. The generated types in `src/integrations/supabase/types.ts` use **old column names**, but the code in `NewProof.tsx` and `ProofResult.tsx` uses the **actual database column names**.

**Types file says the `proofs` table has:**
- `keyword` (not `target_keyword`)
- `score` (not `proof_score`, and it's **required/non-nullable**)
- `current_rank` (not `ranking_position`)
- `delta_30` (not `ranking_delta`)
- `narrative` (not `ai_narrative`)
- `rankings` (not `ranking_data`)
- No `status`, `public_slug`, `is_public`, `error_message`, `serp_features`, `api_cost_units`, `target_keyword` columns

**NewProof.tsx inserts:**
```ts
{ user_id, domain, target_keyword, status: "pending" }
```

This doesn't match the typed Insert schema which requires `keyword` (not `target_keyword`) and `score` (required, non-nullable number). The `as any` cast suppresses the TypeScript error, but the **actual database columns** are what matter at runtime.

### Two Possible Scenarios

**Scenario A** — The database has the new columns (`target_keyword`, `status`, `proof_score`, etc.) but types weren't regenerated. In this case the insert works at the DB level but `.single()` may fail because the returned columns don't match what TypeScript expects, causing a silent swallow.

**Scenario B** — The database still has the old columns (`keyword`, `score`). In this case the insert fails because `target_keyword` doesn't exist as a column, and `score` (required, NOT NULL) is missing. The `as any` cast hides the type error, and the error toast may not show if the error object structure is unexpected.

### Most Likely: Scenario B or a hybrid

The insert silently fails because:
1. Column `target_keyword` doesn't exist (should be `keyword`)
2. Column `status` may not exist
3. Column `score` is NOT NULL with no default, and isn't provided

The `as any` cast masks all of this at compile time. At runtime, Supabase returns an error, but since the code does handle `insertError`, the toast should show — unless the user missed it.

### Minimal Fix (2 steps)

**Step 1: Regenerate Supabase types** — If the database was migrated to use `target_keyword`, `status`, `proof_score`, etc., regenerate types so they match. This is done via the Lovable Supabase integration.

**Step 2: If types reflect reality (old columns)**, update `NewProof.tsx` insert to use the correct column names:
```ts
.insert({
  user_id: user.id,
  domain: data.domain,
  keyword: data.keyword,       // not target_keyword
  score: 0,                    // required, set initial value
  // status column may not exist
})
```

And update `ProofResult.tsx` and `generate-proof/index.ts` to use the actual column names from the database.

**Step 3: Remove all `as any` casts** on Supabase queries so TypeScript catches column mismatches at build time instead of failing silently at runtime.

### Recommendation

Before I make any code changes, please:
1. **Check your Supabase dashboard** → Table Editor → `proofs` table → confirm the actual column names
2. Or **regenerate types** via Lovable's Supabase integration (this will update `types.ts` to match reality)

Then confirm which column names are correct and I'll apply the fix.

