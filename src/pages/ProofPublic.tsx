import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { trackProofView } from "@/hooks/useProofs";
import ProofScoreRing from "@/components/proof/ProofScoreRing";
import RankingChart from "@/components/proof/RankingChart";
import AIOverviewBadge from "@/components/proof/AIOverviewBadge";
import TrendDelta from "@/components/proof/TrendDelta";
import SalesNarrative from "@/components/proof/SalesNarrative";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Proof {
  id: string;
  domain: string;
  target_keyword: string;
  proof_score: number | null;
  ranking_position: number | null;
  ranking_delta: number | null;
  ai_overview: boolean | null;
  ranking_data: {
    rankings: { keyword: string; position: number; url: string; etv: number }[];
    domain_position: number | null;
  } | null;
  serp_features: {
    ai_overview: boolean;
    featured_snippet: boolean;
    local_pack: boolean;
    knowledge_panel: boolean;
  } | null;
  ai_narrative: string | null;
  status: string;
  is_public: boolean;
  created_at: string;
}

const ProofPublic = () => {
  const { slug } = useParams<{ slug: string }>();
  const [proof, setProof] = useState<Proof | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchProof = async () => {
      const query = supabase.from("proofs").select("*") as any;
      const { data, error } = await query
        .eq("public_slug", slug)
        .eq("is_public", true)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const typedData = data as Proof;
      setProof(typedData);
      setLoading(false);

      // Track view
      trackProofView(typedData.id);
    };

    fetchProof();
  }, [slug]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg)" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent)" }} />
      </div>
    );
  }

  // ── Not found ──
  if (notFound || !proof) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg)" }}>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-6 text-center px-4">
            <AlertTriangle size={40} style={{ color: "var(--accent-danger)" }} />
            <h1 className="font-headline text-2xl" style={{ color: "var(--text)" }}>
              This proof is no longer available
            </h1>
            <p className="font-body text-sm max-w-md" style={{ color: "var(--text-dim)" }}>
              The proof may have been made private or deleted by its owner.
            </p>
            <a href="https://vexloai.com">
              <Button
                className="rounded-full h-10 px-8 font-mono text-[10px] uppercase tracking-widest"
                style={{ backgroundColor: "var(--text)", color: "var(--bg)" }}
              >
                Create your own proof at vexloai.com
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(proof.created_at).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });

  const rankingItems = proof.ranking_data?.rankings ?? [];
  const aiImpactPercent = proof.serp_features?.ai_overview
    ? Math.min(100, Math.round(((rankingItems.filter((r) => r.position <= 10).length || 1) / 10) * 30))
    : 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg)" }}>
      {/* ── Header Bar ── */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-raised)" }}
      >
        <span className="font-headline text-lg" style={{ color: "var(--text)" }}>VEXLO</span>
        <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>
          Proof Report
        </span>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 max-w-[960px] mx-auto w-full px-4 py-8 sm:py-12 space-y-6">
        {/* Page Header */}
        <div
          className="rounded-xl p-6"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <p className="font-mono uppercase tracking-widest mb-1" style={{ fontSize: 9, color: "var(--text-muted)" }}>
            SEO Proof Report
          </p>
          <h1 className="font-headline text-2xl sm:text-3xl" style={{ color: "var(--text)" }}>
            {proof.domain}
          </h1>
          <p className="font-body font-light mt-1" style={{ fontSize: 13, color: "var(--text-dim)" }}>
            Keyword: {proof.target_keyword} · {formattedDate}
          </p>
        </div>

        {/* 2-Column: Score + Badges | Rankings */}
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
          <div className="flex flex-col gap-6">
            <div
              className="rounded-xl p-6 flex justify-center"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <ProofScoreRing score={proof.proof_score ?? 0} />
            </div>
            <div
              className="rounded-xl p-6 flex flex-col gap-4"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <TrendDelta delta={proof.ranking_delta} />
              <AIOverviewBadge
                aiOverview={proof.ai_overview ?? false}
                aiImpactPercent={aiImpactPercent}
              />
            </div>
          </div>
          <div
            className="rounded-xl p-6"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <RankingChart rankings={rankingItems} />
          </div>
        </div>

        {/* Sales Narrative */}
        <SalesNarrative narrative={proof.ai_narrative} />

        {/* Disclaimer */}
        <p className="font-mono text-center" style={{ fontSize: 9, color: "var(--text-muted)" }}>
          * Estimated public data — for sales context only
        </p>
      </main>

      {/* ── VEXLO Footer (viral CTA) ── */}
      <footer
        className="sticky bottom-0 border-t flex items-center justify-between px-8 py-4"
        style={{ backgroundColor: "var(--bg-raised)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <span className="font-headline text-sm" style={{ color: "var(--text)" }}>VEXLO</span>
          <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Powered by
          </span>
        </div>
        <a href="https://vexloai.com/signup">
          <button
            className="inline-flex items-center gap-2 h-10 px-6 rounded-full font-mono text-[10px] uppercase tracking-widest transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
            style={{
              backgroundColor: "var(--accent)",
              color: "#fff",
              boxShadow: "var(--emboss-shadow), var(--inset-shadow)",
            }}
          >
            Prove your own domain →
          </button>
        </a>
      </footer>
    </div>
  );
};

export default ProofPublic;
