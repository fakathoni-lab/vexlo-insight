import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getViewCount } from "@/hooks/useProofs";
import { useAuth } from "@/hooks/useAuth";
import ProofScoreRing from "@/components/proof/ProofScoreRing";
import RankingChart from "@/components/proof/RankingChart";
import AIOverviewBadge from "@/components/proof/AIOverviewBadge";
import TrendDelta from "@/components/proof/TrendDelta";
import SalesNarrative from "@/components/proof/SalesNarrative";
import ProofActions from "@/components/proof/ProofActions";
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
  public_slug: string | null;
  created_at: string;
  user_id: string;
  error_message: string | null;
}

const ProofResult = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [proof, setProof] = useState<Proof | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !user) return;

    const fetchProof = async () => {
      const query = supabase.from("proofs").select("*") as any;
      const { data, error: fetchError } = await query
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (fetchError || !data) {
        setError("Proof not found.");
        setLoading(false);
        return;
      }

      setProof(data as Proof);
      setLoading(false);
    };

    fetchProof();

    // Realtime subscription for processing proofs
    const channel = supabase
      .channel(`proof-${id}`)
      .on(
        "postgres_changes" as any,
        {
          event: "UPDATE",
          schema: "public",
          table: "proofs",
          filter: `id=eq.${id}`,
        },
        (payload: any) => {
          const updated = payload.new as Proof;
          setProof(updated);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent)" }} />
          <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Loading proof...
          </p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !proof) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle size={32} style={{ color: "var(--accent-danger)" }} />
          <p className="font-body text-lg" style={{ color: "var(--text)" }}>{error ?? "Proof not found"}</p>
          <Button variant="outline" className="rounded-full" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // ── Processing / Pending ──
  if (proof.status === "pending" || proof.status === "processing") {
    return (
      <div className="flex items-center justify-center py-24">
        <div
          className="rounded-xl p-10 flex flex-col items-center gap-5 max-w-md w-full"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <Loader2 size={40} className="animate-spin" style={{ color: "var(--accent-light)" }} />
          <h2 className="font-headline text-xl" style={{ color: "var(--text)" }}>
            Generating Proof…
          </h2>
          <p className="font-body text-sm text-center" style={{ color: "var(--text-dim)" }}>
            Analyzing SERP data and calculating your proof score. This usually takes 15-25 seconds.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Status: {proof.status}
          </p>
        </div>
      </div>
    );
  }

  // ── Failed ──
  if (proof.status === "failed") {
    return (
      <div className="flex items-center justify-center py-24">
        <div
          className="rounded-xl p-10 flex flex-col items-center gap-5 max-w-md w-full"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid rgba(255,71,71,0.2)" }}
        >
          <AlertTriangle size={40} style={{ color: "var(--accent-danger)" }} />
          <h2 className="font-headline text-xl" style={{ color: "var(--text)" }}>
            Proof Generation Failed
          </h2>
          <p className="font-body text-sm text-center" style={{ color: "var(--text-dim)" }}>
            {proof.error_message ?? "Something went wrong during data collection. Please try again."}
          </p>
          <Button
            className="rounded-full h-10 px-6 font-mono text-[10px] uppercase tracking-widest"
            style={{ backgroundColor: "var(--accent)", color: "#fff" }}
            onClick={() => navigate("/dashboard/new")}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // ── Complete ──
  const formattedDate = new Date(proof.created_at).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });

  // Estimate AI impact from ranking_data
  const rankingItems = proof.ranking_data?.rankings ?? [];
  const aiImpactPercent = proof.serp_features?.ai_overview
    ? Math.min(100, Math.round(((rankingItems.filter((r) => r.position <= 10).length || 1) / 10) * 30))
    : 0;

  return (
    <div className="max-w-[960px] mx-auto pb-24 space-y-6">
      {/* ── Page Header ── */}
      <div
        className="rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <div>
          <p className="font-mono uppercase tracking-widest mb-1" style={{ fontSize: 9, color: "var(--text-muted)" }}>
            Proof Report
          </p>
          <h1 className="font-headline text-2xl sm:text-3xl" style={{ color: "var(--text)" }}>
            {proof.domain}
          </h1>
          <p className="font-body font-light mt-1" style={{ fontSize: 13, color: "var(--text-dim)" }}>
            Keyword: {proof.target_keyword} · {formattedDate}
          </p>
        </div>
        <div
          className="shrink-0 rounded-full px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest"
          style={{
            backgroundColor: (proof.proof_score ?? 0) >= 70 ? "rgba(34,197,94,0.12)" : (proof.proof_score ?? 0) >= 40 ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)",
            color: (proof.proof_score ?? 0) >= 70 ? "#22c55e" : (proof.proof_score ?? 0) >= 40 ? "#f59e0b" : "#ef4444",
            border: `1px solid ${(proof.proof_score ?? 0) >= 70 ? "rgba(34,197,94,0.25)" : (proof.proof_score ?? 0) >= 40 ? "rgba(245,158,11,0.25)" : "rgba(239,68,68,0.25)"}`,
          }}
        >
          Score: {proof.proof_score ?? "—"}/100
        </div>
      </div>

      {/* ── 2-Column: Score + Badges | Rankings ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* Score Ring Card */}
          <div
            className="rounded-xl p-6 flex justify-center"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <ProofScoreRing score={proof.proof_score ?? 0} />
          </div>

          {/* Badges Card */}
          <div
            className="rounded-xl p-6 flex flex-col gap-4"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <TrendDelta delta={proof.ranking_delta} />
            <AIOverviewBadge
              aiOverview={proof.ai_overview ?? false}
              serpFeatures={proof.serp_features}
              aiImpactPercent={aiImpactPercent}
            />
          </div>
        </div>

        {/* Right column: Ranking Chart */}
        <div
          className="rounded-xl p-6"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <RankingChart rankings={rankingItems} />
        </div>
      </div>

      {/* ── Sales Narrative ── */}
      <SalesNarrative narrative={proof.ai_narrative} />

      {/* ── Disclaimer ── */}
      <p className="font-mono text-center" style={{ fontSize: 9, color: "var(--text-muted)" }}>
        * Estimated public data — for sales context only
      </p>

      {/* ── Sticky Actions ── */}
      <ProofActions
        proofId={proof.id}
        narrative={proof.ai_narrative}
        publicSlug={proof.public_slug}
        isPublic={proof.is_public}
        onSlugUpdate={(slug) => setProof({ ...proof, public_slug: slug, is_public: true })}
      />
    </div>
  );
};

export default ProofResult;
