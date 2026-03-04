

# Plan: Wire Real Polar Product IDs + Add `polar_product_id` to Plans Table

## What Was Done (Pre-work)
I already created the 3 Polar subscription products:

| Tier | Polar Product ID | Price |
|------|-----------------|-------|
| Starter | `48594d7c-4b3b-4d03-9db6-2bc2657b5d4f` | $39/mo |
| Agency Pro | `c24835d7-bf2c-4aeb-9cc9-91836d0d1344` | $79/mo |
| Agency Elite | `455ba481-8440-48e2-aff9-508f4445dd01` | $149/mo |

## Implementation Steps

### 1. Database Migration: Add `polar_product_id` column to `plans`
Add a nullable `TEXT` column with a unique constraint, then populate it with the real Polar IDs:

```sql
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS polar_product_id TEXT UNIQUE;

UPDATE public.plans SET polar_product_id = '48594d7c-4b3b-4d03-9db6-2bc2657b5d4f' WHERE name = 'starter';
UPDATE public.plans SET polar_product_id = 'c24835d7-bf2c-4aeb-9cc9-91836d0d1344' WHERE name = 'agency_pro';
UPDATE public.plans SET polar_product_id = '455ba481-8440-48e2-aff9-508f4445dd01' WHERE name = 'agency_elite';
```

### 2. Update `src/hooks/usePolarCheckout.ts`
Replace the 3 placeholder constants with the real Polar product IDs:

```typescript
export const POLAR_PRODUCT_STARTER = "48594d7c-4b3b-4d03-9db6-2bc2657b5d4f";
export const POLAR_PRODUCT_AGENCY_PRO = "c24835d7-bf2c-4aeb-9cc9-91836d0d1344";
export const POLAR_PRODUCT_AGENCY_ELITE = "455ba481-8440-48e2-aff9-508f4445dd01";
```

### 3. Update `src/components/Pricing.tsx`
The Pricing component already imports these constants — no changes needed. It will automatically use the real IDs.

### 4. Update `polar-webhook` edge function
The webhook currently maps `sub.product?.name` to plan name. With the new `polar_product_id` column, update the webhook to also look up by product ID for more reliable plan resolution (product names can change, IDs don't).

### What This Fixes
- Payment checkout flow becomes fully functional (no more placeholder IDs)
- Plans table becomes the single source of truth for Polar product ID mapping
- Webhook can reliably resolve which plan a subscription belongs to

