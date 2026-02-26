import { useState, useEffect } from "react";

const narrativeText =
  "This domain shows a 12-position ranking decline over the last 30 days. " +
  "Backlink profile is weak with only 23 referring domains. " +
  "Google AI Overview has captured 34% of organic traffic for the primary keyword.";

const ProductDemo = () => {
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.4 }
    );
    const el = document.getElementById("product-demo-section");
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTyped(narrativeText.slice(0, i));
      if (i >= narrativeText.length) clearInterval(interval);
    }, 25);
    return () => clearInterval(interval);
  }, [started]);

  return (
    <section id="product-demo-section" className="landing-section">
      <p className="section-label">Instant Proof Engine</p>
      <h2 className="font-headline text-3xl sm:text-4xl mb-4 tracking-tight" style={{ color: "var(--text)" }}>
        30 seconds. One domain.{" "}
        <span className="italic" style={{ color: "var(--text-dim)" }}>
          One proof they can't ignore.
        </span>
      </h2>
      <p className="font-body text-sm mb-12 max-w-[520px]" style={{ color: "var(--text-dim)" }}>
        The power dynamic shifts: you walk in as the one delivering the verdict, not asking for permission.
      </p>

      {/* Mock dashboard */}
      <div className="product-flagship max-w-[800px] mx-auto">
        <span className="corner-dot tl" />
        <span className="corner-dot tr" />
        <span className="corner-dot bl" />
        <span className="corner-dot br" />

        {/* Mock header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--accent-danger)" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--accent-success)" }} />
          <span className="font-mono text-[10px] ml-2" style={{ color: "var(--text-muted)" }}>
            competitor-domain.com — Proof Report
          </span>
        </div>

        {/* Score + Narrative */}
        <div className="grid sm:grid-cols-[140px_1fr] gap-8">
          {/* Gauge */}
          <div className="flex flex-col items-center gap-2">
            <div className="proof-score-gauge">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
                <circle
                  cx="60" cy="60" r="45" fill="none"
                  stroke="var(--accent-danger)" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset={started ? "218" : "283"}
                  transform="rotate(-90 60 60)"
                  style={{ transition: "stroke-dashoffset 1.2s var(--ease-circ-out)" }}
                />
              </svg>
              <span className="absolute font-mono text-2xl font-bold" style={{ color: "var(--accent-danger)" }}>
                23
              </span>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Proof Score
            </span>
          </div>

          {/* Narrative */}
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest mb-3" style={{ color: "var(--accent)" }}>
              Closing Narrative
            </p>
            <p className="font-body text-sm leading-relaxed" style={{ color: "var(--text-dim)", minHeight: 80 }}>
              {typed}
              {typed.length < narrativeText.length && <span className="typing-animation" />}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDemo;
