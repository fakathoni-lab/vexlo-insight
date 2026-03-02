

## Plan: Update App Code for New Database Columns

Now that the migration added `status`, `public_slug`, `is_public`, `error_message`, and `serp_features` columns to `proofs`, all code needs to stop using the `score === 0` / `score === -1` workarounds and use proper columns instead.

### Files to Change (7 files)

**1. `src/integrations/supabase/types.ts`** — Add new columns to proofs type
- Add to Row: `status: string`, `public_slug: string | null`, `is_public: boolean | null`, `error_message: string | null`, `serp_features: Json | null`
- Add to Insert: `status?: string`, `public_slug?: string | null`, `is_public?: boolean | null`, `error_message?: string | null`, `serp_features?: Json | null`
- Add to Update: same optional fields
- This removes the need for all `as any` casts on proofs queries

**2. `src/pages/NewProof.tsx`** — Use `status` column on insert
- Change insert to include `status: "pending"` instead of relying on DB default
- Remove `score: 0` from insert (DB defaults to 0, and status handles the state)

**3. `src/pages/ProofResult.tsx`** — Use `status` column for state derivation
- Add `status`, `public_slug`, `is_public`, `error_message` to `Proof` interface
- Replace `derivedStatus` logic (`score === 0` etc.) with `proof.status`
- Trigger edge function when `status === "pending"` instead of `score === 0`
- Show `error_message` in the failed state instead of `narrative`
- Re-add `ProofActions` bar for complete proofs (Share Link + Copy Narrative)

**4. `src/pages/Dashboard.tsx`** — Use `status` column for display
- Add `status` to the Proof interface and select query
- Replace `proof.score > 0` check with `proof.status === "complete"`
- Show "pending"/"processing"/"failed" badges based on `status`

**5. `supabase/functions/generate-proof/index.ts`** — Write `status` column
- Set `status: "processing"` at start of function
- Set `status: "complete"` in the success update payload
- Set `status: "failed"` + `error_message` in the error handler (instead of `score: -1`)
- Remove the `score: -1` error indicator hack

**6. `src/hooks/useProofs.ts`** — Remove `as any` casts
- `shareProof`: remove all `as any` casts since `public_slug` and `is_public` are now typed
- `getViewCount`/`trackProofView`: keep `as any` for `proof_views` (not in types yet — separate table)

**7. `src/pages/PublicProof.tsx`** — Use `status` column
- Add `status` to Proof interface
- Replace `score === 0` / `score < 0` checks with `status` field
- Stop polling when `status !== "pending" && status !== "processing"`

### Technical Details

- The `score: -1` hack is fully eliminated — `score` stays as a clean 0-100 number
- `ProofActions` component is already built and working — just needs to be wired back into `ProofResult.tsx`
- All `as any` casts on proofs queries are removed since types now match the schema
- `proof_views` table is still missing from types, so those casts remain

