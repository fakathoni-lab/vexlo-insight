import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Redis } from "https://deno.land/x/upstash_redis@v1.22.0/mod.ts";

// ── CORS ──
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Validation ──
const DOMAIN_RE = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;

function sanitize(str: string): string {
  return str.replace(/[<>'"&]/g, "").trim();
}

function validateInputs(domain: string, keyword: string): string | null {
  if (typeof domain !== "string" || typeof keyword !== "string") return "Invalid input types";
  if (domain.length < 3 || domain.length > 253) return "Domain length must be 3-253 chars";
  if (keyword.length < 2 || keyword.length > 100) return "Keyword length must be 2-100 chars";
  if (!DOMAIN_RE.test(domain)) return "Invalid domain format";
  return null;
}

// ── Redis cache helper ──
function getRedis(): Redis | null {
  const url = Deno.env.get("UPSTASH_REDIS_REST_URL");
  const token = Deno.env.get("UPSTASH_REDIS_REST_TOKEN");
  if (!url || !token) return null;
  return new Redis({ url, token });
}

// ── DataForSEO helpers ──
function getDataForSEOAuth(): { authHeader: string } {
  const login = Deno.env.get("DATAFORSEO_LOGIN");
  const password = Deno.env.get("DATAFORSEO_PASSWORD");
  if (!login || !password) throw new Error("Missing DataForSEO credentials");
  return { authHeader: `Basic ${btoa(`${login}:${password}`)}` };
}

const DATAFORSEO_BASE = "https://api.dataforseo.com/v3";

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 1,
  timeoutMs = 20000
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeout);

    if (res.status === 429 && retries > 0) {
      await new Promise((r) => setTimeout(r, 2000));
      return fetchWithRetry(url, options, retries - 1, timeoutMs);
    }
    return res;
  } catch (err) {
    clearTimeout(timeout);
    if (retries > 0 && (err as Error).name === "AbortError") {
      // Timeout — one retry
      await new Promise((r) => setTimeout(r, 1000));
      return fetchWithRetry(url, options, retries - 1, timeoutMs);
    }
    throw err;
  }
}

// ── Call 1: Organic rankings ──
interface OrganicItem {
  rank_absolute: number;
  url: string;
  title: string;
  etv: number;
}

interface OrganicResult {
  rankPosition: number | null;
  items: OrganicItem[];
  kwDifficulty: number;
}

async function fetchOrganicRankings(
  keyword: string,
  domain: string,
  headers: Record<string, string>
): Promise<OrganicResult> {
  const res = await fetchWithRetry(
    `${DATAFORSEO_BASE}/serp/google/organic/live/advanced`,
    {
      method: "POST",
      headers,
      body: JSON.stringify([
        {
          keyword,
          location_name: "United States",
          language_code: "en",
          device: "desktop",
          os: "windows",
          depth: 20,
        },
      ]),
    }
  );

  const data = await res.json();
  const resultItems = data?.tasks?.[0]?.result?.[0]?.items ?? [];

  // Find domain position in SERP
  let rankPosition: number | null = null;
  const organicItems: OrganicItem[] = [];

  for (const item of resultItems) {
    if (item.type === "organic") {
      organicItems.push({
        rank_absolute: item.rank_absolute,
        url: item.url ?? "",
        title: item.title ?? "",
        etv: item.etv ?? 0,
      });

      if (rankPosition === null && item.url?.includes(domain)) {
        rankPosition = item.rank_absolute;
      }
    }
  }

  // Extract keyword difficulty if available
  const kwDifficulty = data?.tasks?.[0]?.result?.[0]?.keyword_info?.keyword_difficulty ?? 50;

  return { rankPosition, items: organicItems.slice(0, 20), kwDifficulty };
}

