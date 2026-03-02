import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Helpers ──────────────────────────────────────────────────────────

function sanitizeDomain(raw: string): string | null {
  let d = raw.trim().toLowerCase();
  d = d.replace(/^https?:\/\//, "");
  d = d.split("/")[0].split("?")[0].split("#")[0];
  d = d.replace(/^www\./, "");
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z]{2,})+$/.test(d)) return null;
  if (d.length < 3 || d.length > 253) return null;
  return d;
}

function extractTld(domain: string): string {
  const parts = domain.split(".");
  return parts.length > 1 ? `.${parts[parts.length - 1]}` : "unknown";
}

async function hashString(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Convert a hex hash to a deterministic UUID v4 format for storage in uuid column */
function hashToUuid(hex: string): string {
  const h = hex.slice(0, 32);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

function log(fields: Record<string, unknown>) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), fn: "domain-check", ...fields }));
}

function errResponse(code: string, message: string, status: number): Response {
  return new Response(
    JSON.stringify({ success: false, error: code, message }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// ── Main Handler ────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  const startMs = Date.now();

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── Auth (optional) ──
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const supabaseUser = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user } } = await supabaseUser.auth.getUser();
      userId = user?.id ?? null;
    }

    // Rate limit identifier: user_id if logged in, otherwise IP hash → deterministic UUID
    let rateLimitId: string;
    let logHash: string;

    if (userId) {
      rateLimitId = userId;
      logHash = await hashString(userId);
    } else {
      const clientIp =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("cf-connecting-ip") ||
        "unknown";
      const ipHash = await hashString(clientIp);
      rateLimitId = hashToUuid(ipHash);
      logHash = ipHash.slice(0, 16);
    }

    // ── Rate limit (DB-backed) ──
    const windowStart = new Date(Date.now() - 60_000).toISOString();

    const { data: rateRow } = await supabaseAdmin
      .from("domain_check_rate_limit")
      .select("id, request_count, window_start")
      .eq("user_id", rateLimitId)
      .gte("window_start", windowStart)
      .maybeSingle();

    if (rateRow && rateRow.request_count >= 10) {
      log({ request_id: requestId, event: "rate_limited", id_hash: logHash });
      return errResponse("RATE_LIMITED", "Too many requests. Try again in a minute.", 429);
    }

    if (rateRow) {
      await supabaseAdmin
        .from("domain_check_rate_limit")
        .update({ request_count: rateRow.request_count + 1 })
        .eq("id", rateRow.id);
    } else {
      await supabaseAdmin
        .from("domain_check_rate_limit")
        .delete()
        .eq("user_id", rateLimitId)
        .lt("window_start", windowStart);

      await supabaseAdmin
        .from("domain_check_rate_limit")
        .insert({ user_id: rateLimitId, request_count: 1, window_start: new Date().toISOString() });
    }

    // ── Input validation ──
    const body = await req.json();
    const rawDomain = body?.domain;
    if (typeof rawDomain !== "string" || !rawDomain) {
      return errResponse("INVALID_DOMAIN", "Please provide a domain name.", 400);
    }

    const domain = sanitizeDomain(rawDomain);
    if (!domain) {
      return errResponse("INVALID_DOMAIN", "Invalid domain format. Example: example.com", 400);
    }

    const tld = extractTld(domain);

    // ── Cache check ──
    const { data: cached } = await supabaseAdmin
      .from("domain_availability_cache")
      .select("*")
      .eq("domain", domain)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (cached) {
      const ttl = Math.max(0, Math.round((new Date(cached.expires_at).getTime() - Date.now()) / 1000));
      log({
        request_id: requestId,
        domain_tld: tld,
        cache_hit: true,
        available: cached.available,
        latency_ms: Date.now() - startMs,
        id_hash: logHash,
      });

      return new Response(
        JSON.stringify({
          success: true,
          domain: cached.domain,
          available: cached.available,
          premium: cached.premium ?? false,
          pricing: cached.pricing ?? {},
          currency: cached.currency ?? "USD",
          checked_at: cached.checked_at,
          source: "cache" as const,
          ttl,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Dynadot API call ──
    const apiKey = Deno.env.get("DYNADOT_API_KEY");
    if (!apiKey) {
      console.error("DYNADOT_API_KEY not configured");
      return errResponse("SERVICE_UNAVAILABLE", "Domain lookup service temporarily unavailable.", 503);
    }

    const dynadotUrl = `https://api.dynadot.com/restful/v2/domains/${encodeURIComponent(domain)}/search?show_price=true&currency=usd`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    let dynaRes: Response;
    try {
      dynaRes = await fetch(dynadotUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        signal: controller.signal,
      });
    } catch (_fetchErr) {
      clearTimeout(timeout);
      log({ request_id: requestId, domain_tld: tld, event: "dynadot_error", latency_ms: Date.now() - startMs });
      return errResponse("SERVICE_UNAVAILABLE", "Domain lookup service temporarily unavailable.", 503);
    }
    clearTimeout(timeout);

    if (!dynaRes.ok) {
      log({ request_id: requestId, domain_tld: tld, event: "dynadot_http_error", status: dynaRes.status, latency_ms: Date.now() - startMs });
      return errResponse("SERVICE_UNAVAILABLE", "Domain lookup service temporarily unavailable.", 503);
    }

    const dynaData = await dynaRes.json();

    // ── Normalize response ──
    const searchResults = dynaData?.SearchResponse?.SearchResults ?? [];
    const result = searchResults[0] ?? {};

    const available = result?.Available === "yes" || result?.Available === true;
    const premium = result?.IsPremium === "yes" || result?.IsPremium === true;

    const pricing: Record<string, { registration: number; renewal: number }> = {};
    const regPrice = parseFloat(result?.Price?.Registration ?? result?.Price ?? "0");
    const renewPrice = parseFloat(result?.Price?.Renewal ?? result?.Price ?? "0");

    for (let y = 1; y <= 3; y++) {
      pricing[String(y)] = {
        registration: Math.round(regPrice * y * 100) / 100,
        renewal: Math.round(renewPrice * y * 100) / 100,
      };
    }

    const checkedAt = new Date().toISOString();
    const ttlSeconds = available ? 3600 : 600;
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

    // ── Write cache (upsert) ──
    await supabaseAdmin
      .from("domain_availability_cache")
      .upsert(
        {
          domain,
          available,
          premium,
          pricing,
          price: regPrice > 0 ? regPrice : null,
          currency: "USD",
          checked_at: checkedAt,
          expires_at: expiresAt,
          source: "live",
        },
        { onConflict: "domain" }
      );

    log({
      request_id: requestId,
      domain_tld: tld,
      cache_hit: false,
      available,
      latency_ms: Date.now() - startMs,
      id_hash: logHash,
    });

    return new Response(
      JSON.stringify({
        success: true,
        domain,
        available,
        premium,
        pricing,
        currency: "USD",
        checked_at: checkedAt,
        source: "live" as const,
        ttl: ttlSeconds,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    log({ request_id: requestId, event: "unhandled_error", latency_ms: Date.now() - startMs });
    console.error("domain-check error:", err);
    return errResponse("INTERNAL_ERROR", "An unexpected error occurred.", 500);
  }
});
