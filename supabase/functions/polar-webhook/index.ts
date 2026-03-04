import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, webhook-id, webhook-timestamp, webhook-signature",
};

// Verify Polar webhook signature using standard webhooks (HMAC-SHA256)
async function verifyWebhookSignature(
  body: string,
  webhookId: string,
  timestamp: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const secretBytes = Uint8Array.from(
    atob(secret.startsWith("whsec_") ? secret.slice(6) : secret),
    (c) => c.charCodeAt(0)
  );

  const signedContent = `${webhookId}.${timestamp}.${body}`;
  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedContent));
  const expectedSig = btoa(String.fromCharCode(...new Uint8Array(sig)));

  const signatures = signature.split(" ");
  return signatures.some((s) => {
    const [, sigValue] = s.split(",");
    return sigValue === expectedSig;
  });
}

function log(fields: Record<string, unknown>) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), fn: "polar-webhook", ...fields }));
}

// Resolve plan by Polar product ID first, then fall back to product name
async function resolvePlan(
  supabase: ReturnType<typeof createClient>,
  productId: string | undefined,
  productName: string | undefined
): Promise<{ name: string; proofs_limit: number }> {
  const fallback = { name: "free", proofs_limit: 5 };

  // Try by polar_product_id first (most reliable)
  if (productId) {
    const { data, error } = await supabase
      .from("plans")
      .select("name, proofs_limit")
      .eq("polar_product_id", productId)
      .eq("is_active", true)
      .single();
    if (data && !error) return data;
    log({ event: "plan_lookup_by_product_id_failed", productId, error: error?.message });
  }

  // Fallback: match by normalized product name
  if (productName) {
    const normalized = productName.toLowerCase().replace(/[\s_-]+/g, "_");
    const { data, error } = await supabase
      .from("plans")
      .select("name, proofs_limit")
      .eq("name", normalized)
      .eq("is_active", true)
      .single();
    if (data && !error) return data;
    log({ event: "plan_lookup_by_name_failed", plan: normalized, error: error?.message });
  }

  return fallback;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const POLAR_WEBHOOK_SECRET = Deno.env.get("POLAR_WEBHOOK_SECRET");
  if (!POLAR_WEBHOOK_SECRET) {
    console.error("POLAR_WEBHOOK_SECRET not configured");
    return new Response("Server misconfigured", { status: 500 });
  }

  const body = await req.text();

  const webhookId = req.headers.get("webhook-id") ?? "";
  const webhookTimestamp = req.headers.get("webhook-timestamp") ?? "";
  const webhookSignature = req.headers.get("webhook-signature") ?? "";

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    log({ event: "missing_headers" });
    return new Response("Missing webhook headers", { status: 400 });
  }

  const valid = await verifyWebhookSignature(
    body, webhookId, webhookTimestamp, webhookSignature, POLAR_WEBHOOK_SECRET
  );

  if (!valid) {
    log({ event: "invalid_signature" });
    return new Response("Invalid signature", { status: 401 });
  }

  const payload = JSON.parse(body);
  const eventType = payload.type;
  log({ event: "received", type: eventType });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    switch (eventType) {
      case "subscription.created":
      case "subscription.updated": {
        const sub = payload.data;
        const userId = sub.metadata?.supabase_user_id;
        if (!userId) {
          log({ event: "no_user_id", subscription_id: sub.id });
          break;
        }

        // Resolve plan using product ID → name fallback
        const productId = sub.product?.id;
        const productName = sub.product?.name;
        const plan = await resolvePlan(supabaseAdmin, productId, productName);

        // Upsert subscription
        await supabaseAdmin.from("subscriptions").upsert(
          {
            user_id: userId,
            plan: plan.name,
            status: sub.status,
            stripe_subscription_id: sub.id,
            stripe_price_id: sub.price?.id ?? null,
            current_period_start: sub.current_period_start,
            current_period_end: sub.current_period_end,
            cancel_at_period_end: sub.cancel_at_period_end ?? false,
          },
          { onConflict: "user_id" }
        );

        // Update profile
        await supabaseAdmin.from("profiles").update({
          plan: plan.name,
          proofs_limit: plan.proofs_limit,
          plan_status: sub.status === "active" ? "active" : sub.status,
          updated_at: new Date().toISOString(),
        }).eq("id", userId);

        log({ event: "subscription_synced", user_id: userId, status: sub.status, plan: plan.name, proofs_limit: plan.proofs_limit });
        break;
      }

      case "subscription.canceled":
      case "subscription.revoked": {
        const sub = payload.data;
        const userId = sub.metadata?.supabase_user_id;
        if (!userId) break;

        await supabaseAdmin.from("subscriptions").update({
          status: "canceled",
          cancel_at_period_end: true,
        }).eq("user_id", userId);

        await supabaseAdmin.from("profiles").update({
          plan: "free",
          proofs_limit: 5,
          plan_status: "canceled",
          updated_at: new Date().toISOString(),
        }).eq("id", userId);

        log({ event: "subscription_canceled", user_id: userId, proofs_limit: 5 });
        break;
      }

      case "order.created": {
        log({ event: "order_created", order_id: payload.data?.id });
        break;
      }

      default:
        log({ event: "unhandled_event", type: eventType });
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
    return new Response("Processing error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
