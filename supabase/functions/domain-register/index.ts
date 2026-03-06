import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function errResponse(code: string, message: string, status: number): Response {
  return new Response(
    JSON.stringify({ success: false, error: code, message }),
    { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

function log(fields: Record<string, unknown>) {
  if (Deno.env.get("ENVIRONMENT") !== "production") {
    console.log(JSON.stringify({ ts: new Date().toISOString(), fn: "domain-register", ...fields }));
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startMs = Date.now();

  try {
    // ── Auth ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return errResponse("UNAUTHORIZED", "Authentication required.", 401);
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return errResponse("UNAUTHORIZED", "Invalid session.", 401);
    }

    const userId = user.id;

    // ── Input validation ──
    const body = await req.json();
    const { domain, years } = body;

    if (typeof domain !== "string" || !domain.trim()) {
      return errResponse("INVALID_INPUT", "Domain is required.", 400);
    }
    if (![1, 2, 3].includes(years)) {
      return errResponse("INVALID_INPUT", "Duration must be 1, 2, or 3 years.", 400);
    }

    const cleanDomain = domain.trim().toLowerCase();

    // ── Service role client for DB ops ──
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── Plan gate ──
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("plan")
      .eq("id", userId)
      .single();

    const allowedPlans = ["agency_pro", "agency_elite"];
    if (!profile || !allowedPlans.includes(profile.plan ?? "")) {
      return errResponse(
        "PLAN_GATE",
        "Domain infrastructure is available on Agency Pro and Elite plans. Upgrade to unlock.",
        403
      );
    }

    // ── Check domain not already owned ──
    const { data: existingDomain } = await supabaseAdmin
      .from("domains")
      .select("id")
      .eq("domain_name", cleanDomain)
      .maybeSingle();

    if (existingDomain) {
      return errResponse(
        "ALREADY_OWNED",
        "This domain is already registered in VEXLO.",
        409
      );
    }

    // ── Call Dynadot API to register ──
    const apiKey = Deno.env.get("DYNADOT_API_KEY");
    if (!apiKey) {
      return errResponse("SERVICE_UNAVAILABLE", "Domain registration service not configured.", 503);
    }

    const dynadotUrl = `https://api.dynadot.com/api3.json?key=${encodeURIComponent(apiKey)}&command=register&domain=${encodeURIComponent(cleanDomain)}&duration=${years}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    // Route through proxy if configured
    let rawProxyUrl = Deno.env.get("PROXY_URL") ?? "";
    const proxyMatch = rawProxyUrl.match(/https?:\/\/[^\s"']+@[^\s"'/]+:\d+/);
    if (proxyMatch) rawProxyUrl = proxyMatch[0];

    let httpClient: Deno.HttpClient | undefined;
    if (rawProxyUrl && rawProxyUrl.startsWith("http")) {
      try {
        const parsed = new URL(rawProxyUrl);
        const proxyBase = `${parsed.protocol}//${parsed.hostname}:${parsed.port}`;
        const proxyAuth = parsed.username && parsed.password
          ? { username: decodeURIComponent(parsed.username), password: decodeURIComponent(parsed.password) }
          : undefined;
        httpClient = Deno.createHttpClient({
          proxy: { url: proxyBase, basicAuth: proxyAuth },
        });
      } catch (proxyErr) {
        log({ event: "proxy_init_error", error: String(proxyErr) });
      }
    }

    let dynaRes: Response;
    try {
      dynaRes = await fetch(dynadotUrl, {
        method: "GET",
        signal: controller.signal,
        ...(httpClient ? { client: httpClient } : {}),
      } as RequestInit);
    } catch (fetchErr) {
      clearTimeout(timeout);
      log({ event: "dynadot_register_error", error: String(fetchErr) });
      return errResponse("REGISTRATION_FAILED", "Registration failed. You have not been charged. Please try again.", 503);
    }
    clearTimeout(timeout);

    if (!dynaRes.ok) {
      log({ event: "dynadot_http_error", status: dynaRes.status });
      return errResponse("REGISTRATION_FAILED", "Registration failed. You have not been charged. Please try again.", 503);
    }

    const dynaData = await dynaRes.json();
    log({ event: "dynadot_register_response", data: JSON.stringify(dynaData).slice(0, 500) });

    // Check for API-level errors
    const regHeader = dynaData?.RegisterResponse?.RegisterHeader;
    if (regHeader?.Status === "error" || dynaData?.Response?.ResponseCode === "-1") {
      const errorMsg = regHeader?.Error ?? dynaData?.Response?.Error ?? "Unknown error";
      log({ event: "dynadot_register_api_error", error: errorMsg });

      // Check if domain was taken (race condition)
      if (errorMsg.toLowerCase().includes("not available") || errorMsg.toLowerCase().includes("already registered")) {
        return errResponse(
          "ALREADY_REGISTERED",
          "This domain was just registered by someone else. Try a variation.",
          409
        );
      }

      return errResponse("REGISTRATION_FAILED", "Registration failed. You have not been charged. Please try again.", 503);
    }

    // Extract domain ID from response
    const dynadotDomainId = regHeader?.DomainName ?? cleanDomain;
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + years);

    // ── Save to domains table ──
    const tld = cleanDomain.split(".").slice(1).join(".");

    const { error: domainInsertError } = await supabaseAdmin
      .from("domains")
      .insert({
        user_id: userId,
        domain_name: cleanDomain,
        tld,
        status: "active",
        expires_at: expiresAt.toISOString(),
        auto_renew: true,
        registered_at: new Date().toISOString(),
        dynadot_domain_id: String(dynadotDomainId),
        registration_years: years,
      });

    if (domainInsertError) {
      // Critical: domain registered at Dynadot but DB insert failed
      console.error("CRITICAL: Domain registered but DB insert failed:", domainInsertError.message);
    }

    // ── Save to domain_orders table ──
    await supabaseAdmin
      .from("domain_orders")
      .insert({
        user_id: userId,
        domain_name: cleanDomain,
        order_type: "register",
        years,
        status: "completed",
      });

    log({ event: "domain_registered", domain: cleanDomain, years, latency_ms: Date.now() - startMs });

    return new Response(
      JSON.stringify({
        success: true,
        domain: cleanDomain,
        expires_at: expiresAt.toISOString(),
        message: "Infrastructure position secured.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("domain-register unhandled:", err);
    return errResponse("INTERNAL_ERROR", "An unexpected error occurred.", 500);
  }
});
