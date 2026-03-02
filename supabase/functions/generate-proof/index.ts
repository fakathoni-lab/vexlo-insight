import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Redis } from "npm:@upstash/redis@1.34.3";
import { z } from "npm:zod@3.23.8";

// ── CORS ──
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Zod input schema ──
const DOMAIN_RE = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;

const RequestSchema = z.object({
  domain: z.string()
    .min(3, "Domain must be at least 3 characters")
    .max(253, "Domain must be at most 253 characters")
    .transform((d) => d.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "").toLowerCase().trim())
    .refine((d) => DOMAIN_RE.test(d), "Invalid domain format"),
  keyword: z.string()
    .min(2, "Keyword must be at least 2 characters")
    .max(100, "Keyword must be at most 100 characters")
    .transform((k) => k.replace(/[<>'"&]/g, "").trim().toLowerCase()),
  proof_id: z.string().uuid("Invalid proof_id"),
});

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
      await new Promise((r) => setTimeout(r, 1000));
      return fetchWithRetry(url, options, retries - 1, timeoutMs);
    }
    throw err;
  }
}

// ── Call 1: Organic rankings + SERP features (merged — single API call) ──
interface OrganicItem {
  rank_absolute: number;
  url: string;
  title: string;
  etv: number;
}

interface SerpFeatures {
  ai_overview: boolean;
  featured_snippet: boolean;
  local_pack: boolean;
  knowledge_panel: boolean;
}

interface OrganicAndSerpResult {
  rankPosition: number | null;
  items: OrganicItem[];
  kwDifficulty: number;
  serpFeatures: SerpFeatures;
  aiImpactPercent: number;
}

async function fetchOrganicAndSerpFeatures(
  keyword: string,
  domain: string,
  headers: Record<string, string>
): Promise<OrganicAndSerpResult> {
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
  const extraInfo: string[] = data?.tasks?.[0]?.result?.[0]?.item_types ?? [];

  // ── Organic rankings ──
  let rankPosition: number | null = null;
  const organicItems: OrganicItem[] = [];

  // ── SERP features ──
  let aiOverview = false;
  let featuredSnippet = false;
  let localPack = false;
  let knowledgePanel = false;

  for (const item of resultItems) {
    const t = (item.type ?? "").toLowerCase();

    if (t === "organic") {
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

    if (t.includes("ai_overview")) aiOverview = true;
    if (t === "featured_snippet") featuredSnippet = true;
    if (t === "local_pack") localPack = true;
    if (t === "knowledge_graph" || t === "knowledge_panel") knowledgePanel = true;
  }

  for (const t of extraInfo) {
    const tl = t.toLowerCase();
    if (tl.includes("ai_overview")) aiOverview = true;
    if (tl === "featured_snippet") featuredSnippet = true;
    if (tl === "local_pack") localPack = true;
    if (tl.includes("knowledge")) knowledgePanel = true;
  }

  const nonOrganic = resultItems.filter(
    (i: { type: string; rank_absolute: number }) =>
      i.type !== "organic" && i.rank_absolute <= 10
  ).length;
  const aiImpactPercent = Math.min(100, Math.round((nonOrganic / 10) * 100));

  const kwDifficulty = data?.tasks?.[0]?.result?.[0]?.keyword_info?.keyword_difficulty ?? 50;

  return {
    rankPosition,
    items: organicItems.slice(0, 20),
    kwDifficulty,
    serpFeatures: { ai_overview: aiOverview, featured_snippet: featuredSnippet, local_pack: localPack, knowledge_panel: knowledgePanel },
    aiImpactPercent,
  };
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

  let earliestRank: number | null = null;
  let latestRank: number | null = null;

  for (const item of items) {
    if (item.type === "organic" && item.url?.includes(domain)) {
      latestRank = item.rank_absolute;
      if (earliestRank === null) earliestRank = item.rank_absolute;
    }
  }

  if (earliestRank !== null && latestRank !== null) {
    return { delta30d: earliestRank - latestRank };
  }

  return { delta30d: null };
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

  let rankScore = 0;
  if (rankPosition !== null && rankPosition > 0) {
    if (rankPosition === 1) rankScore = 100;
    else if (rankPosition === 2) rankScore = 97;
    else if (rankPosition === 3) rankScore = 94;
    else if (rankPosition <= 10) rankScore = Math.round(90 - ((rankPosition - 4) / 6) * 40);
    else if (rankPosition <= 20) rankScore = Math.round(45 - ((rankPosition - 11) / 9) * 40);
    else rankScore = 0;
  }

  let trendScore = 50;
  if (delta30d !== null) {
    if (delta30d > 5) trendScore = 100;
    else if (delta30d >= 1) trendScore = 70;
    else if (delta30d === 0) trendScore = 50;
    else if (delta30d >= -5) trendScore = 30;
    else trendScore = 0;
  }

  let aiScore = 100;
  if (aiOverviewPresent) {
    if (aiImpactPercent < 20) aiScore = 70;
    else if (aiImpactPercent <= 40) aiScore = 40;
    else aiScore = 10;
  }

  let kdScore: number;
  if (kwDifficulty < 30) kdScore = 100;
  else if (kwDifficulty <= 50) kdScore = 70;
  else if (kwDifficulty <= 70) kdScore = 40;
  else kdScore = 20;

  const final = Math.round(rankScore * 0.4 + trendScore * 0.3 + aiScore * 0.2 + kdScore * 0.1);
  return Math.max(0, Math.min(100, final));
}

// ── Service-role client helper ──
function getServiceClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Missing Supabase service config");
  return createClient(url, key);
}

