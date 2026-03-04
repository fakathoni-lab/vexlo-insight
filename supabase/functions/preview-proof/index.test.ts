import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/preview-proof`;

async function callPreviewProof(domain: string, keyword: string) {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ domain, keyword }),
  });
  const body = await res.json();
  return { status: res.status, body };
}

Deno.test("preview-proof returns score for valid input", async () => {
  const { status, body } = await callPreviewProof("google.com", "search engine");
  // Could be 200 or 429 if rate limited from previous runs
  if (status === 429) {
    console.log("Rate limited — skipping assertion (expected if tests ran recently)");
    return;
  }
  assertEquals(status, 200);
  assertEquals(typeof body.score, "number");
  assertEquals(body.domain, "google.com");
});

Deno.test("preview-proof rejects missing fields", async () => {
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ domain: "example.com" }),
  });
  const body = await res.json();
  // 400 or 429
  if (res.status === 429) {
    console.log("Rate limited — skipping");
    await res.text().catch(() => {});
    return;
  }
  assertEquals(res.status, 400);
  assertEquals(body.error, "Missing domain or keyword");
});

Deno.test("preview-proof rejects invalid domain", async () => {
  const { status, body } = await callPreviewProof("not valid!", "test");
  if (status === 429) {
    console.log("Rate limited — skipping");
    return;
  }
  assertEquals(status, 400);
  assertEquals(body.error, "Invalid domain format");
});
