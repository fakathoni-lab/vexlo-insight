/**
 * domain-register — Phase 2 scaffold
 * NOT wired to frontend yet. Will handle domain registration via Dynadot API
 * with HMAC-SHA256 signing, idempotency, and DB logging.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Phase 2 — not yet implemented
  return new Response(
    JSON.stringify({
      success: false,
      error: "Domain registration is not yet available. Coming soon.",
    }),
    {
      status: 501,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
