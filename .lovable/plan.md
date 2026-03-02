

## VEXLO — Align Dashboard & NewProof to Target Schema

### Problem

There is a mismatch between three layers:

1. **Current DB types** (auto-generated `types.ts`): columns are `keyword`, `score`, `current_rank`, `delta_30`, `rankings`, `narrative`
2. **Edge Function** (`generate-proof`): already references target schema columns (`proof_score`, `ranking_data`, `status`) that don't exist in the current DB
3. **Target schema** (from knowledge file): `target_keyword`, `proof_score`, `ranking_position`, `ranking_delta`, `ranking_data`, `serp_features`, `ai_narrative`, `status`, `public_slug`, `is_public`, `error_message`, `api_cost_units`

Dashboard.tsx and NewProof.tsx currently use the old column names. The edge function uses a mix. Everything needs to align to the target schema.

### Prerequisite: Database Migration

Before the code changes work end-to-end, the migration SQL from the knowledge file must be applied in the Supabase Dashboard to create the correct `proofs` table with all target columns. After that, the Lovable-generated `types.ts` will auto-update to reflect the new columns.

### Changes

#### 1. Update `src/integrations/supabase/types.ts` (proofs table definition)

Update the `proofs` table types to match the target schema:

- `keyword` becomes `target_keyword`
- `score` becomes `proof_score` (nullable)
- `current_rank` becomes `ranking_position` (nullable)
- `delta_30` becomes `ranking_delta` (nullable)
- `rankings` becomes `ranking_data` (jsonb, nullable)
- `narrative` becomes `ai_narrative` (nullable)
- Add: `serp_features` (jsonb, nullable), `status` (text, default 'pending'), `public_slug` (text, nullable, unique), `is_public` (boolean, default false), `error_message` (text, nullable), `api_cost_units` (integer, nullable)

#### 2. Update `src/pages/NewProof.tsx`

- Change `.insert({ keyword: ... })` to `.insert({ target_keyword: ... })`
- Change `.select("keyword, score, ...")` to `.select("target_keyword, proof_score, ...")`
- Update `ProofResult` interface to use new column names
- Update all UI references: `result.keyword` to `result.target_keyword`, `result.score` to `result.proof_score`, `result.current_rank` to `result.ranking_position`, `result.delta_30` to `result.ranking_delta`, `result.narrative` to `result.ai_narrative`, `result.rankings` to `result.ranking_data`
- Remove `score: 0` from initial insert (now nullable in schema, set by edge function)
- Add `status: 'pending'` to initial insert

#### 3. Update `src/pages/Dashboard.tsx`

- Change `.select("keyword, score, current_rank, ...")` to `.select("target_keyword, proof_score, ranking_position, ...")`
- Update `Proof` interface to match new column names
- Update all UI references in the recent proofs list

#### 4. Fix `supabase/functions/generate-proof/index.ts`

The edge function already uses `proof_score` and `ranking_data` which align with the target schema. Additional fixes:

- Add `ranking_position`, `ranking_delta`, `ai_overview`, `serp_features` to the update call
- Change `status: "scoring_done"` to `status: "complete"` (matching the CHECK constraint)
- Add LLMAPI narrative generation call (or placeholder) to populate `ai_narrative`

### Technical Details

Column name mapping (old to new):

```text
keyword         -> target_keyword
score           -> proof_score
current_rank    -> ranking_position
delta_30        -> ranking_delta
rankings        -> ranking_data
narrative       -> ai_narrative
(new)           -> serp_features
(new)           -> status
(new)           -> public_slug
(new)           -> is_public
(new)           -> error_message
(new)           -> api_cost_units
```

Files modified: 4 (`types.ts`, `Dashboard.tsx`, `NewProof.tsx`, `generate-proof/index.ts`)