// ── Main handler ──
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Capture proof_id early for error handler
  let proofId: string | null = null;

  try {
    // ── Auth ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: "internal_error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Parse + validate with Zod ──
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = RequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.issues[0]?.message ?? "Invalid input" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { domain: cleanDomain, keyword: cleanKeyword, proof_id } = parsed.data;
    proofId = proof_id;

    // ── Ownership check: verify proof belongs to authenticated user ──
    const serviceClient = getServiceClient();

    const { data: proofRow, error: proofFetchError } = await serviceClient
      .from("proofs")
      .select("user_id")
      .eq("id", proof_id)
      .single();

    if (proofFetchError || !proofRow) {
      return new Response(JSON.stringify({ error: "Proof not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (proofRow.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Plan enforcement: check proofs_used vs proofs_limit BEFORE DataForSEO ──
    const { data: profile, error: profileError } = await serviceClient
      .from("profiles")
      .select("proofs_used, proofs_limit")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const proofsUsed = profile.proofs_used ?? 0;
    const proofsLimit = profile.proofs_limit ?? 3; // free plan default

    if (proofsUsed >= proofsLimit) {
      // Mark proof as failed so UI shows proper state
      await serviceClient.from("proofs").update({
        status: "failed",
        error_message: "Plan limit reached. Upgrade to generate more proofs.",
      }).eq("id", proof_id);

      return new Response(
        JSON.stringify({
          error: "plan_limit_reached",
          message: "You have reached your proof generation limit. Please upgrade your plan.",
          proofs_used: proofsUsed,
          proofs_limit: proofsLimit,
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Mark as processing ──
    await serviceClient.from("proofs").update({ status: "processing" }).eq("id", proof_id);

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
      const cached = typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData;

      await serviceClient.from("proofs").update({
        score: cached.score ?? 0,
        current_rank: cached.current_rank ?? null,
        delta_30: cached.delta_30 ?? null,
        ai_overview: cached.ai_overview ?? false,
        rankings: cached.rankings ?? null,
        narrative: cached.narrative ?? null,
        serp_features: cached.serp_features ?? null,
        status: "complete",
      }).eq("id", proof_id);

      // Increment proofs_used even for cached results
      await serviceClient.rpc("increment_proofs_used", { user_id_input: user.id }).then(
        () => {},
        () => {
          // Fallback: direct update if RPC doesn't exist
          serviceClient.from("profiles")
            .update({ proofs_used: proofsUsed + 1 })
            .eq("id", user.id)
            .then(() => {}, (e) => console.error("proofs_used increment failed:", e));
        }
      );

      return new Response(
        JSON.stringify({ proof_id, proof_score: cached.score, status: "complete", cached: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── DataForSEO calls: 2 parallel calls (merged organic + SERP, history) ──
    const { authHeader: dfsAuth } = getDataForSEOAuth();
    const dfsHeaders = { Authorization: dfsAuth, "Content-Type": "application/json" };

    const results = await Promise.race([
      Promise.allSettled([
        fetchOrganicAndSerpFeatures(cleanKeyword, cleanDomain, dfsHeaders),
        fetchOrganicHistory(cleanKeyword, cleanDomain, dfsHeaders),
      ]),
      new Promise<PromiseSettledResult<never>[]>((_, reject) =>
        setTimeout(() => reject(new Error("TIMEOUT")), 24000)
      ),
    ]);

    let organicAndSerpResult: OrganicAndSerpResult = {
      rankPosition: null,
      items: [],
      kwDifficulty: 50,
      serpFeatures: { ai_overview: false, featured_snippet: false, local_pack: false, knowledge_panel: false },
      aiImpactPercent: 0,
    };
    let historyResult: { delta30d: number | null } = { delta30d: null };

    if (results[0]?.status === "fulfilled") {
      organicAndSerpResult = results[0].value as OrganicAndSerpResult;
    } else {
      console.error("Call 1 (organic+serp) failed:", (results[0] as PromiseRejectedResult)?.reason);
    }

    if (results[1]?.status === "fulfilled") {
      historyResult = results[1].value as { delta30d: number | null };
    } else {
      console.error("Call 2 (history) failed:", (results[1] as PromiseRejectedResult)?.reason);
    }

    // ── Calculate score ──
    const proofScore = calculateProofScore({
      rankPosition: organicAndSerpResult.rankPosition,
      delta30d: historyResult.delta30d,
      aiOverviewPresent: organicAndSerpResult.serpFeatures.ai_overview,
      aiImpactPercent: organicAndSerpResult.aiImpactPercent,
      kwDifficulty: organicAndSerpResult.kwDifficulty,
    });

    // ── Build ranking_data ──
    const rankingData = {
      rankings: organicAndSerpResult.items.map((item) => ({
        keyword: item.title,
        position: item.rank_absolute,
        url: item.url,
        etv: item.etv,
      })),
      domain_position: organicAndSerpResult.rankPosition,
    };

    // ── Generate AI narrative ──
    const aiNarrative = await generateNarrative({
      domain: cleanDomain,
      keyword: cleanKeyword,
      proofScore,
      rankPosition: organicAndSerpResult.rankPosition,
      rankingDelta: historyResult.delta30d,
      serpFeatures: organicAndSerpResult.serpFeatures,
    });

    // ── Update proof row (service_role for reliability) ──
    const updatePayload = {
      score: proofScore,
      current_rank: organicAndSerpResult.rankPosition,
      delta_30: historyResult.delta30d,
      ai_overview: organicAndSerpResult.serpFeatures.ai_overview,
      rankings: rankingData,
      narrative: aiNarrative,
      serp_features: organicAndSerpResult.serpFeatures,
      status: "complete",
    };

    const { error: updateError } = await serviceClient
      .from("proofs")
      .update(updatePayload)
      .eq("id", proof_id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    // ── Increment proofs_used on profile ──
    const { error: incrementError } = await serviceClient
      .from("profiles")
      .update({ proofs_used: proofsUsed + 1 })
      .eq("id", user.id);

    if (incrementError) {
      console.error("proofs_used increment failed:", incrementError.message);
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

    // Mark as failed using service_role client
    if (proofId) {
      try {
        const svc = getServiceClient();
        const errorMsg = (err as Error).message === "TIMEOUT" ? "Request timed out" : "Data collection failed";
        await svc.from("proofs").update({
          status: "failed",
          error_message: errorMsg,
        }).eq("id", proofId);
      } catch { /* ignore cleanup error */ }
    }

    const isTimeout = (err as Error).message === "TIMEOUT";
    return new Response(
      JSON.stringify({ error: isTimeout ? "timeout" : "internal_error" }),
      {
        status: isTimeout ? 504 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