// ── Call 2: Organic history (30-day delta) ──
async function fetchOrganicHistory(
  keyword: string,
  domain: string,
  headers: Record<string, string>
): Promise<{ delta30d: number | null }> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const dateTo = now.toISOString().split("T")[0];
  const dateFrom = thirtyDaysAgo.toISOString().split("T")[0];

  const res = await fetchWithRetry(
    `${DATAFORSEO_BASE}/serp/google/organic/live/advanced`,
    {
      method: "POST",
      headers,
      body: JSON.stringify([
        {
          keyword,
          location_name: "United States",
          language_code: "en",
          device: "desktop",
          os: "windows",
          depth: 20,
          date_from: dateFrom,
          date_to: dateTo,
        },
      ]),
    }
  );

  const data = await res.json();
  const items = data?.tasks?.[0]?.result?.[0]?.items ?? [];

  // Find earliest and latest rank for domain
  let earliestRank: number | null = null;
  let latestRank: number | null = null;

  for (const item of items) {
    if (item.type === "organic" && item.url?.includes(domain)) {
      latestRank = item.rank_absolute;
      if (earliestRank === null) earliestRank = item.rank_absolute;
    }
  }

  // Delta: positive = improved (moved up in rank = lower number)
  if (earliestRank !== null && latestRank !== null) {
    return { delta30d: earliestRank - latestRank };
  }

  return { delta30d: null };
}

// ── Call 3: SERP features (AI Overview detection) ──
interface SerpFeatures {
  ai_overview: boolean;
  featured_snippet: boolean;
  local_pack: boolean;
  knowledge_panel: boolean;
}

async function fetchSerpFeatures(
  keyword: string,
  headers: Record<string, string>
): Promise<{ serpFeatures: SerpFeatures; aiImpactPercent: number }> {
  const res = await fetchWithRetry(
    `${DATAFORSEO_BASE}/serp/google/organic/live/advanced`,
    {
      method: "POST",
      headers,
      body: JSON.stringify([
        {
          keyword,
          location_name: "United States",
          language_code: "en",
          device: "desktop",
          os: "windows",
          depth: 20,
        },
      ]),
    }
  );

  const data = await res.json();
  const items = data?.tasks?.[0]?.result?.[0]?.items ?? [];
  const extraInfo = data?.tasks?.[0]?.result?.[0]?.item_types ?? [];

  let aiOverview = false;
  let featuredSnippet = false;
  let localPack = false;
  let knowledgePanel = false;

  for (const item of items) {
    const t = item.type?.toLowerCase() ?? "";
    if (t.includes("ai_overview") || t === "ai_overview") aiOverview = true;
    if (t === "featured_snippet") featuredSnippet = true;
    if (t === "local_pack") localPack = true;
    if (t === "knowledge_graph" || t === "knowledge_panel") knowledgePanel = true;
  }

  // Also check item_types array
  for (const t of extraInfo) {
    const tl = (t as string).toLowerCase();
    if (tl.includes("ai_overview")) aiOverview = true;
    if (tl === "featured_snippet") featuredSnippet = true;
    if (tl === "local_pack") localPack = true;
    if (tl.includes("knowledge")) knowledgePanel = true;
  }

  // Estimate AI impact: count non-organic items above fold
  const nonOrganic = items.filter(
    (i: { type: string; rank_absolute: number }) =>
      i.type !== "organic" && i.rank_absolute <= 10
  ).length;
  const aiImpactPercent = Math.min(100, Math.round((nonOrganic / 10) * 100));

  return {
    serpFeatures: { ai_overview: aiOverview, featured_snippet: featuredSnippet, local_pack: localPack, knowledge_panel: knowledgePanel },
    aiImpactPercent,
  };
}

// ── AI Narrative generation ──
async function generateNarrative(params: {
  domain: string;
  keyword: string;
  proofScore: number;
  rankPosition: number | null;
  rankingDelta: number | null;
  serpFeatures: SerpFeatures;
}): Promise<string | null> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    console.error("LOVABLE_API_KEY not configured, skipping narrative");
    return null;
  }

  const { domain, keyword, proofScore, rankPosition, rankingDelta, serpFeatures } = params;

  const rankText = rankPosition ? `currently ranking #${rankPosition}` : "not yet ranking in the top 20";
  const deltaText = rankingDelta !== null
    ? (rankingDelta > 0 ? `improved ${rankingDelta} positions` : rankingDelta < 0 ? `dropped ${Math.abs(rankingDelta)} positions` : "held steady")
    : "no trend data available";
  const aiText = serpFeatures.ai_overview ? "AI Overviews are present for this keyword, reducing organic click-through rates." : "";

  const systemPrompt = `You are a sales copywriter for an SEO agency. Write exactly 2-3 sentences as a proof paragraph for a client pitch deck. Be specific with the data provided. Use a confident, professional tone. Do not use markdown formatting.`;

  const userPrompt = `Domain: ${domain}
Keyword: "${keyword}"
Proof Score: ${proofScore}/100
Ranking: ${rankText}
30-day Trend: ${deltaText}
${aiText}
SERP Features: ${Object.entries(serpFeatures).filter(([_, v]) => v).map(([k]) => k.replace(/_/g, ' ')).join(', ') || 'none detected'}

Write the proof paragraph now.`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`AI gateway error: ${res.status}`);
      return null;
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    return typeof content === "string" && content.length > 10 ? content.trim() : null;
  } catch (err) {
    console.error("Narrative generation failed:", (err as Error).message);
    return null;
  }
}

