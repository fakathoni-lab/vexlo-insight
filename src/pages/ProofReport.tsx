import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import ScoreRing from "@/components/proof/ScoreRing";
import RankBar from "@/components/proof/RankBar";
import SerpFeatureGrid from "@/components/proof/SerpFeatureGrid";
import RankingsTable from "@/components/proof/RankingsTable";
import NarrativeCard from "@/components/proof/NarrativeCard";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Share2, Clock, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Proof {
  id: string;
  domain: string;
  target_keyword: string;
  proof_score: number | null;
  ranking_position: number | null;
  ranking_delta: number | null;
  ai_overview: boolean | null;
  ranking_data: { rankings: { keyword: string; position: number; url: string; etv: number }[]; domain_position: number | null } | null;
  serp_features: { ai_overview: boolean; featured_snippet: boolean; local_pack: boolean; knowledge_panel: boolean } | null;
  ai_narrative: string | null;
  status: string;
  is_public: boolean;
  public_slug: string | null;
  created_at: string;
  user_id: string;
}

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { icon: typeof Clock; label: string; color: string }> = {
    pending: { icon: Clock, label: "Pending", color: "var(--text-muted)" },
    processing: { icon: Loader2, label: "Processing", color: "var(--accent-light)" },
    complete: { icon: CheckCircle, label: "Complete", color: "var(--accent-success)" },
    failed: { icon: AlertTriangle, label: "Failed", color: "var(--accent-danger)" },
  };
  const { icon: Icon, label, color } = config[status] ?? config.pending;
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest" style={{ color }}>
      <Icon size={12} className={status === "processing" ? "animate-spin" : ""} />
      {label}
    </span>
  );
};

