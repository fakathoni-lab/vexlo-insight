import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import ProofScoreRing from "@/components/proof/ProofScoreRing";
import RankingChart from "@/components/proof/RankingChart";
import AIOverviewBadge from "@/components/proof/AIOverviewBadge";
import TrendDelta from "@/components/proof/TrendDelta";
import SalesNarrative from "@/components/proof/SalesNarrative";
import { Loader2, AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Proof {
  id: string;
  domain: string;
  keyword: string;
  score: number;
  current_rank: number | null;
  delta_30: number | null;
  ai_overview: boolean | null;
  rankings: {
    rankings: { keyword: string; position: number; url: string; etv: number }[];
    domain_position: number | null;
  } | null;
  narrative: string | null;
  created_at: string;
  user_id: string;
}

const loadingSteps = [
  "Fetching Rankings",
  "Analyzing SERP Features",
  "Calculating Proof Score",
  "Generating Sales Narrative",
];

const ProofResult = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [proof, setProof] = useState<Proof | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const edgeFunctionInvoked = useRef(false);

  // Derive status: 0 = pending/processing, -1 = failed, >0 = complete
  const derivedStatus = proof ? (proof.score > 0 ? "complete" : proof.score < 0 ? "failed" : "processing") : "loading";

  useEffect(() => {
    if (!id || !user) return;

    const fetchProof = async () => {
      const { data, error: fetchError } = await supabase
        .from("proofs")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (fetchError || !data) {
        setError("Proof not found.");
        setLoading(false);
        return;
      }

      setProof(data as unknown as Proof);
      setLoading(false);

      // If score is 0 (pending), invoke edge function
      if (data.score === 0 && !edgeFunctionInvoked.current) {
        edgeFunctionInvoked.current = true;
        supabase.functions.invoke("generate-proof", {
          body: { domain: data.domain, keyword: data.keyword, proof_id: data.id },
        }).catch((err) => {
          console.error("Edge function invocation failed:", err);
        });
      }
    };

    fetchProof();

    // Realtime subscription for updates
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
          setProof(payload.new as Proof);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user]);

  // Progressive loading step animation
  useEffect(() => {
    if (derivedStatus !== "processing") return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 2500);
    return () => clearInterval(interval);
  }, [derivedStatus]);

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
  if (derivedStatus === "processing") {
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

          {/* Progressive steps */}
          <div className="flex flex-col gap-3 w-full mt-2">
            {loadingSteps.map((step, i) => {
              const isDone = i < activeStep;
              const isActive = i === activeStep;
              return (
                <div key={step} className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    {isDone ? (
                      <Check className="w-4 h-4" style={{ color: "#22c55e" }} />
                    ) : isActive ? (
                      <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--accent)" }} />
                    ) : (
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--text-muted)" }} />
                    )}
                  </div>
                  <span
                    className="font-body text-sm"
                    style={{
                      color: isDone ? "#22c55e" : isActive ? "var(--text)" : "var(--text-muted)",
                      transition: "color 0.3s",
                    }}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="font-body text-sm text-center mt-2" style={{ color: "var(--text-dim)" }}>
            Typically ready in 15-30 seconds.
          </p>
        </div>
      </div>
    );
  }


  // ── Failed ──
  if (derivedStatus === "failed") {
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
            {proof.narrative ?? "Something went wrong during data collection. Please try again."}
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

  const rankingItems = proof.rankings?.rankings ?? [];
  const aiImpactPercent = proof.ai_overview
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
            Keyword: {proof.keyword} · {formattedDate}
          </p>
        </div>
        <div
          className="shrink-0 rounded-full px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest"
          style={{
            backgroundColor: proof.score >= 70 ? "rgba(34,197,94,0.12)" : proof.score >= 40 ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)",
            color: proof.score >= 70 ? "#22c55e" : proof.score >= 40 ? "#f59e0b" : "#ef4444",
            border: `1px solid ${proof.score >= 70 ? "rgba(34,197,94,0.25)" : proof.score >= 40 ? "rgba(245,158,11,0.25)" : "rgba(239,68,68,0.25)"}`,
          }}
        >
          Score: {proof.score}/100
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
            <ProofScoreRing score={proof.score} />
          </div>

          {/* Badges Card */}
          <div
            className="rounded-xl p-6 flex flex-col gap-4"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <TrendDelta delta={proof.delta_30} />
            <AIOverviewBadge
              aiOverview={proof.ai_overview ?? false}
              serpFeatures={null}
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
      <SalesNarrative narrative={proof.narrative} />

      {/* ── Disclaimer ── */}
      <p className="font-mono text-center" style={{ fontSize: 9, color: "var(--text-muted)" }}>
        * Estimated public data — for sales context only
      </p>
    </div>
  );
};

export default ProofResult;
