import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Extract and validate auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse body
    const body = await req.json();
    const { domain, keyword } = body;

    // Server-side validation (mirrors client Zod schema)
    const errors: string[] = [];

    if (!domain || typeof domain !== "string") {
      errors.push("Domain is required");
    } else if (domain.length < 3 || domain.length > 253) {
      errors.push("Domain must be between 3 and 253 characters");
    } else if (!domainRegex.test(domain)) {
      errors.push("Invalid domain format. Enter without https:// (e.g. example.com)");
    }

    if (!keyword || typeof keyword !== "string") {
      errors.push("Keyword is required");
    } else {
      const trimmed = keyword.trim();
      if (trimmed.length < 2) {
        errors.push("Keyword must be at least 2 characters");
      } else if (trimmed.length > 100) {
        errors.push("Keyword must be less than 100 characters");
      }
    }

    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ error: "Validation failed", details: errors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize inputs
    const sanitizedDomain = domain.trim().toLowerCase();
    const sanitizedKeyword = keyword.trim();

    // TODO: Implement actual proof generation logic here
    // For now, return mock data with server-validated inputs
    const result = {
      domain: sanitizedDomain,
      keyword: sanitizedKeyword,
      score: 73,
      currentRank: 14,
      delta30: -6,
      aiOverview: true,
      rankings: [
        { keyword: "best plumber london", position: 14 },
        { keyword: "emergency plumber near me", position: 8 },
        { keyword: "plumber reviews london", position: 22 },
        { keyword: "affordable plumbing services", position: 5 },
        { keyword: "24 hour plumber", position: 11 },
      ],
      narrative: `Based on our analysis, ${sanitizedDomain} has strong local SEO foundations but is leaving significant organic traffic on the table for "${sanitizedKeyword}".`,
    };

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
