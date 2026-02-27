import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DOMAIN_RE = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
const KEYWORD_MIN = 2;
const KEYWORD_MAX = 100;
const DOMAIN_MAX = 253;

function sanitize(str: string): string {
  return str.replace(/[<>'"&]/g, "").trim();
}

function validateInputs(domain: string, keyword: string): string | null {
  if (typeof domain !== "string" || typeof keyword !== "string") return "Invalid input types";
  if (domain.length < 3 || domain.length > DOMAIN_MAX) return "Domain length must be 3-253 chars";
  if (keyword.length < KEYWORD_MIN || keyword.length > KEYWORD_MAX) return "Keyword length must be 2-100 chars";
  if (!DOMAIN_RE.test(domain)) return "Invalid domain format";
  return null;
}

async function fetchDataForSEO(keyword: string, domain: string) {
  const baseUrl = "https://api.dataforseo.com";
  const login = Deno.env.get("DATAFORSEO_LOGIN");
  const password = Deno.env.get("DATAFORSEO_PASSWORD");

  if (!login || !password) {
    throw new Error("Missing DataForSEO credentials");
  }

  const authHeader = `Basic ${btoa(`${login}:${password}`)}`;
  const headers = {
    Authorization: authHeader,
    "Content-Type": "application/json",
  };

  const body1 = [{ keyword, location_code: 2360, language_code: "en", depth: 20 }];
  const body2 = [{ keyword, location_code: 2360, language_code: "en" }];
  const body3 = [{ keyword, location_code: 2360, language_code: "en", domain }];

  try {
    const [liveResponse, featuresResponse, historyTaskResponse] = await Promise.all([
      fetch(`${baseUrl}/v3/serp/google/organic/live/advanced`, {
        method: "POST",
        headers,
        body: JSON.stringify(body1),
      }).then((res) => res.json()),
      fetch(`${baseUrl}/v3/serp/google/serp_features/live/advanced`, {
        method: "POST",
        headers,
        body: JSON.stringify(body2),
      }).then((res) => res.json()),
      fetch(`${baseUrl}/v3/serp/google/organic/task_post`, {
        method: "POST",
        headers,
        body: JSON.stringify(body3),
      })
        .then((res) => res.json())
        .then((taskRes) => {
          const taskId = taskRes.tasks?.[0]?.id;
          if (!taskId) throw new Error("Failed to create history task");
          return fetch(`${baseUrl}/v3/serp/google/organic/task_get/advanced`, {
            method: "GET",
            headers,
          }).then((res) => res.json());
        }),
    ]);

    return { liveResponse, featuresResponse, historyTaskResponse };
  } catch (_error) {
    console.error("DataForSEO API call failed");
    throw new Error("dataforseo_failed");
  }
}

function calculateProofScore(rank: number | null, delta: number | null, isAiOverview: boolean): number {
  let score = 0;

  if (rank !== null) {
    if (rank <= 3) score += 40;
    else if (rank <= 10) score += 25;
    else if (rank <= 20) score += 10;
  } else {
    score = 5; // No ranking
  }

  if (delta !== null && delta > 0) score += 20;
  if (isAiOverview) score -= 15;

  return Math.min(Math.max(score, 0), 100);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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

    try {
      const { liveResponse, featuresResponse, historyTaskResponse } = await fetchDataForSEO(cleanKeyword, cleanDomain);

      const rank = liveResponse?.tasks?.[0]?.result?.[0]?.items?.[0]?.rank || null;
      const delta = historyTaskResponse?.tasks?.[0]?.result?.[0]?.delta || null;
      const isAiOverview = featuresResponse?.tasks?.[0]?.result?.[0]?.is_ai_overview || false;

      const proofScore = calculateProofScore(rank, delta, isAiOverview);

      const updateResult = await supabase
        .from("proofs")
        .update({
          proof_score: proofScore,
          rank_data: { liveResponse, featuresResponse, historyTaskResponse },
          status: "scoring_done",
        })
        .eq("id", proof_id);

      if (updateResult.error) {
        throw new Error(updateResult.error.message);
      }

      return new Response(
        JSON.stringify({ proof_id, proof_score: proofScore, status: "scoring_done" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      await supabase
        .from("proofs")
        .update({ status: "failed" })
        .eq("id", proof_id);

      return new Response(JSON.stringify({ error: "dataforseo_failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (_err) {
    console.error("Unexpected error in generate-proof");
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