// ── Scoring algorithm ──
function calculateProofScore(params: {
  rankPosition: number | null;
  delta30d: number | null;
  aiOverviewPresent: boolean;
  aiImpactPercent: number;
  kwDifficulty: number;
}): number {
  const { rankPosition, delta30d, aiOverviewPresent, aiImpactPercent, kwDifficulty } = params;

  // Rank score (weight 0.40)
  let rankScore = 0;
  if (rankPosition !== null && rankPosition > 0) {
    if (rankPosition === 1) rankScore = 100;
    else if (rankPosition === 2) rankScore = 97;
    else if (rankPosition === 3) rankScore = 94;
    else if (rankPosition <= 10) rankScore = Math.round(90 - ((rankPosition - 4) / 6) * 40);
    else if (rankPosition <= 20) rankScore = Math.round(45 - ((rankPosition - 11) / 9) * 40);
    else rankScore = 0;
  }

  // Trend score (weight 0.30)
  let trendScore = 50;
  if (delta30d !== null) {
    if (delta30d > 5) trendScore = 100;
    else if (delta30d >= 1) trendScore = 70;
    else if (delta30d === 0) trendScore = 50;
    else if (delta30d >= -5) trendScore = 30;
    else trendScore = 0;
  }

  // AI score (weight 0.20)
  let aiScore = 100;
  if (aiOverviewPresent) {
    if (aiImpactPercent < 20) aiScore = 70;
    else if (aiImpactPercent <= 40) aiScore = 40;
    else aiScore = 10;
  }

  // KD score (weight 0.10)
  let kdScore: number;
  if (kwDifficulty < 30) kdScore = 100;
  else if (kwDifficulty <= 50) kdScore = 70;
  else if (kwDifficulty <= 70) kdScore = 40;
  else kdScore = 20;

  const final = Math.round(rankScore * 0.4 + trendScore * 0.3 + aiScore * 0.2 + kdScore * 0.1);
  return Math.max(0, Math.min(100, final));
}

