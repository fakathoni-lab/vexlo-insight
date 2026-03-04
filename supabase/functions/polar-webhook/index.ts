import { createClient } from "npm:@supabase/supabase-js@2";

// ─── Helpers ─────────────────────────────────────────────────

function log(fields: Record<string, unknown>) {
  console.log(
    JSON.stringify({ ts: new Date().toISOString(), fn: "polar-webhook", ...fields })
  );
}

function logError(fields: Record<string, unknown>) {
  console.error(
    JSON.stringify({ ts: new Date().toISOString(), fn: "polar-webhook", ...fields })
  );
}

// ─── HMAC-SHA256 verification ────────────────────────────────

async function verifySignature(
  body: string,
  webhookId: string,
  timestamp: string,
  signatureHeader: string,
  secret: string
): Promise<boolean> {
  const raw = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  const secretBytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));

  const signedContent = `${webhookId}.${timestamp}.${body}`;
  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedContent)
  );
  const expected = btoa(String.fromCharCode(...new Uint8Array(sig)));

  // Polar sends space-separated "v1,<base64>" pairs
  return signatureHeader.split(" ").some((part) => {
    const val = part.split(",")[1];
    return val === expected;
  });
}

// ─── Product ID → plan map (env-based, never trust product names) ──

function buildProductMap(): Map<string, string> {
  const map = new Map<string, string>();
  const entries: [string, string][] = [
    ["POLAR_PRODUCT_STARTER", "starter"],
    ["POLAR_PRODUCT_AGENCY_PRO", "agency_pro"],
    ["POLAR_PRODUCT_AGENCY_ELITE", "agency_elite"],
  ];
  for (const [envKey, planName] of entries) {
    const id = Deno.env.get(envKey);
    if (id) map.set(id, planName);
  }
  return map;
}

// ─── Main handler ────────────────────────────────────────────

