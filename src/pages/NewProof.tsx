import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Check, Copy, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

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

// ── Mock data ──
const mockResult = {
  domain: "",
  keyword: "",
  score: 73,
  currentRank: 14,
  delta30: -6,
  aiOverview: true,
  rankings: [
    { keyword: "best plumber london", position: 14 },
    { keyword: "emergency plumber near me", position: 8 },
    { keyword: "plumber reviews london", position: 22 },
    { keyword: "affordable plumbing services", position: 5 },
    { keyword: "24 hour plumber", position: 11 },
    { keyword: "boiler repair london", position: 3 },
    { keyword: "pipe leak repair", position: 17 },
    { keyword: "drain cleaning service", position: 2 },
    { keyword: "bathroom plumber london", position: 9 },
    { keyword: "commercial plumbing uk", position: 31 },
    { keyword: "gas safe plumber", position: 7 },
    { keyword: "plumber cost estimate", position: 19 },
    { keyword: "blocked drain london", position: 1 },
    { keyword: "heating engineer near me", position: 12 },
    { keyword: "tap repair service", position: 25 },
    { keyword: "water heater installation", position: 42 },
  ],
  narrative: "",
};

const narrativeText = `Based on our analysis, this domain has strong local SEO foundations but is leaving significant organic traffic on the table. They currently rank on page 2 for their primary keyword, missing out on an estimated 840 monthly clicks. Their competitors are capturing featured snippets and AI overviews that this site hasn't optimized for. With targeted on-page optimization and content gap analysis, there's a clear path to page 1 within 60-90 days. The data shows they're losing approximately $4,200/month in potential revenue from organic search alone.`;

type State = "input" | "loading" | "result";

const loadingSteps = [
  "Fetching Rankings",
  "Analyzing SERP Features",
  "Calculating Proof Score",
  "Generating Sales Narrative",
];

// ── Score Ring SVG ──
const ScoreRing = ({ score, size = 80 }: { score: number; size?: number }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (animatedScore / 100) * circ;
  const color = score <= 30 ? "#ef4444" : score <= 60 ? "#f59e0b" : "#22c55e";

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 1200;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setAnimatedScore(Math.round(progress * score));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={4} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.1s linear" }}
        />
      </svg>
      <span className="absolute font-headline" style={{ fontSize: 22, color }}>
        {animatedScore}
      </span>
    </div>
  );
};

// ── Ranking Bar ──
const RankBar = ({ keyword, position }: { keyword: string; position: number }) => {
  const maxPos = 50;
  const width = Math.max(5, 100 - (position / maxPos) * 100);
  const color = position <= 3 ? "#22c55e" : position <= 10 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex items-center gap-3">
      <span
        className="w-[180px] shrink-0 truncate font-body font-light text-right"
        style={{ fontSize: 11, color: "rgba(240,240,238,0.45)" }}
      >
        {keyword}
      </span>
      <div className="flex-1 h-5 rounded-[4px] overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
        <div
          className="h-full rounded-[4px] flex items-center justify-end pr-2 transition-all duration-700"
          style={{ width: `${width}%`, backgroundColor: color }}
        >
          <span className="font-mono text-[9px]" style={{ color: "#080808" }}>
            #{position}
          </span>
        </div>
      </div>
    </div>
  );
};

// ── Typewriter ──
const Typewriter = ({ text }: { text: string }) => {
  const [displayed, setDisplayed] = useState("");
  const idx = useRef(0);

  useEffect(() => {
    idx.current = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      idx.current++;
      setDisplayed(text.slice(0, idx.current));
      if (idx.current >= text.length) clearInterval(interval);
    }, 18);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <p className="font-body font-light leading-relaxed" style={{ fontSize: 14, color: "rgba(240,240,238,0.7)" }}>
      {displayed}
      {displayed.length < text.length && (
        <span className="inline-block w-0.5 h-4 ml-0.5 animate-pulse" style={{ backgroundColor: "#ff6308" }} />
      )}
    </p>
  );
};

// ── Main Component ──
const NewProof = () => {
  const [state, setState] = useState<State>("input");
  const [activeStep, setActiveStep] = useState(0);
  const [result, setResult] = useState(mockResult);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    setResult({ ...mockResult, domain: data.domain, keyword: data.keyword, narrative: narrativeText });
    setState("loading");
    setActiveStep(0);

    // Simulate progressive loading
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= loadingSteps.length) {
        clearInterval(interval);
        setTimeout(() => setState("result"), 800);
      }
      setActiveStep(step);
    }, 2000);
  };

  const handleCopy = () => {
    const text = `Proof Report: ${result.domain}\nKeyword: ${result.keyword}\nScore: ${result.score}/100\nCurrent Rank: #${result.currentRank}\n30-Day Delta: ${result.delta30}\nAI Overview: ${result.aiOverview ? "Yes" : "No"}\n\n${narrativeText}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Report copied to clipboard." });
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
                className="h-10 bg-[#080808] border-[rgba(255,255,255,0.07)] text-[#f0f0ee] placeholder:text-[rgba(240,240,238,0.25)] font-body text-sm rounded-[4px] focus-visible:ring-[hsl(22,100%,52%)] focus-visible:ring-1 focus-visible:ring-offset-0"
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
                className="h-10 bg-[#080808] border-[rgba(255,255,255,0.07)] text-[#f0f0ee] placeholder:text-[rgba(240,240,238,0.25)] font-body text-sm rounded-[4px] focus-visible:ring-[hsl(22,100%,52%)] focus-visible:ring-1 focus-visible:ring-offset-0"
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
                      <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#ff6308" }} />
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
            Keyword: {result.keyword}
          </p>
        </div>
        <ScoreRing score={result.score} />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Current Rank", value: `#${result.currentRank}` },
          { label: "30-Day Delta", value: `${result.delta30 > 0 ? "+" : ""}${result.delta30}` },
          { label: "AI Overview", value: result.aiOverview ? "Yes" : "No" },
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
      <div
        className="rounded-[12px] border border-[rgba(255,255,255,0.07)] p-8"
        style={{ backgroundColor: "#0d0d0d" }}
      >
        <p className="font-mono uppercase tracking-wide mb-6" style={{ fontSize: 8.5, color: "rgba(240,240,238,0.25)" }}>
          Keyword Rankings
        </p>
        <div className="flex flex-col gap-2">
          {result.rankings.map((r) => (
            <RankBar key={r.keyword} keyword={r.keyword} position={r.position} />
          ))}
        </div>
      </div>

      {/* AI Narrative */}
      <div
        className="rounded-[12px] border border-[rgba(255,255,255,0.07)] p-8"
        style={{ backgroundColor: "#0d0d0d" }}
      >
        <p className="font-mono uppercase tracking-wide mb-4" style={{ fontSize: 8.5, color: "rgba(240,240,238,0.25)" }}>
          AI Sales Narrative
        </p>
        <Typewriter text={result.narrative} />
      </div>

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
          onClick={() => setState("input")}
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
