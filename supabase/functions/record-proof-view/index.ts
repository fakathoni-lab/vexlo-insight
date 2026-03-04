import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { slug } = await req.json();
    if (!slug || typeof slug !== "string") {
      return new Response(
        JSON.stringify({ error: "slug is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Daily-unique visitor hash
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const today = new Date().toISOString().split("T")[0];
    const hashInput = `${ip}:${slug}:${today}`;
    const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(hashInput));
    const ipHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Service role client to bypass RLS for lookup
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find proof by slug
    const { data: proof, error: proofErr } = await supabase
      .from("proofs")
      .select("id")
      .eq("public_slug", slug)
      .eq("is_public", true)
      .single();

    if (proofErr || !proof) {
      return new Response(
        JSON.stringify({ error: "not_found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert view — duplicates are fine (viewer_ip_hash is not unique-constrained, 
    // but the daily hash ensures same visitor on same day generates same hash)
    await supabase.from("proof_views").insert({
      proof_id: proof.id,
      viewer_ip_hash: ipHash,
      user_agent: req.headers.get("user-agent") ?? null,
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "internal_error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