Deno.serve(async (req) => {
  const startMs = Date.now();

  // ── 0. Only POST ──
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // ── 1. Read secrets ──
  const webhookSecret = Deno.env.get("POLAR_WEBHOOK_SECRET");
  if (!webhookSecret) {
    logError({ event: "missing_secret", key: "POLAR_WEBHOOK_SECRET" });
    return new Response("Server misconfigured", { status: 500 });
  }

  // ── 2. Extract & validate headers ──
  const webhookId = req.headers.get("webhook-id") ?? "";
  const webhookTimestamp = req.headers.get("webhook-timestamp") ?? "";
  const webhookSignature = req.headers.get("webhook-signature") ?? "";

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    log({ event: "missing_headers" });
    return new Response("Missing webhook headers", { status: 400 });
  }

  // ── 3. Timestamp staleness check (300s window) ──
  const tsSeconds = parseInt(webhookTimestamp, 10);
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - tsSeconds) > 300) {
    log({ event: "stale_webhook", delta: nowSeconds - tsSeconds });
    return new Response("Stale webhook", { status: 400 });
  }

  // ── 4. HMAC-SHA256 signature verification ──
  const body = await req.text();
  const valid = await verifySignature(
    body,
    webhookId,
    webhookTimestamp,
    webhookSignature,
    webhookSecret
  );
  if (!valid) {
    log({ event: "invalid_signature" });
    return new Response("Invalid signature", { status: 401 });
  }

  // ── 5. Parse payload ──
  const payload = JSON.parse(body);
  const eventType: string = payload.type;
  const sub = payload.data;
  const userId: string | null = sub?.metadata?.supabase_user_id ?? null;
  const polarCustomerId: string | null = sub?.customer_id ?? null;

  log({ event: "received", type: eventType, user_id: userId });

  // ── 6. Service role client ──
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // ── 7. Idempotency check BEFORE processing ──
  const { data: existing } = await supabase
    .from("webhook_events")
    .select("id")
    .eq("webhook_id", webhookId)
    .maybeSingle();

  if (existing) {
    log({ event: "duplicate_webhook", webhook_id: webhookId });
    return new Response(
      JSON.stringify({ received: true, duplicate: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── 8. Product map ──
  const productMap = buildProductMap();

  try {
    switch (eventType) {
      // ── Subscription created / updated / activated ──
      case "subscription.created":
      case "subscription.updated":
      case "subscription.activated": {
        if (!userId) {
          log({ event: "no_user_id", type: eventType, subscription_id: sub?.id });
          break;
        }

        const productId: string | undefined = sub.product?.id;
        if (!productId || !productMap.has(productId)) {
          logError({ event: "unknown_product_id", product_id: productId });
          return new Response(
            JSON.stringify({ error: "Unknown product ID" }),
            { status: 422, headers: { "Content-Type": "application/json" } }
          );
        }

        const planName = productMap.get(productId)!;

        // Get proofs_limit from plans table
        const { data: planRow } = await supabase
          .from("plans")
          .select("proofs_limit")
          .eq("name", planName)
          .eq("is_active", true)
          .single();

        const proofsLimit = planRow?.proofs_limit ?? 5;

        // Call sync_subscription RPC
        const { error: rpcErr } = await supabase.rpc("sync_subscription", {
          p_user_id: userId,
          p_polar_subscription_id: sub.id,
          p_polar_product_id: productId,
          p_plan: planName,
          p_status: sub.status ?? "active",
          p_proofs_limit: proofsLimit,
          p_current_period_start: sub.current_period_start,
          p_current_period_end: sub.current_period_end,
          p_cancel_at_period_end: sub.cancel_at_period_end ?? false,
          p_canceled_at: sub.canceled_at ?? null,
          p_polar_customer_id: polarCustomerId,
        });

        if (rpcErr) throw rpcErr;

        log({
          event: "subscription_synced",
          user_id: userId,
          plan: planName,
          proofs_limit: proofsLimit,
          status: sub.status,
        });
        break;
      }

      // ── Subscription renewed ──
      case "subscription.renewed": {
        if (!userId) {
          log({ event: "no_user_id", type: eventType });
          break;
        }

        const { error: renewErr } = await supabase.rpc("reset_proofs_for_period", {
          p_user_id: userId,
          p_polar_subscription_id: sub.id,
          p_current_period_start: sub.current_period_start,
          p_current_period_end: sub.current_period_end,
        });

        if (renewErr) throw renewErr;

        log({ event: "subscription_renewed", user_id: userId });
        break;
      }

      // ── Subscription canceled / revoked ──
      case "subscription.canceled":
      case "subscription.revoked": {
        if (!userId) {
          log({ event: "no_user_id", type: eventType });
          break;
        }

        // Get free plan limit
        const { data: freeRow } = await supabase
          .from("plans")
          .select("proofs_limit")
          .eq("name", "free")
          .eq("is_active", true)
          .single();

        const freeLimit = freeRow?.proofs_limit ?? 5;

        const { error: cancelErr } = await supabase.rpc("sync_subscription", {
          p_user_id: userId,
          p_polar_subscription_id: sub.id,
          p_polar_product_id: sub.product?.id ?? "",
          p_plan: "free",
          p_status: "canceled",
          p_proofs_limit: freeLimit,
          p_current_period_start: sub.current_period_start ?? new Date().toISOString(),
          p_current_period_end: sub.current_period_end ?? new Date().toISOString(),
          p_cancel_at_period_end: true,
          p_canceled_at: sub.canceled_at ?? new Date().toISOString(),
          p_polar_customer_id: polarCustomerId,
        });

        if (cancelErr) throw cancelErr;

        log({ event: "subscription_canceled", user_id: userId });
        break;
      }

      default:
        log({ event: "unhandled_event", type: eventType });
    }

    // ── 9. Record successful webhook event ──
    await supabase.from("webhook_events").insert({
      webhook_id: webhookId,
      event_type: eventType,
      payload: payload as Record<string, unknown>,
      user_id: userId,
      processing_ms: Date.now() - startMs,
    });

  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    logError({ event: "processing_error", type: eventType, error: errMsg, user_id: userId });

    // Store failed event for debugging
    await supabase.from("webhook_events").insert({
      webhook_id: webhookId,
      event_type: `${eventType}.FAILED`,
      payload: { ...payload, _error: errMsg },
      user_id: userId,
      processing_ms: Date.now() - startMs,
    }).catch(() => {}); // don't let logging failure mask the real error

    return new Response(
      JSON.stringify({ error: "Processing error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── 10. Success ──
  return new Response(
    JSON.stringify({ received: true }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
