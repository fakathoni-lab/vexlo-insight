import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DOMAIN_RE = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;

function sanitize(str: string): string {
  return str.replace(/[<>"'&]/g, "").trim();
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

    const { domain, keyword } = await req.json();

    // Server-side validation
    const cleanDomain = sanitize(String(domain || "")).toLowerCase();
    const cleanKeyword = sanitize(String(keyword || ""));

    if (!DOMAIN_RE.test(cleanDomain)) {
      return new Response(JSON.stringify({ error: "Invalid domain format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (cleanKeyword.length < 2 || cleanKeyword.length > 100) {
      return new Response(JSON.stringify({ error: "Keyword must be 2-100 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check usage limits
    const { data: profile } = await supabase
      .from("profiles")
      .select("proofs_used, proofs_limit")
      .eq("id", user.id)
      .single();

    if (profile && profile.proofs_used >= profile.proofs_limit) {
      return new Response(JSON.stringify({ error: "Proof limit reached. Upgrade your plan." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create proof record
    const { data: proof, error: insertError } = await supabase
      .from("proofs")
      .insert({
        user_id: user.id,
        domain: cleanDomain,
        target_keyword: cleanKeyword,
        status: "processing",
      })
      .select("id")
      .single();

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // TODO: Replace with real SERP API call
    const mockScore = Math.floor(Math.random() * 40) + 50;
    const mockRank = Math.floor(Math.random() * 20) + 1;
    const mockDelta = Math.floor(Math.random() * 12) - 6;
    const hasAiOverview = Math.random() > 0.5;

    const mockRankings = [
      { keyword: cleanKeyword, position: mockRank },
      { keyword: `best ${cleanKeyword}`, position: mockRank + 3 },
      { keyword: `${cleanKeyword} near me`, position: Math.max(1, mockRank - 2) },
      { keyword: `${cleanKeyword} services`, position: mockRank + 7 },
      { keyword: `affordable ${cleanKeyword}`, position: Math.max(1, mockRank - 4) },
    ];

    const narrative = `Based on our analysis, ${cleanDomain} has solid SEO foundations but is leaving significant organic traffic on the table. Currently ranking #${mockRank} for "${cleanKeyword}", they're missing an estimated ${mockRank * 60} monthly clicks. With targeted optimization, there's a clear path to page 1 within 60-90 days.`;

    // Update proof with results
    await supabase
      .from("proofs")
      .update({
        proof_score: mockScore,
        ranking_position: mockRank,
        ranking_delta: mockDelta,
        ai_overview: hasAiOverview,
        ranking_data: mockRankings,
        ai_narrative: narrative,
        status: "complete",
      })
      .eq("id", proof.id);

    // Increment proofs_used
    if (profile) {
      await supabase
        .from("profiles")
        .update({ proofs_used: profile.proofs_used + 1 })
        .eq("id", user.id);
    }

    return new Response(
      JSON.stringify({
        id: proof.id,
        domain: cleanDomain,
        keyword: cleanKeyword,
        score: mockScore,
        currentRank: mockRank,
        delta30: mockDelta,
        aiOverview: hasAiOverview,
        rankings: mockRankings,
        narrative,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
