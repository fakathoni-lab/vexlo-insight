import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const ProofScoreWidget = () => {
  const { t } = useTranslation();
  const [domain, setDomain] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [score, setScore] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;
    setState("loading");
    setScore(0);
  };

  useEffect(() => {
    if (state !== "loading") return;
    const timer = setTimeout(() => {
      setState("done");
      let current = 0;
      const interval = setInterval(() => {
        current += 1;
        setScore(current);
        if (current >= 23) clearInterval(interval);
      }, 40);
    }, 2000);
    return () => clearTimeout(timer);
  }, [state]);

  const gaugeRadius = 45;
  const circumference = 2 * Math.PI * gaugeRadius;
  const progress = (score / 100) * circumference;
  const dashOffset = circumference - progress;

  const getScoreColor = () => {
    if (score <= 30) return "var(--accent-danger)";
    if (score <= 60) return "var(--accent)";
    return "var(--accent-success)";
  };

  return (
    <div className="w-full max-w-[560px] mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <Input
          type="text"
          placeholder={t('proof_score.widget_placeholder')}
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="h-12 pl-4 pr-40 rounded-[100px] font-body text-sm border bg-[var(--bg-raised)]"
          style={{ borderColor: "var(--border-strong)", color: "var(--text)" }}
        />
        <button type="submit" className="btn-primary absolute right-1.5 top-1/2 -translate-y-1/2" style={{ height: 36, fontSize: 9, padding: "0 18px" }}>
          <Search className="w-3.5 h-3.5 mr-1.5" />
          {t('proof_score.widget_btn')}
        </button>
      </form>

      {state === "loading" && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--accent)", animation: "orb-pulse 1.2s ease-in-out infinite" }} />
          <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>{t('proof_score.widget_generating')}</p>
        </div>
      )}

      {state === "done" && (
        <div className="mt-8 flex flex-col items-center gap-4 fade-up">
          <div className="proof-score-gauge">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r={gaugeRadius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
              <circle cx="60" cy="60" r={gaugeRadius} fill="none" stroke={getScoreColor()} strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset} transform="rotate(-90 60 60)" style={{ transition: "stroke-dashoffset 0.8s var(--ease-circ-out)" }} />
            </svg>
            <span className="absolute font-mono text-3xl font-bold" style={{ color: getScoreColor() }}>{score}</span>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--accent-danger)" }}>
            {t('proof_score.widget_result', { score, remaining: 100 - score })}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProofScoreWidget;
