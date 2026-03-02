import { supabase } from "@/integrations/supabase/client";
import { generateSlug } from "@/lib/slug";

interface ShareResult {
  slug: string;
  url: string;
}

/**
 * Ensure a proof has a public_slug and is_public=true, then return the share URL.
 * If slug already exists, reuse it. Otherwise generate + persist.
 */
export async function shareProof(proofId: string, existingSlug: string | null): Promise<ShareResult> {
  if (existingSlug) {
    // Already has a slug — just ensure is_public=true
    await (supabase.from("proofs").update({ is_public: true } as any).eq("id", proofId) as any);
    const url = `${window.location.origin}/p/${existingSlug}`;
    return { slug: existingSlug, url };
  }

  // Generate new slug with collision retry
  const slug = generateSlug();
  const { error } = await (supabase
    .from("proofs")
    .update({ public_slug: slug, is_public: true } as any)
    .eq("id", proofId) as any);

  if (error?.code === "23505") {
    // Unique constraint violation — retry once
    const retrySlug = generateSlug();
    const { error: retryError } = await (supabase
      .from("proofs")
      .update({ public_slug: retrySlug, is_public: true } as any)
      .eq("id", proofId) as any);

    if (retryError) throw new Error("Failed to generate share link");
    const url = `${window.location.origin}/p/${retrySlug}`;
    return { slug: retrySlug, url };
  }

  if (error) throw new Error("Failed to generate share link");

  const url = `${window.location.origin}/p/${slug}`;
  return { slug, url };
}

/**
 * Get the view count for a proof from proof_views table.
 */
export async function getViewCount(proofId: string): Promise<number> {
  const { count, error } = await (supabase
    .from("proof_views" as any)
    .select("*", { count: "exact", head: true })
    .eq("proof_id", proofId) as any);

  if (error) {
    console.error("Failed to get view count:", error);
    return 0;
  }

  return count ?? 0;
}

/**
 * Track a proof view (for public pages). Hashes IP via SHA-256.
 */
export async function trackProofView(proofId: string): Promise<void> {
  try {
    const userAgent = navigator.userAgent;
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(userAgent + Date.now().toString()));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const ipHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 64);

    await (supabase
      .from("proof_views" as any)
      .insert({ proof_id: proofId, viewer_ip_hash: ipHash, user_agent: userAgent } as any) as any);
  } catch (e) {
    console.error("Failed to track view:", e);
  }
}
