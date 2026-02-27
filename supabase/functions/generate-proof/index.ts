import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DOMAIN_RE = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;

function sanitize(str: string): string {
  return str.replace(/[<>'"&]/g, "").trim();
}

async function fetchSERPData(domain: string, keyword: string) {
  const apiKey = Deno.env.get("DATAFORSEO_API_KEY");
  const baseUrl = "https://api.dataforseo.com/v3/serp/google";

  const endpoints = [
    `${baseUrl}/organic/live`,
    `${baseUrl}/features`,
    `${baseUrl}/organic/history`,
  ];

  const requests = endpoints.map((url) =>
    fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ domain, keyword }),
    }).then((res) => res.json())
  );

  return Promise.all(requests);
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

  return Math.max(0, Math.min(score, 100));
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

    if (!DOMAIN_RE.test(cleanDomain)) {
      return new Response(JSON.stringify({ error: "Invalid domain format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [liveData, featuresData, historyData] = await fetchSERPData(cleanDomain, cleanKeyword);

    const rank = liveData?.rank || null;
    const delta = historyData?.delta || null;
    const isAiOverview = featuresData?.is_ai_overview || false;

    const proofScore = calculateProofScore(rank, delta, isAiOverview);

    const updateResult = await supabase
      .from("proofs")
      .update({
        proof_score: proofScore,
        rank_data: { liveData, featuresData, historyData },
        status: "scoring_done",
      })
      .eq("id", proof_id);

    if (updateResult.error) {
      return new Response(JSON.stringify({ error: updateResult.error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ proof_id, proof_score: proofScore, status: "scoring_done" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
