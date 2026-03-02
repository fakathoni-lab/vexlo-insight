import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Helpers ──────────────────────────────────────────────────────────

/** Sanitize & validate a domain string */
function sanitizeDomain(raw: string): string | null {
  let d = raw.trim().toLowerCase();
  // strip protocol
  d = d.replace(/^https?:\/\//, "");
  // strip path / query / hash
  d = d.split("/")[0].split("?")[0].split("#")[0];
  // strip leading www.
  d = d.replace(/^www\./, "");
  // basic validation: must have at least one dot, ASCII only, 3-253 chars
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z]{2,})+$/.test(d)) return null;
  if (d.length < 3 || d.length > 253) return null;
  return d;
}

/** Simple in-memory rate limiter (per isolate – good enough for edge) */
const rateBuckets = new Map<string, { count: number; reset: number }>();
function checkRate(userId: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(userId);
  if (!bucket || now > bucket.reset) {
    rateBuckets.set(userId, { count: 1, reset: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count++;
  return true;
}

// ── Main Handler ────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Auth ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const userId = claimsData.claims.sub as string;

    // ── Rate limit ──
    if (!checkRate(userId)) {
      return new Response(
        JSON.stringify({ success: false, error: "Rate limit exceeded. Try again in a minute." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Input validation ──
    const body = await req.json();
    const rawDomain = body?.domain;
    if (typeof rawDomain !== "string" || !rawDomain) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing 'domain' field" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const domain = sanitizeDomain(rawDomain);
    if (!domain) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid domain format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Dynadot API call ──
    const apiKey = Deno.env.get("DYNADOT_API_KEY");
    if (!apiKey) {
      console.error("DYNADOT_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Service temporarily unavailable" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
    } catch (fetchErr) {
      clearTimeout(timeout);
      console.error("Dynadot fetch error:", fetchErr);
      return new Response(
        JSON.stringify({ success: false, error: "Domain lookup service unavailable" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    clearTimeout(timeout);

    if (!dynaRes.ok) {
      console.error(`Dynadot API returned ${dynaRes.status}`);
      return new Response(
        JSON.stringify({ success: false, error: "Domain lookup failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const dynaData = await dynaRes.json();

    // ── Normalize response ──
    // Dynadot v2 search returns: { "SearchResponse": { "SearchHeader": {...}, "SearchResults": [...] } }
    const searchResults = dynaData?.SearchResponse?.SearchResults ?? [];
    const result = searchResults[0] ?? {};

    const available = result?.Available === "yes" || result?.Available === true;
    const premium = result?.IsPremium === "yes" || result?.IsPremium === true;

    // Build multi-year pricing from Dynadot response
    const pricing: Record<string, { registration: number; renewal: number }> = {};
    const regPrice = parseFloat(result?.Price?.Registration ?? result?.Price ?? "0");
    const renewPrice = parseFloat(result?.Price?.Renewal ?? result?.Price ?? "0");

    for (let y = 1; y <= 3; y++) {
      pricing[String(y)] = {
        registration: Math.round(regPrice * y * 100) / 100,
        renewal: Math.round(renewPrice * y * 100) / 100,
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        domain,
        available,
        premium,
        pricing,
        currency: "USD",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("domain-check error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
