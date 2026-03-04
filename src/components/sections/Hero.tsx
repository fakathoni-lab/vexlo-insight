import { useState, useRef } from "react";
import { ChevronDown, Loader2, Lock, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStarfield } from "@/hooks/useStarfield";
import { supabase } from "@/integrations/supabase/client";

interface PreviewResult {
  domain: string;
  keyword: string;
  score: number;
  rank: number | null;
}

const ScoreRingPreview = ({ score }: { score: number }) => {
  const color =
    score >= 70 ? "var(--accent-success)" : score >= 40 ? "#f59e0b" : "#ef4444";
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r="54" fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-3xl font-bold" style={{ color }}>{score}</span>
        <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>Score</span>
      </div>
    </div>
  );
};

const Hero = () => {
  const navigate = useNavigate();
  const canvasRef = useStarfield();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [loading, setLoading] = useState(false);
  const [loadingDomain, setLoadingDomain] = useState("");
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const raw = textareaRef.current?.value?.trim() ?? "";
    if (!raw) return;

    // Parse "domain — keyword" or "domain keyword"
    const parts = raw.includes("—")
      ? raw.split("—").map((s) => s.trim())
      : raw.includes("-")
        ? [raw.split(/\s+/)[0], raw.split(/\s+/).slice(1).join(" ")]
        : raw.split(/\s+/).length >= 2
          ? [raw.split(/\s+/)[0], raw.split(/\s+/).slice(1).join(" ")]
          : [raw, ""];

    const domain = (parts[0] ?? "").replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "").toLowerCase();
    const keyword = (parts[1] ?? "").trim();

    if (!domain || domain.length < 3) {
      setError("Enter a valid domain (e.g. example.com)");
      return;
    }
    if (!keyword || keyword.length < 2) {
      setError("Add a keyword after the domain (e.g. example.com — best seo tool)");
      return;
    }

    setError(null);
    setLoading(true);
    setLoadingDomain(domain);
    setPreview(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("preview-proof", {
        body: { domain, keyword },
      });

      if (fnError) {
        // FunctionsHttpError stores the Response in .context
        const ctx = (fnError as any)?.context;
        if (ctx instanceof Response) {
          const body = await ctx.json().catch(() => null);
          if (ctx.status === 429 || body?.error?.includes("Too many requests")) {
            setError("rate_limited");
            return;
          }
        }
        throw fnError;
      }
      if (data?.error) {
        if (data.error.includes("Too many requests")) {
          setError("rate_limited");
          return;
        }
        throw new Error(data.error);
      }

      setPreview({
        domain: data.domain,
        keyword: data.keyword,
        score: data.score,
        rank: data.rank,
      });
    } catch (err: unknown) {
      if (import.meta.env.DEV) console.error("Preview proof failed:", err);
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
      setLoadingDomain("");
    }
  };

  const handleSeeFullProof = () => {
    if (!preview) return;
    sessionStorage.setItem('vexlo_prefill', JSON.stringify({
      domain: preview.domain,
      keyword: preview.keyword,
    }));
    navigate("/signup");
  };

  const handleDismiss = () => {
    setPreview(null);
  };

  return (
    <section className="hero">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}
      />
      <div className="hero-atmosphere" />
      <div className="light-streaks" />
      <div className="hero-vignette" />
      <div className="hero-wordmark">
        <span className="hero-wordmark-text">VEXLO</span>
      </div>

      <div className="hero-content">
        <h1
          className="font-sans font-bold tracking-tight"
          style={{ fontSize: "clamp(52px, 8vw, 108px)", color: "#FFFFFF", lineHeight: 1.1, marginBottom: "16px" }}
        >
          The First 60 Seconds<br />Decide the Deal.
        </h1>
        <p
          className="font-sans"
          style={{ fontSize: "clamp(16px, 1.6vw, 20px)", fontWeight: 400, color: "#E5E7EB", lineHeight: 1.6, maxWidth: "520px", marginBottom: "32px" }}
        >
          Generate branded, prospect-specific SEO proof in under 60 seconds.
          No access. No waiting. No skill gap in the room.
        </p>
      </div>

      {/* ── Search / Preview Area ── */}
      <div className="hero-search-outer">
        {!preview ? (
          /* ── Input State ── */
          <div className="search-box">
            <label className="font-sans block mb-2" style={{ fontSize: "14px", fontWeight: 500, color: "#E5E7EB" }}>
              Enter your prospect's domain and keyword:
            </label>
            <textarea
              ref={textareaRef}
              placeholder="e.g. example.com — best plumber london"
              rows={3}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
              }}
            />
            {error && error !== "rate_limited" && (
              <p className="font-sans text-center mt-2" style={{ fontSize: "13px", color: "var(--accent-danger)" }}>
                {error}
              </p>
            )}
            {error === "rate_limited" && (
              <div className="mt-3 text-center px-4 py-3 rounded-xl" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                <p className="font-sans text-sm font-medium" style={{ color: "var(--text)" }}>
                  You've reached the preview limit.
                </p>
                <p className="font-sans text-xs mt-1" style={{ color: "var(--text-dim)" }}>
                  Sign up for unlimited proofs — free, no card required.
                </p>
                <button
                  onClick={() => navigate("/signup")}
                  className="mt-2 px-5 py-2 text-sm font-semibold rounded-[var(--radii-inner)] transition-all duration-200"
                  style={{ background: "var(--accent)", color: "#fff" }}
                >
                  Sign Up Free →
                </button>
              </div>
            )}
            <div className="search-actions">
              <div />
              <button
                className="hero-cta-btn"
                aria-label="Generate proof preview"
                onClick={handleSubmit}
                disabled={loading}
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing {loadingDomain}…
                  </span>
                ) : (
                  "Generate Proof →"
                )}
              </button>
            </div>
            <p className="font-sans mt-2 text-center" style={{ fontSize: "13px", color: "#9CA3AF" }}>
              Free preview. No login required.
            </p>
          </div>
        ) : (
          /* ── Preview Card ── */
          <div
            className="relative overflow-hidden"
            style={{
              background: "rgba(13,13,13,0.85)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radii-outer)",
              maxWidth: 480,
              width: "100%",
              padding: 0,
            }}
          >
            {/* Visible section */}
            <div className="p-6 pb-4 flex items-center gap-5">
              <ScoreRingPreview score={preview.score} />
              <div className="flex-1 min-w-0">
                <p className="font-sans text-lg font-bold truncate" style={{ color: "var(--text)" }}>
                  {preview.domain}
                </p>
                <p className="font-sans text-sm truncate mt-0.5" style={{ color: "var(--text-dim)" }}>
                  {preview.keyword}
                </p>
                {preview.rank !== null && (
                  <p className="font-mono text-xs mt-2" style={{ color: "var(--accent)" }}>
                    Ranking #{preview.rank}
                  </p>
                )}
                {preview.rank === null && (
                  <p className="font-mono text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                    Not in top 10
                  </p>
                )}
              </div>
            </div>

            {/* Blurred section */}
            <div className="relative px-6 pb-2" style={{ minHeight: 80 }}>
              <div
                className="space-y-2 select-none"
                style={{ filter: "blur(6px)", opacity: 0.4, pointerEvents: "none" }}
              >
                <div className="h-3 rounded" style={{ background: "var(--border-strong)", width: "100%" }} />
                <div className="h-3 rounded" style={{ background: "var(--border-strong)", width: "85%" }} />
                <div className="h-3 rounded" style={{ background: "var(--border-strong)", width: "70%" }} />
                <div className="flex gap-2 mt-3">
                  <div className="h-6 w-20 rounded" style={{ background: "var(--border-strong)" }} />
                  <div className="h-6 w-16 rounded" style={{ background: "var(--border-strong)" }} />
                  <div className="h-6 w-24 rounded" style={{ background: "var(--border-strong)" }} />
                </div>
              </div>

              {/* Lock overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" style={{ color: "var(--text-dim)" }} />
                  <span className="font-sans text-sm font-medium" style={{ color: "var(--text-dim)" }}>
                    Sign up free to see the full proof
                  </span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="px-6 pb-6 pt-4 flex items-center gap-3">
              <button
                onClick={handleSeeFullProof}
                className="flex-1 py-2.5 text-sm font-semibold rounded-[var(--radii-inner)] transition-all duration-200"
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                  fontFamily: "var(--font-sans)",
                }}
              >
                See Full Proof — Free
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 text-sm font-medium rounded-[var(--radii-inner)] transition-colors duration-150"
                style={{
                  background: "transparent",
                  color: "var(--text-dim)",
                  border: "1px solid var(--border)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                Maybe later
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="hero-bottom">
        <div className="scroll-indicator">
          <ChevronDown />
        </div>
        <div className="announcement">
          <div>
            <p className="ann-label">
              <strong>Founding Membership</strong> — Seleksi Terbatas
            </p>
          </div>
          <button className="ann-btn" onClick={() => navigate("/pricing")}>
            Claim Founding Member Access
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