const ProofReport = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [proof, setProof] = useState<Proof | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [toggling, setToggling] = useState(false);

  const isOwner = !!(user && proof && user.id === proof.user_id);

  useEffect(() => {
    if (!id) return;

    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let pollCount = 0;
    const maxPolls = 15; // 30s at 2s intervals

    const fetchProof = async () => {
      // Use type assertion because auto-generated types.ts still has old column names
      // but the actual DB schema uses the target columns
      const { data, error: fetchError } = await (supabase
        .from("proofs")
        .select("*")
        .eq("id", id)
        .maybeSingle() as unknown as Promise<{ data: Proof | null; error: { message: string } | null }>);

      if (fetchError) {
        setError("Failed to load proof.");
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Proof not found.");
        setLoading(false);
        return;
      }

      setProof(data);
      setIsPublic(data.is_public ?? false);
      setLoading(false);

      // Stop polling if complete or failed
      if (data.status === "complete" || data.status === "failed") {
        if (pollInterval) clearInterval(pollInterval);
      }
    };

    fetchProof();

    // Start polling for processing proofs
    pollInterval = setInterval(() => {
      pollCount++;
      if (pollCount >= maxPolls) {
        if (pollInterval) clearInterval(pollInterval);
        return;
      }
      fetchProof();
    }, 2000);

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [id]);

  const handleShare = async () => {
    const shareUrl = proof?.public_slug
      ? `${window.location.origin}/p/${proof.public_slug}`
      : window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.05)" }} />
          <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Loading proof...
          </p>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error || !proof) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg)" }}>
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle size={32} style={{ color: "var(--accent-danger)" }} />
          <p className="font-body text-lg" style={{ color: "var(--text)" }}>{error ?? "Proof not found"}</p>
          <Link to="/">
            <Button variant="outline" className="rounded-full">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isProcessing = proof.status === "processing" || proof.status === "pending";
  const formattedDate = new Date(proof.created_at).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">

        {/* ── Nav row ── */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/dashboard" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest transition-colors hover:opacity-80" style={{ color: "var(--text-dim)" }}>
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full gap-2 font-mono text-[10px] uppercase tracking-widest"
            onClick={handleShare}
          >
            <Share2 size={12} /> Share
          </Button>
        </div>

        {/* ── Header ── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-[11px] uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>
              {proof.domain}
            </span>
            <span style={{ color: "var(--text-muted)" }}>·</span>
            <span className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
              {formattedDate}
            </span>
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl mb-3" style={{ color: "var(--text)" }}>
            "{proof.target_keyword}"
          </h1>
          <StatusBadge status={proof.status} />
        </div>

        {/* ── Processing state ── */}
        {isProcessing && (
          <div
            className="rounded-[var(--radii-outer)] p-8 flex flex-col items-center gap-4 mb-10"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent-light)" }} />
            <p className="font-body text-sm" style={{ color: "var(--text-dim)" }}>
              Analyzing SERP data and generating proof score...
            </p>
            <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              This usually takes 15-25 seconds
            </p>
          </div>
        )}

        {/* ── Score + Rank row ── */}
        {proof.status === "complete" && (
          <div className="flex flex-col gap-8">

            {/* Score & Rank */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Score card */}
              <div
                className="rounded-[var(--radii-outer)] p-6 flex flex-col items-center gap-3"
                style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                  Proof Score
                </p>
                <ScoreRing score={proof.proof_score ?? 0} size={120} />
              </div>

              {/* Rank card */}
              <div
                className="rounded-[var(--radii-outer)] p-6 flex flex-col gap-3"
                style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                  Ranking Position
                </p>
                <div className="flex items-end gap-3">
                  <span className="font-headline text-5xl" style={{ color: "var(--text)" }}>
                    {proof.ranking_position ? `#${proof.ranking_position}` : "—"}
                  </span>
                  {proof.ranking_delta !== null && proof.ranking_delta !== 0 && (
                    <span
                      className="font-mono text-sm mb-1"
                      style={{ color: proof.ranking_delta > 0 ? "var(--accent-success)" : "var(--accent-danger)" }}
                    >
                      {proof.ranking_delta > 0 ? "▲" : "▼"} {Math.abs(proof.ranking_delta)} in 30d
                    </span>
                  )}
                </div>
                {proof.ranking_position && (
                  <RankBar keyword={proof.target_keyword} position={proof.ranking_position} />
                )}
              </div>
            </div>

            {/* ── SERP Features ── */}
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: "var(--text-dim)" }}>
                SERP Features
              </p>
              <SerpFeatureGrid
                serpFeatures={proof.serp_features ?? { ai_overview: false, featured_snippet: false, local_pack: false, knowledge_panel: false }}
              />
            </div>

            {/* ── Rankings Table ── */}
            {proof.ranking_data?.rankings && proof.ranking_data.rankings.length > 0 && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: "var(--text-dim)" }}>
                  Top 20 Rankings
                </p>
                <RankingsTable
                  rankings={proof.ranking_data.rankings}
                  domainPosition={proof.ranking_data.domain_position}
                  domain={proof.domain}
                />
              </div>
            )}

            {/* ── AI Narrative ── */}
            <NarrativeCard narrative={proof.ai_narrative} />

            {/* ── CTA Footer ── */}
            <div className="text-center pt-4 pb-8">
              <Link to="/">
                <Button
                  className="rounded-full h-[var(--taxbutton-height)] px-8 font-mono text-[10px] uppercase tracking-widest"
                  style={{
                    backgroundColor: "var(--text)",
                    color: "var(--bg)",
                    boxShadow: "var(--emboss-shadow), var(--inset-shadow)",
                  }}
                >
                  Generate Your Own Proof →
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* ── Failed state ── */}
        {proof.status === "failed" && (
          <div
            className="rounded-[var(--radii-outer)] p-8 flex flex-col items-center gap-4"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid rgba(255,71,71,0.2)" }}
          >
            <AlertTriangle size={32} style={{ color: "var(--accent-danger)" }} />
            <p className="font-body text-sm" style={{ color: "var(--text-dim)" }}>
              Proof generation failed. Please try again.
            </p>
            <Link to="/dashboard/new">
              <Button variant="outline" className="rounded-full">
                Try Again
              </Button>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProofReport;
