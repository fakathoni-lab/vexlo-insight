

## Dynadot Domain Integration for VEXLO

### Context
VEXLO needs domain availability checking, pricing retrieval, and future registration capability via Dynadot's RESTful API v2. All logic runs exclusively in Supabase Edge Functions. No frontend exposure of API keys.

### Prerequisites -- Secret Setup
Two secrets are needed before implementation:
- `DYNADOT_API_KEY` -- from Dynadot account > Tools > API
- `DYNADOT_API_SECRET` -- for HMAC-SHA256 request signing (required for transactional endpoints like register)

I will prompt you to add these secrets before writing the Edge Functions.

### Architecture

```text
Frontend (React)
    │
    ▼
supabase.functions.invoke("domain-check")
supabase.functions.invoke("domain-register")
    │
    ▼
Edge Functions (Deno)
    ├── domain-check/index.ts     ← search + pricing (read-only)
    └── domain-register/index.ts  ← registration (transactional, X-Signature)
    │
    ▼
Dynadot REST API v2
    GET /restful/v2/domains/{domain}/search?show_price=true&currency=usd
    POST /restful/v2/domains/{domain}/register (requires HMAC signing)
```

### Implementation Plan

#### 1. Add Supabase Secrets
- `DYNADOT_API_KEY` and `DYNADOT_API_SECRET`

#### 2. Edge Function: `domain-check`
Single function handling availability + multi-year pricing in one call.

- **Auth**: Authenticated users only (getClaims)
- **Input**: `{ domain: "example.com" }` validated with Zod
- **Dynadot call**: `GET /restful/v2/domains/{domain}/search?show_price=true&currency=usd`
- **Response normalization**:
```json
{
  "success": true,
  "domain": "example.com",
  "available": true,
  "premium": false,
  "pricing": {
    "1": { "registration": 10.99, "renewal": 12.99 },
    "2": { "registration": 21.98, "renewal": 25.98 },
    "3": { "registration": 32.97, "renewal": 38.97 }
  },
  "currency": "USD"
}
```
- **Caching**: Uses existing Upstash Redis with 5-minute TTL for availability, 1-hour TTL for pricing
- **Rate limiting**: Per-user limit (10 checks/minute) via Redis sliding window
- **Security**: Domain input sanitized, lowercased, stripped of protocol/path; no raw Dynadot errors leaked

#### 3. Edge Function: `domain-register` (Phase 2 -- architecture only)
Registration is a financial transaction. This function will be scaffolded but not wired to the frontend yet, matching the existing constraint that Dynadot registration is deferred from MVP Stage 1.

- **Auth**: Authenticated + plan check
- **Input**: `{ domain, years, contact_info }` with Zod
- **HMAC-SHA256 signing**: Uses `DYNADOT_API_SECRET` to compute `X-Signature` header
- **Idempotency**: `X-Request-ID` header with UUID per request
- **DB logging**: Insert into a new `domain_orders` table before calling Dynadot, update status after

#### 4. Database Migration
New `domain_orders` table (for Phase 2 readiness):
- `id` (uuid), `user_id` (fk profiles), `domain` (text), `years` (int), `status` (pending/processing/complete/failed), `dynadot_order_id` (text nullable), `amount` (numeric), `created_at`, `updated_at`
- RLS: users can only read their own orders

#### 5. Update `supabase/config.toml`
Add `[functions.domain-check]` and `[functions.domain-register]` with `verify_jwt = false`.

#### 6. Frontend Hook: `useDomainCheck`
- Custom hook wrapping `supabase.functions.invoke("domain-check")`
- Returns `{ data, isLoading, error, checkDomain }`
- Used in a future Domain Search UI component

### Security Notes
- API key stored as Supabase secret, accessed only in Edge Functions via `Deno.env.get()`
- HMAC-SHA256 signature prevents request tampering on transactional endpoints
- All domain inputs sanitized server-side (lowercase, ASCII-only, no subdomains)
- Per-user rate limiting via Redis prevents abuse
- Raw Dynadot error messages are never forwarded to the client
- No `.env` files -- Lovable uses Supabase secrets exclusively

### What Gets Built Now vs Later
| Now (this implementation) | Later (Phase 2) |
|---|---|
| `domain-check` Edge Function (fully functional) | `domain-register` Edge Function (scaffolded, not wired) |
| Redis caching + rate limiting | Domain purchase UI flow |
| `useDomainCheck` hook | `domain_orders` table + full registration |
| Config.toml updates | Stripe payment integration for domains |

### Technical Details
- **Dynadot API v2 base URL**: `https://api.dynadot.com/restful/v2`
- **Auth header**: `Authorization: Bearer {DYNADOT_API_KEY}`
- **Accept header**: `application/json`
- **Search endpoint returns** pricing for 1-10 years automatically when `show_price=true`
- **Rate limits**: Regular tier = 1 req/sec, 60/min