// ── Main handler ──
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse + validate
    const { domain, keyword, proof_id } = await req.json();
    const cleanDomain = sanitize(domain);
    const cleanKeyword = sanitize(keyword);

    const validationError = validateInputs(cleanDomain, cleanKeyword);
    if (validationError) {
      return new Response(JSON.stringify({ error: validationError }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark as processing
    // Mark as processing (no status column yet — skip)

    // ── Check Redis cache ──
    const redis = getRedis();
    const cacheKey = `proof:${cleanDomain}:${cleanKeyword}`;
    let cachedData: string | null = null;

    if (redis) {
      try {
        cachedData = await redis.get<string>(cacheKey);
      } catch (e) {
        console.error("Redis GET failed:", e);
      }
    }

    if (cachedData) {
      // Cache hit — use cached result
      const cached = typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData;

      await supabase.from("proofs").update({
        proof_score: cached.proof_score,
        ranking_position: cached.ranking_position,
        ranking_delta: cached.ranking_delta,
        ai_overview: cached.ai_overview,
        ranking_data: cached.ranking_data,
        serp_features: cached.serp_features,
        ai_narrative: null,
        status: "complete",
        api_cost_units: 0,
      }).eq("id", proof_id);

      return new Response(
        JSON.stringify({ proof_id, proof_score: cached.proof_score, status: "complete", cached: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── DataForSEO calls via Promise.allSettled ──
    let apiCostUnits = 0;
    const { authHeader: dfsAuth } = getDataForSEOAuth();
    const dfsHeaders = { Authorization: dfsAuth, "Content-Type": "application/json" };

    // 24s timeout guard for entire flow
    const results = await Promise.race([
      Promise.allSettled([
        fetchOrganicRankings(cleanKeyword, cleanDomain, dfsHeaders),
        fetchOrganicHistory(cleanKeyword, cleanDomain, dfsHeaders),
        fetchSerpFeatures(cleanKeyword, dfsHeaders),
      ]),
      new Promise<PromiseSettledResult<never>[]>((_, reject) =>
        setTimeout(() => reject(new Error("TIMEOUT")), 24000)
      ),
    ]);

    // Extract results with defaults for failed calls
    let organicResult: OrganicResult = { rankPosition: null, items: [], kwDifficulty: 50 };
    let historyResult: { delta30d: number | null } = { delta30d: null };
    let serpResult: { serpFeatures: SerpFeatures; aiImpactPercent: number } = {
      serpFeatures: { ai_overview: false, featured_snippet: false, local_pack: false, knowledge_panel: false },
      aiImpactPercent: 0,
    };

    if (results[0]?.status === "fulfilled") {
      organicResult = results[0].value as OrganicResult;
      apiCostUnits++;
    } else {
      console.error("Call 1 (organic) failed:", (results[0] as PromiseRejectedResult)?.reason);
    }

    if (results[1]?.status === "fulfilled") {
      historyResult = results[1].value as { delta30d: number | null };
      apiCostUnits++;
    } else {
      console.error("Call 2 (history) failed:", (results[1] as PromiseRejectedResult)?.reason);
    }

    if (results[2]?.status === "fulfilled") {
      serpResult = results[2].value as { serpFeatures: SerpFeatures; aiImpactPercent: number };
      apiCostUnits++;
    } else {
      console.error("Call 3 (serp features) failed:", (results[2] as PromiseRejectedResult)?.reason);
    }

    // ── Calculate score ──
    const proofScore = calculateProofScore({
      rankPosition: organicResult.rankPosition,
      delta30d: historyResult.delta30d,
      aiOverviewPresent: serpResult.serpFeatures.ai_overview,
      aiImpactPercent: serpResult.aiImpactPercent,
      kwDifficulty: organicResult.kwDifficulty,
    });

    // ── Build ranking_data ──
    const rankingData = {
      rankings: organicResult.items.map((item) => ({
        keyword: item.title,
        position: item.rank_absolute,
        url: item.url,
        etv: item.etv,
      })),
      domain_position: organicResult.rankPosition,
    };

    // ── Generate AI narrative ──
    const aiNarrative = await generateNarrative({
      domain: cleanDomain,
      keyword: cleanKeyword,
      proofScore,
      rankPosition: organicResult.rankPosition,
      rankingDelta: historyResult.delta30d,
      serpFeatures: serpResult.serpFeatures,
    });

    // ── Update proof row ──
    const updatePayload = {
      proof_score: proofScore,
      ranking_position: organicResult.rankPosition,
      ranking_delta: historyResult.delta30d,
      ai_overview: serpResult.serpFeatures.ai_overview,
      ranking_data: rankingData,
      serp_features: serpResult.serpFeatures,
      ai_narrative: aiNarrative,
      status: "complete",
      api_cost_units: apiCostUnits,
    };

    const { error: updateError } = await supabase
      .from("proofs")
      .update(updatePayload)
      .eq("id", proof_id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // ── Cache result in Redis ──
    if (redis) {
      try {
        await redis.set(cacheKey, JSON.stringify(updatePayload), { ex: 86400 });
      } catch (e) {
        console.error("Redis SET failed:", e);
      }
    }

    return new Response(
      JSON.stringify({ proof_id, proof_score: proofScore, status: "complete" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("generate-proof error:", err);

    // Try to mark as failed if we have proof_id
    try {
      const body = await req.clone().json().catch(() => null);
      if (body?.proof_id) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );
        await supabase.from("proofs").update({
          status: "failed",
          error_message: (err as Error).message === "TIMEOUT" ? "Request timed out" : "Data collection failed",
        }).eq("id", body.proof_id);
      }
    } catch { /* ignore cleanup error */ }

    return new Response(
      JSON.stringify({ error: (err as Error).message === "TIMEOUT" ? "timeout" : "internal_error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
