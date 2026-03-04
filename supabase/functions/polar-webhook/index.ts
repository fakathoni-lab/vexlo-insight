import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, webhook-id, webhook-timestamp, webhook-signature",
};

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

async function resolvePlan(
  supabase: ReturnType<typeof createClient>,
  productId: string | undefined,
  productName: string | undefined
): Promise<{ name: string; proofs_limit: number }> {
  const fallback = { name: "free", proofs_limit: 5 };

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

async function recordWebhookEvent(
  supabase: ReturnType<typeof createClient>,
  webhookId: string,
  eventType: string,
  payload: unknown,
  userId: string | null,
  startMs: number
): Promise<boolean> {
  // Check idempotency — if webhook_id already exists, skip
  const { data: existing } = await supabase
    .from("webhook_events")
    .select("id")
    .eq("webhook_id", webhookId)
    .maybeSingle();

  if (existing) {
    log({ event: "duplicate_webhook", webhook_id: webhookId });
    return false; // already processed
  }

  const processingMs = Date.now() - startMs;
  await supabase.from("webhook_events").insert({
    webhook_id: webhookId,
    event_type: eventType,
    payload: payload as Record<string, unknown>,
    user_id: userId,
    processing_ms: processingMs,
  });

  return true; // new event, proceed
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startMs = Date.now();

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
    // Extract user_id early for idempotency record
    const sub = payload.data;
    const userId: string | null = sub?.metadata?.supabase_user_id ?? null;
    const polarCustomerId: string | null = sub?.customer_id ?? null;

    // Idempotency check — skip if already processed
    const isNew = await recordWebhookEvent(
      supabaseAdmin, webhookId, eventType, payload, userId, startMs
    );
    if (!isNew) {
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    switch (eventType) {
      case "subscription.created":
      case "subscription.updated": {
        if (!userId) {
          log({ event: "no_user_id", subscription_id: sub.id });
          break;
        }

        const productId = sub.product?.id;
        const productName = sub.product?.name;
        const plan = await resolvePlan(supabaseAdmin, productId, productName);

        // Upsert subscription using polar_subscription_id as conflict key
        await supabaseAdmin.from("subscriptions").upsert(
          {
            user_id: userId,
            polar_subscription_id: sub.id,
            polar_product_id: productId ?? "",
            plan: plan.name,
            status: sub.status,
            current_period_start: sub.current_period_start,
            current_period_end: sub.current_period_end,
            cancel_at_period_end: sub.cancel_at_period_end ?? false,
            canceled_at: sub.canceled_at ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "polar_subscription_id" }
        );

        // Update profile
        await supabaseAdmin.from("profiles").update({
          plan: plan.name,
          proofs_limit: plan.proofs_limit,
          plan_status: sub.status === "active" ? "active" : sub.status,
          proofs_used: 0,
          period_reset_at: sub.current_period_start,
          current_period_end: sub.current_period_end,
          polar_customer_id: polarCustomerId,
          updated_at: new Date().toISOString(),
        }).eq("id", userId);

        log({
          event: "subscription_synced",
          user_id: userId,
          status: sub.status,
          plan: plan.name,
          proofs_limit: plan.proofs_limit,
          polar_subscription_id: sub.id,
        });
        break;
      }

      case "subscription.canceled":
      case "subscription.revoked": {
        if (!userId) break;

        // Resolve free plan limits from DB
        const freePlan = await resolvePlan(supabaseAdmin, undefined, "free");

        await supabaseAdmin.from("subscriptions").update({
          status: "canceled",
          cancel_at_period_end: true,
          canceled_at: sub.canceled_at ?? new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq("polar_subscription_id", sub.id);

        await supabaseAdmin.from("profiles").update({
          plan: "free",
          proofs_limit: freePlan.proofs_limit,
          plan_status: "canceled",
          updated_at: new Date().toISOString(),
        }).eq("id", userId);

        log({ event: "subscription_canceled", user_id: userId, polar_subscription_id: sub.id });
        break;
      }

      case "order.created": {
        log({ event: "order_created", order_id: sub?.id });
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
