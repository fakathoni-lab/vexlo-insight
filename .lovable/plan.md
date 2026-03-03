

## Problem

The `polar-webhook` updates `profiles.plan` (text) but never sets `proofs_limit`. After a user upgrades to Agency Pro, their `proofs_limit` stays at 5 (the default). This is Critical Bug C1 from the knowledge file.

## Current State

- No `plans` table exists in the database (M7 from knowledge file). Limits must be resolved in code until the table is created.
- The webhook sets `plan` name on profiles but ignores `proofs_limit` entirely.
- On cancellation, `plan` is set to `"free"` but `proofs_limit` is not reset to 5.

## Plan

**Single file change: `supabase/functions/polar-webhook/index.ts`**

1. Add a `getPlanLimit(planName: string): number` function with a hardcoded map:
   - `free` → 5
   - `starter` → 50
   - `agency_pro` / `agency pro` → 200
   - `agency_elite` / `agency elite` → 999999
   - default → 5

2. In the `subscription.created` / `subscription.updated` handler (line 120-124), add `proofs_limit: getPlanLimit(planName)` to the profile update.

3. In the `subscription.canceled` / `subscription.revoked` handler (line 141-145), add `proofs_limit: 5` to the profile update.

4. Add `console.log` with plan and limit values at each update point per knowledge file requirement.

No other files touched. No DB migration needed (the `proofs_limit` column already exists on profiles).

## Why hardcoded map (not plans table query)

The `plans` table doesn't exist yet (M7). Creating it is a separate task. This fix uses a simple function that can later be swapped to a DB query when the table is created. The knowledge file explicitly lists both C1 (this fix) and M7 (plans table) as separate items.

