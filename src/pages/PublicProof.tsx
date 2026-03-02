import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ScoreRing from "@/components/proof/ScoreRing";
import RankBar from "@/components/proof/RankBar";
import RankingsTable from "@/components/proof/RankingsTable";
import NarrativeCard from "@/components/proof/NarrativeCard";
import { Button } from "@/components/ui/button";
import { Share2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Proof {
  id: string;
  domain: string;
  keyword: string;
  score: number;
  status: string;
  current_rank: number | null;
  delta_30: number | null;
  ai_overview: boolean | null;
  rankings: { rankings: { keyword: string; position: number; url: string; etv: number }[]; domain_position: number | null } | null;
  narrative: string | null;
  error_message: string | null;
  created_at: string;
}

const PublicProof = () => {
  const { slug } = useParams<{ slug: string }>();
  const [proof, setProof] = useState<Proof | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    let pollInterval: ReturnType<typeof setInterval> | null = null;
    let pollCount = 0;

    const fetchProof = async () => {
      const { data, error: fetchError } = await supabase
        .from("proofs")
        .select("*")
        .eq("public_slug", slug)
        .eq("is_public", true)
        .maybeSingle();

      if (fetchError) {
        setError("Failed to load proof.");
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Proof not found or is private.");
        setLoading(false);
        return;
      }

      const typedData = data as unknown as Proof;
      setProof(typedData);
      setLoading(false);

      // Stop polling once complete or failed
      if (typedData.status === "complete" || typedData.status === "failed") {
        if (pollInterval) clearInterval(pollInterval);
      }
    };

    fetchProof();

    pollInterval = setInterval(() => {
      pollCount++;
      if (pollCount >= 15) {
        if (pollInterval) clearInterval(pollInterval);
        return;
      }
      fetchProof();
    }, 2000);

    return () => { if (pollInterval) clearInterval(pollInterval); };
  }, [slug]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.05)" }} />
          <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Loading proof...</p>
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
            <Button variant="outline" className="rounded-full">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isProcessing = proof.status === "pending" || proof.status === "processing";
  const isFailed = proof.status === "failed";
  const isComplete = proof.status === "complete";
  const formattedDate = new Date(proof.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">

        {/* Nav */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="font-headline text-lg" style={{ color: "var(--text)" }}>VEXLO</Link>
          <Button variant="outline" size="sm" className="rounded-full gap-2 font-mono text-[10px] uppercase tracking-widest" onClick={handleShare}>
            <Share2 size={12} /> Share
          </Button>
        </div>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-[11px] uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>{proof.domain}</span>
            <span style={{ color: "var(--text-muted)" }}>·</span>
            <span className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>{formattedDate}</span>
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl mb-3" style={{ color: "var(--text)" }}>"{proof.keyword}"</h1>
        </div>

        {isProcessing && (
          <div className="rounded-[var(--radii-outer)] p-8 flex flex-col items-center gap-4 mb-10" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent-light)" }} />
            <p className="font-body text-sm" style={{ color: "var(--text-dim)" }}>Analyzing SERP data and generating proof score...</p>
          </div>
        )}

        {isComplete && (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-[var(--radii-outer)] p-6 flex flex-col items-center gap-3" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Proof Score</p>
                <ScoreRing score={proof.score} size={120} />
              </div>
              <div className="rounded-[var(--radii-outer)] p-6 flex flex-col gap-3" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Ranking Position</p>
                <div className="flex items-end gap-3">
                  <span className="font-headline text-5xl" style={{ color: "var(--text)" }}>
                    {proof.current_rank ? `#${proof.current_rank}` : "—"}
                  </span>
                  {proof.delta_30 !== null && proof.delta_30 !== 0 && (
                    <span className="font-mono text-sm mb-1" style={{ color: proof.delta_30 > 0 ? "var(--accent-success)" : "var(--accent-danger)" }}>
                      {proof.delta_30 > 0 ? "▲" : "▼"} {Math.abs(proof.delta_30)} in 30d
                    </span>
                  )}
                </div>
                {proof.current_rank && <RankBar keyword={proof.keyword} position={proof.current_rank} />}
              </div>
            </div>

            {proof.rankings?.rankings && proof.rankings.rankings.length > 0 && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: "var(--text-dim)" }}>Top 20 Rankings</p>
                <RankingsTable rankings={proof.rankings.rankings} domainPosition={proof.rankings.domain_position} domain={proof.domain} />
              </div>
            )}

            <NarrativeCard narrative={proof.narrative} />

            <div className="text-center pt-4 pb-8">
              <Link to="/">
                <Button
                  className="rounded-full h-[var(--taxbutton-height)] px-8 font-mono text-[10px] uppercase tracking-widest"
                  style={{ backgroundColor: "var(--text)", color: "var(--bg)", boxShadow: "var(--emboss-shadow), var(--inset-shadow)" }}
                >
                  Generate Your Own Proof →
                </Button>
              </Link>
            </div>
          </div>
        )}

        {isFailed && (
          <div className="rounded-[var(--radii-outer)] p-8 flex flex-col items-center gap-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid rgba(255,71,71,0.2)" }}>
            <AlertTriangle size={32} style={{ color: "var(--accent-danger)" }} />
            <p className="font-body text-sm" style={{ color: "var(--text-dim)" }}>
              {proof.error_message ?? "Proof generation failed."}
            </p>
            <Link to="/">
              <Button variant="outline" className="rounded-full">Generate Your Own</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProof;
