import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DOMAIN_RE = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
const DATAFORSEO_BASE = "https://api.dataforseo.com/v3";

function cleanDomain(raw: string): string {
  return raw.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "").toLowerCase().trim();
}

function getDfsAuth(): string {
  const login = Deno.env.get("DATAFORSEO_LOGIN");
  const password = Deno.env.get("DATAFORSEO_PASSWORD");
  if (!login || !password) throw new Error("Missing DataForSEO credentials");
  return `Basic ${btoa(`${login}:${password}`)}`;
}

function calculateScore(rankPosition: number | null, nonOrganicCount: number): number {
  let rankScore = 0;
  if (rankPosition !== null && rankPosition > 0) {
    if (rankPosition === 1) rankScore = 100;
    else if (rankPosition <= 3) rankScore = 94;
    else if (rankPosition <= 10) rankScore = Math.round(90 - ((rankPosition - 4) / 6) * 40);
    else if (rankPosition <= 20) rankScore = Math.round(45 - ((rankPosition - 11) / 9) * 40);
  }
  const aiImpact = Math.min(100, Math.round((nonOrganicCount / 10) * 100));
  let aiScore = 100;
  if (aiImpact > 40) aiScore = 10;
  else if (aiImpact > 20) aiScore = 40;
  else if (aiImpact > 0) aiScore = 70;

  return Math.max(0, Math.min(100, Math.round(rankScore * 0.7 + aiScore * 0.3)));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { domain: rawDomain, keyword } = await req.json();

    if (!rawDomain || !keyword) {
      return new Response(
        JSON.stringify({ error: "Missing domain or keyword" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const domain = cleanDomain(rawDomain);
    if (!DOMAIN_RE.test(domain)) {
      return new Response(
        JSON.stringify({ error: "Invalid domain format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const kw = keyword.replace(/[<>'"&]/g, "").trim().toLowerCase().slice(0, 100);
    if (kw.length < 2) {
      return new Response(
        JSON.stringify({ error: "Keyword too short" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Single lightweight SERP call — depth 10 only
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(`${DATAFORSEO_BASE}/serp/google/organic/live/advanced`, {
      method: "POST",
      headers: {
        Authorization: getDfsAuth(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify([{
        keyword: kw,
        location_name: "United States",
        language_code: "en",
        device: "desktop",
        os: "windows",
        depth: 10,
      }]),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const data = await res.json();
    const items = data?.tasks?.[0]?.result?.[0]?.items ?? [];

    let rankPosition: number | null = null;
    let nonOrganicCount = 0;

    for (const item of items) {
      const t = (item.type ?? "").toLowerCase();
      if (t === "organic") {
        if (rankPosition === null && item.url?.includes(domain)) {
          rankPosition = item.rank_absolute;
        }
      } else {
        if (item.rank_absolute <= 10) nonOrganicCount++;
      }
    }

    const score = calculateScore(rankPosition, nonOrganicCount);

    return new Response(
      JSON.stringify({
        domain,
        keyword: kw,
        score,
        rank: rankPosition,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("preview-proof error:", err);
    const msg = (err as Error).name === "AbortError" ? "Request timed out" : "Analysis failed";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
