

# Dynadot API Integration -- Findings and Fix Plan

## Current Situation

The `domain-check` edge function correctly uses the **Dynadot Legacy API v3** (`api3.json`) with query parameter authentication. The API call format, response parsing, and caching logic are all correct per the official documentation.

**The only blocker is Dynadot's IP whitelist.** Supabase Edge Functions use dynamic IPs (confirmed from logs: `18.153.208.84`, `3.125.157.52`, `63.179.134.38` -- all different per request). Dynadot rejects every call with `"unauthorized ip address"`.

## API Documentation Summary

From the official Dynadot docs at `/domain/api-commands`:

- **Base URL**: `https://api.dynadot.com/api3.json`
- **Auth**: Query param `key=[API_KEY]`
- **Search**: `command=search&domain0=example.com&show_price=1&currency=USD`
- **Response**: `{ SearchResponse: { ResponseCode, SearchResults: [{ DomainName, Available, Price }] } }`
- **Register**: `command=register&domain=example.com&duration=1&currency=USD`
- **Sandbox**: `https://api-sandbox.dynadot.com/api3.json` (same format, test key)
- **Rate limits**: Regular accounts = 1 thread, 60 req/min

Our current implementation matches this spec correctly.

## Fix: Remove IP Restrictions on Dynadot

The simplest and recommended fix -- no code changes needed:

1. Go to **Dynadot Account** > **Tools** > **API** settings
2. **Remove all IP addresses** from the whitelist, or set it to allow all IPs
3. The API key itself provides authentication security

Dynadot's IP whitelist is incompatible with serverless platforms like Supabase Edge Functions because outgoing IPs are not static. The API key alone is sufficient security for the `search` command (read-only, no financial transactions).

## Alternative: Use Dynadot Sandbox for Testing

If you want to test without touching production settings:

- Change the URL to `https://api-sandbox.dynadot.com/api3.json`
- Use a **Sandbox API Key** (separate from the production key)
- Sandbox may have different or no IP restrictions

## No Code Changes Required

The edge function code is already correct. The only action needed is a Dynadot account configuration change to remove IP restrictions.

