

## Fix C2: Connect Pricing CTA Buttons to Polar Checkout

### Problem
All three tier CTA buttons link to `#waitlist` instead of triggering Polar checkout. This is Critical Bug C2.

### Changes

**File 1: `src/hooks/usePolarCheckout.ts`**
- Replace the single `POLAR_PREMIUM_PRODUCT_ID` with three named constants (placeholder values with `// [PLACEHOLDER]` comments):
  - `POLAR_PRODUCT_STARTER`
  - `POLAR_PRODUCT_AGENCY_PRO`
  - `POLAR_PRODUCT_AGENCY_ELITE`
- Export these constants so `Pricing.tsx` can import them.
- Keep the hook logic unchanged.

**File 2: `src/components/Pricing.tsx`**
- Import `useAuth` (for user/loading state), `usePolarCheckout`, `useNavigate`, and the product ID constants.
- Add `planKey` to each tier object mapping tier name to the internal plan string (`starter`, `agency_pro`, `agency_elite`) and its `productId`.
- Replace the `<a href="#waitlist">` with a `<button>` that implements 4 states:
  1. **Not logged in** → navigate to `/signup`
  2. **Logged in, free plan** → call `checkout(productId)` → opens Polar
  3. **Same plan as current** → button disabled, text "Current Plan"
  4. **Different paid plan (upgrade)** → call `checkout(productId)`
- Fetch user's current plan from `profiles` table on mount (single query: `plan` column).
- Show loading spinner on the button being clicked (use `isLoading` from hook).

### User flow for success criteria
Free user clicks "Agency Pro" → `usePolarCheckout.checkout(POLAR_PRODUCT_AGENCY_PRO)` → edge function creates Polar session → redirects to Polar checkout page.

