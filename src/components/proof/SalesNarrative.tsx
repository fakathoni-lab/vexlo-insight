import { useState, useEffect, useRef } from "react";
import { Copy, Check } from "lucide-react";

interface SalesNarrativeProps {
  narrative: string | null;
}

const SalesNarrative = ({ narrative }: SalesNarrativeProps) => {
  const [copied, setCopied] = useState(false);
  const [revealWidth, setRevealWidth] = useState(0);
  const textRef = useRef<HTMLParagraphElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    if (!narrative || animatedRef.current) return;
    animatedRef.current = true;

    const start = performance.now();
    const duration = 2000;
    let frame: number;

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setRevealWidth(progress * 100);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [narrative]);

  const handleCopy = async () => {
    if (!narrative) return;
    try {
      await navigator.clipboard.writeText(narrative);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silently fail
    }
  };

  // Skeleton loading when narrative is null
  if (!narrative) {
    return (
      <div
        className="rounded-xl p-6"
        style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <p
          className="font-mono uppercase tracking-widest mb-4"
          style={{ fontSize: 10, color: "var(--text-muted)" }}
        >
          Sales Narrative
        </p>
        <div className="space-y-3">
          <div className="h-4 rounded animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.05)", width: "100%" }} />
          <div className="h-4 rounded animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.05)", width: "85%" }} />
          <div className="h-4 rounded animate-pulse" style={{ backgroundColor: "rgba(255,255,255,0.05)", width: "70%" }} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--accent-border)",
        boxShadow: "0 0 30px rgba(255,99,8,0.06)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <p
          className="font-mono uppercase tracking-widest"
          style={{ fontSize: 10, color: "var(--accent-light)" }}
        >
          Sales Narrative
        </p>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest rounded-full px-3 py-1.5 transition-all duration-200 hover:bg-[rgba(255,255,255,0.05)]"
          style={{
            color: copied ? "#22c55e" : "var(--text-dim)",
            border: "1px solid var(--border)",
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <p
        ref={textRef}
        className="font-body font-light leading-relaxed"
        style={{
          fontSize: 14,
          color: "rgba(240,240,238,0.7)",
          clipPath: `inset(0 ${100 - revealWidth}% 0 0)`,
        }}
      >
        {narrative}
      </p>
    </div>
  );
};

export default SalesNarrative;
