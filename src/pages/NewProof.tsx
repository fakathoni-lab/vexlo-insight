import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Check, Copy, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import ScoreRing from "@/components/proof/ScoreRing";
import RankBar from "@/components/proof/RankBar";
import Typewriter from "@/components/proof/Typewriter";
import type { Json } from "@/integrations/supabase/types";

// ── Schema ──
const schema = z.object({
  domain: z
    .string()
    .min(3, "Enter domain without https:// (e.g. example.com)")
    .max(253)
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/,
      "Enter domain without https:// (e.g. example.com)"
    ),
  keyword: z.string().trim().min(2, "Keyword must be at least 2 characters").max(100),
});
type FormData = z.infer<typeof schema>;

interface RankingItem {
  keyword: string;
  position: number;
}

interface ProofResult {
  id: string;
  domain: string;
  target_keyword: string;
  proof_score: number | null;
  ranking_position: number | null;
  ranking_delta: number | null;
  ai_overview: boolean | null;
  ranking_data: Json | null;
  ai_narrative: string | null;
  status: string;
}

type State = "input" | "loading" | "result";

const loadingSteps = [
  "Fetching Rankings",
  "Analyzing SERP Features",
  "Calculating Proof Score",
  "Generating Sales Narrative",
];

const NewProof = () => {
  const { user } = useAuth();
  const [state, setState] = useState<State>("input");
  const [activeStep, setActiveStep] = useState(0);
  const [result, setResult] = useState<ProofResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    setState("loading");
    setActiveStep(0);

    // 1. Insert pending proof row with public_slug
    const publicSlug = crypto.randomUUID().slice(0, 8);
    const { data: proofRow, error: insertError } = await supabase
      .from("proofs")
      .insert({
        user_id: user.id,
        domain: data.domain,
        target_keyword: data.keyword,
        status: "pending",
        public_slug: publicSlug,
        is_public: true,
      } as any)
      .select("id")
      .single();

    if (insertError || !proofRow) {
      setState("input");
      toast.error("Failed to create proof", { description: insertError?.message });
      return;
    }

    // 2. Progressive loading UI
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setActiveStep(step);
      if (step >= loadingSteps.length) clearInterval(interval);
    }, 2000);

    try {
      // 3. Call edge function
      const { error } = await supabase.functions.invoke("generate-proof", {
        body: { domain: data.domain, keyword: data.keyword, proof_id: proofRow.id },
      });

      clearInterval(interval);

      if (error) {
        setState("input");
        toast.error("Failed to generate proof", { description: error.message });
        return;
      }

      // 4. Fetch the completed proof from DB (target schema columns)
      const { data: completedProof } = await supabase
        .from("proofs")
        .select("id, domain, target_keyword, proof_score, ranking_position, ranking_delta, ai_overview, ranking_data, ai_narrative, status" as any)
        .eq("id", proofRow.id)
        .single();

      if (completedProof) {
        setResult(completedProof as unknown as ProofResult);
      }

      setActiveStep(loadingSteps.length);
      setTimeout(() => setState("result"), 800);
    } catch {
      clearInterval(interval);
      setState("input");
      toast.error("Something went wrong", { description: "Please try again." });
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `Proof Report: ${result.domain}\nKeyword: ${result.target_keyword}\nScore: ${result.proof_score ?? "N/A"}/100\nCurrent Rank: ${result.ranking_position ? `#${result.ranking_position}` : "N/A"}\n30-Day Delta: ${result.ranking_delta ?? "N/A"}\nAI Overview: ${result.ai_overview ? "Yes" : "No"}\n\n${result.ai_narrative || ""}`;
    navigator.clipboard.writeText(text);
    toast("Copied!", { description: "Report copied to clipboard." });
  };

  // ── STATE 1: INPUT ──
  if (state === "input") {
    return (
      <div className="flex items-start justify-center pt-8">
        <div
          className="w-full max-w-[560px] rounded-[12px] border border-[rgba(255,255,255,0.07)]"
          style={{ backgroundColor: "#0d0d0d", padding: 40 }}
        >
          <h2 className="font-headline mb-1" style={{ fontSize: 28, color: "#f0f0ee" }}>
            Generate Proof Report
          </h2>
          <p className="font-body font-light mb-8" style={{ fontSize: 13, color: "rgba(240,240,238,0.45)" }}>
            Enter any prospect domain and target keyword below.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "rgba(240,240,238,0.45)" }}>
                Domain
              </Label>
              <Input
                placeholder="example.com — no https://"
                {...register("domain")}
                className="h-10 bg-[#080808] border-[rgba(255,255,255,0.07)] text-[#f0f0ee] placeholder:text-[rgba(240,240,238,0.25)] font-body text-sm rounded-[4px] focus-visible:ring-[hsl(263,84%,58%)] focus-visible:ring-1 focus-visible:ring-offset-0"
              />
              {errors.domain && (
                <p className="text-xs font-body" style={{ color: "hsl(0,80%,60%)" }}>{errors.domain.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "rgba(240,240,238,0.45)" }}>
                Keyword
              </Label>
              <Input
                placeholder="best plumber london"
                {...register("keyword")}
                className="h-10 bg-[#080808] border-[rgba(255,255,255,0.07)] text-[#f0f0ee] placeholder:text-[rgba(240,240,238,0.25)] font-body text-sm rounded-[4px] focus-visible:ring-[hsl(263,84%,58%)] focus-visible:ring-1 focus-visible:ring-offset-0"
              />
              {errors.keyword && (
                <p className="text-xs font-body" style={{ color: "hsl(0,80%,60%)" }}>{errors.keyword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-10 rounded-[100px] font-mono text-[10px] uppercase tracking-widest bg-[#f0f0ee] text-[#080808] hover:brightness-110 active:scale-[0.98] transition-all duration-200"
              style={{
                boxShadow: "0px 1.5px 2px -1px hsla(0,0%,100%,.2) inset, 0px 1.5px 1px 0px hsla(0,0%,100%,.06)",
              }}
            >
              Generate Proof Report
            </Button>
          </form>

          <p className="mt-5 font-mono text-center" style={{ fontSize: 9, color: "rgba(240,240,238,0.25)" }}>
            * Estimated public data — for sales context only
          </p>
        </div>
      </div>
    );
  }

  // ── STATE 2: LOADING ──
  if (state === "loading") {
    return (
      <div className="flex items-start justify-center pt-8">
        <div
          className="w-full max-w-[560px] rounded-[12px] border border-[rgba(255,255,255,0.07)]"
          style={{ backgroundColor: "#0d0d0d", padding: 40 }}
        >
          <h2 className="font-headline mb-6" style={{ fontSize: 28, color: "#f0f0ee" }}>
            Generating Report…
          </h2>

          <div className="flex flex-col gap-4 mb-8">
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
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "rgba(240,240,238,0.15)" }} />
                    )}
                  </div>
                  <span
                    className="font-body"
                    style={{
                      fontSize: 14,
                      color: isDone ? "#22c55e" : isActive ? "#f0f0ee" : "rgba(240,240,238,0.25)",
                      transition: "color 0.3s",
                    }}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="font-body font-light mb-6" style={{ fontSize: 12, color: "rgba(240,240,238,0.25)" }}>
            Typically ready in 15-30 seconds
          </p>

          <button
            onClick={() => setState("input")}
            className="h-10 px-6 rounded-[100px] font-mono text-[10px] uppercase tracking-widest border transition-all duration-200 hover:bg-[rgba(255,255,255,0.05)]"
            style={{ borderColor: "rgba(255,255,255,0.13)", color: "rgba(240,240,238,0.45)" }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── STATE 3: RESULT ──
  if (!result) return null;

  const rankingsRaw = result.ranking_data as unknown;
  const rankings: RankingItem[] = Array.isArray(rankingsRaw)
    ? (rankingsRaw as unknown as RankingItem[])
    : ((rankingsRaw as Record<string, unknown> | null)?.rankings as RankingItem[] | undefined) || [];

  return (
    <div className="max-w-[900px] mx-auto pb-24 space-y-6">
      {/* Header */}
      <div
        className="rounded-[12px] border border-[rgba(255,255,255,0.07)] p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ backgroundColor: "#0d0d0d" }}
      >
        <div>
          <p className="font-mono uppercase tracking-wide mb-1" style={{ fontSize: 8.5, color: "rgba(240,240,238,0.25)" }}>
            Proof Report
          </p>
          <h2 className="font-headline" style={{ fontSize: 28, color: "#f0f0ee" }}>
            {result.domain}
          </h2>
          <p className="font-body font-light mt-1" style={{ fontSize: 13, color: "rgba(240,240,238,0.45)" }}>
            Keyword: {result.target_keyword}
          </p>
        </div>
        <ScoreRing score={result.proof_score ?? 0} />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Current Rank", value: result.ranking_position ? `#${result.ranking_position}` : "N/A" },
          { label: "30-Day Delta", value: result.ranking_delta !== null ? `${(result.ranking_delta ?? 0) > 0 ? "+" : ""}${result.ranking_delta}` : "N/A" },
          { label: "AI Overview", value: result.ai_overview ? "Yes" : "No" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-[12px] border border-[rgba(255,255,255,0.07)] p-5"
            style={{ backgroundColor: "#0d0d0d" }}
          >
            <span className="block font-mono uppercase tracking-wide mb-2" style={{ fontSize: 8.5, color: "rgba(240,240,238,0.25)" }}>
              {s.label}
            </span>
            <p className="font-headline" style={{ fontSize: 24, color: "#f0f0ee" }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Ranking bars */}
      {rankings.length > 0 && (
        <div
          className="rounded-[12px] border border-[rgba(255,255,255,0.07)] p-8"
          style={{ backgroundColor: "#0d0d0d" }}
        >
          <p className="font-mono uppercase tracking-wide mb-6" style={{ fontSize: 8.5, color: "rgba(240,240,238,0.25)" }}>
            Keyword Rankings
          </p>
          <div className="flex flex-col gap-2">
            {rankings.map((r) => (
              <RankBar key={r.keyword} keyword={r.keyword} position={r.position} />
            ))}
          </div>
        </div>
      )}

      {/* AI Narrative */}
      {result.ai_narrative && (
        <div
          className="rounded-[12px] border border-[rgba(255,255,255,0.07)] p-8"
          style={{ backgroundColor: "#0d0d0d" }}
        >
          <p className="font-mono uppercase tracking-wide mb-4" style={{ fontSize: 8.5, color: "rgba(240,240,238,0.25)" }}>
            AI Sales Narrative
          </p>
          <Typewriter text={result.ai_narrative} />
        </div>
      )}

      {/* Sticky action bar */}
      <div
        className="fixed bottom-0 left-0 right-0 md:left-60 h-16 flex items-center justify-center gap-3 border-t border-[rgba(255,255,255,0.07)] z-40 px-5"
        style={{ backgroundColor: "#080808" }}
      >
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 h-10 px-6 rounded-[100px] font-mono text-[10px] uppercase tracking-widest transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
          style={{
            backgroundColor: "#f0f0ee",
            color: "#080808",
            boxShadow: "0px 1.5px 2px -1px hsla(0,0%,100%,.2) inset, 0px 1.5px 1px 0px hsla(0,0%,100%,.06)",
          }}
        >
          <Copy className="w-3.5 h-3.5" />
          Copy Report
        </button>
        <button
          onClick={() => { setResult(null); setState("input"); }}
          className="inline-flex items-center gap-2 h-10 px-6 rounded-[100px] font-mono text-[10px] uppercase tracking-widest border transition-all duration-200 hover:bg-[rgba(255,255,255,0.05)]"
          style={{ borderColor: "rgba(255,255,255,0.13)", color: "rgba(240,240,238,0.45)" }}
        >
          <Plus className="w-3.5 h-3.5" />
          New Proof
        </button>
      </div>
    </div>
  );
};

export default NewProof;
