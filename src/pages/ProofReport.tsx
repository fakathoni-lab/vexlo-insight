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
  keyword: string;
  score: number | null;
  current_rank: number | null;
  delta_30: number | null;
  ai_overview: boolean | null;
  rankings: { rankings: { keyword: string; position: number; url: string; etv: number }[]; domain_position: number | null } | null;
  serp_features: { ai_overview: boolean; featured_snippet: boolean; local_pack: boolean; knowledge_panel: boolean } | null;
  narrative: string | null;
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
    const maxPolls = 15;

    const fetchProof = async () => {
      const { data, error: fetchError } = await supabase
        .from("proofs")
        .select("*")
        .eq("id", id)
        .maybeSingle();

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

      const mapped: Proof = {
        id: data.id,
        domain: data.domain,
        keyword: data.keyword,
        score: data.score,
        current_rank: data.current_rank,
        delta_30: data.delta_30,
        ai_overview: data.ai_overview,
        rankings: data.rankings as Proof["rankings"],
        serp_features: data.serp_features as Proof["serp_features"],
        narrative: data.narrative,
        status: data.status ?? "pending",
        is_public: data.is_public,
        public_slug: data.public_slug,
        created_at: data.created_at ?? "",
        user_id: data.user_id,
      };

      setProof(mapped);
      setIsPublic(mapped.is_public);
      setLoading(false);

      if (mapped.status === "complete" || mapped.status === "failed") {
        if (pollInterval) clearInterval(pollInterval);
      }
    };

    fetchProof();

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

  const handleToggleVisibility = async (checked: boolean) => {
    if (!proof) return;
    setToggling(true);
    const { error: updateError } = await supabase
      .from("proofs")
      .update({ is_public: checked })
      .eq("id", proof.id);

    if (updateError) {
      toast.error("Failed to update visibility");
    } else {
      setIsPublic(checked);
      setProof({ ...proof, is_public: checked });
      toast.success(checked ? "Proof is now public" : "Proof is now private");
    }
    setToggling(false);
  };

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

        {/* Nav row */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/dashboard" className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest transition-colors hover:opacity-80" style={{ color: "var(--text-dim)" }}>
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <div className="flex items-center gap-4">
            {isOwner && (
              <div className="flex items-center gap-2">
                <Switch
                  id="visibility"
                  checked={isPublic}
                  onCheckedChange={handleToggleVisibility}
                  disabled={toggling}
                />
                <Label htmlFor="visibility" className="font-mono text-[10px] uppercase tracking-widest cursor-pointer" style={{ color: "var(--text-dim)" }}>
                  {isPublic ? "Public" : "Private"}
                </Label>
              </div>
            )}
            {isPublic && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full gap-2 font-mono text-[10px] uppercase tracking-widest"
                onClick={handleShare}
              >
                <Share2 size={12} /> Share
              </Button>
            )}
          </div>
        </div>

        {/* Header */}
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
            "{proof.keyword}"
          </h1>
          <StatusBadge status={proof.status} />
        </div>

        {/* Processing state */}
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

        {/* Score + Rank row */}
        {proof.status === "complete" && (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Score card */}
              <div
                className="rounded-[var(--radii-outer)] p-6 flex flex-col items-center gap-3"
                style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                  Proof Score
                </p>
                <ScoreRing score={proof.score ?? 0} size={120} />
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
                    {proof.current_rank ? `#${proof.current_rank}` : "—"}
                  </span>
                  {proof.delta_30 !== null && proof.delta_30 !== 0 && (
                    <span
                      className="font-mono text-sm mb-1"
                      style={{ color: proof.delta_30 > 0 ? "var(--accent-success)" : "var(--accent-danger)" }}
                    >
                      {proof.delta_30 > 0 ? "▲" : "▼"} {Math.abs(proof.delta_30)} in 30d
                    </span>
                  )}
                </div>
                {proof.current_rank && (
                  <RankBar keyword={proof.keyword} position={proof.current_rank} />
                )}
              </div>
            </div>

            {/* SERP Features */}
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: "var(--text-dim)" }}>
                SERP Features
              </p>
              <SerpFeatureGrid
                serpFeatures={proof.serp_features ?? { ai_overview: false, featured_snippet: false, local_pack: false, knowledge_panel: false }}
              />
            </div>

            {/* Rankings Table */}
            {proof.rankings && Array.isArray(proof.rankings) && proof.rankings.length > 0 && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: "var(--text-dim)" }}>
                  Top 20 Rankings
                </p>
                <RankingsTable
                  rankings={proof.rankings}
                  domainPosition={proof.current_rank ?? null}
                  domain={proof.domain}
                />
              </div>
            )}

            {/* AI Narrative */}
            <NarrativeCard narrative={proof.narrative} />

            {/* CTA Footer */}
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

        {/* Failed state */}
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
