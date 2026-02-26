import { useStarfield } from "@/hooks/useStarfield";
import ProofScoreWidget from "@/components/sections/ProofScoreWidget";
import { Database, Eye, Palette, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const trustBadges = [
  { icon: Database, label: "DataForSEO-powered" },
  { icon: Eye, label: "AI Overview impact" },
  { icon: Palette, label: "White-label ready" },
  { icon: Globe, label: "Domain integration" },
];

const statsData = [
  { target: 23847, prefix: "", suffix: "", format: true, label: "Proofs Generated" },
  { target: 30, prefix: "< ", suffix: "s", format: false, label: "Avg Proof Time" },
  { target: 0, prefix: "", suffix: "", format: false, label: "Permissions Required" },
  { target: 4.2, prefix: "$", suffix: "M", format: false, label: "Deals Closed" },
];

function useCountUp(target: number, shouldStart: boolean, duration = 1800) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!shouldStart) return;
    if (target === 0) { setValue(0); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [shouldStart, target, duration]);

  return value;
}

function CountUpStat({ stat, delay = 0 }: { stat: typeof statsData[number]; delay?: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer: ReturnType<typeof setTimeout>;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { timer = setTimeout(() => setVisible(true), delay); obs.disconnect(); } }, { threshold: 0.5 });
    obs.observe(el);
    return () => { obs.disconnect(); clearTimeout(timer); };
  }, [delay]);

  const animated = useCountUp(stat.target, visible);
  const display = stat.target === 0
    ? "0"
    : stat.format
      ? `${stat.prefix}${Math.round(animated).toLocaleString()}${stat.suffix}`
      : `${stat.prefix}${stat.target % 1 !== 0 ? animated.toFixed(1) : Math.round(animated)}${stat.suffix}`;

  return (
    <div ref={ref} className="flex flex-col items-center gap-1 px-4 py-1 rounded-lg transition-colors duration-300 hover:bg-[rgba(255,255,255,0.04)] cursor-default">
      <span className="font-mono text-lg font-bold" style={{ color: "var(--text)" }}>
        {display}
      </span>
      <span className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--text-muted)" }}>
        {stat.label}
      </span>
    </div>
  );
}

const Hero = () => {
  const canvasRef = useStarfield();

  return (
    <section className="hero">
      <canvas ref={canvasRef} className="hero-canvas" />
      <div className="hero-bg" />
      <div className="hero-grid" />

      <div className="relative z-10 flex flex-col items-center text-center px-5 pb-20">
        <div className="max-w-[900px] mx-auto flex flex-col items-center">
          {/* Eyebrow */}
          <div className="hero-eyebrow">
            <span>Sales Proof Intelligence</span>
          </div>

          {/* H1 */}
          <h1 className="hero-headline" style={{ fontSize: "clamp(36px, 6vw, 80px)", lineHeight: 1.05 }}>
            Prospek bilang pikir-pikir dulu.
            <br />
            <em>Karena kamu belum punya bukti.</em>
          </h1>

          {/* H2 */}
          <p
            className="mt-7 font-body font-light max-w-[560px]"
            style={{ fontSize: 15, color: "var(--text-dim)", lineHeight: 1.65 }}
          >
            VEXLO menghasilkan visual proof kerentanan SEO prospek dalam &lt;30 detik
            — tanpa GA4, tanpa GSC, tanpa meminta izin siapapun.
          </p>

          {/* Proof Score Widget */}
          <div className="mt-10 w-full">
            <ProofScoreWidget />
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            {trustBadges.map((b) => (
              <div
                key={b.label}
                className="inline-flex items-center gap-1.5 rounded-[100px] font-mono uppercase"
                style={{
                  fontSize: "8.5px",
                  letterSpacing: "0.14em",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border)",
                  padding: "4px 10px",
                }}
              >
                <b.icon className="w-3 h-3" />
                {b.label}
              </div>
            ))}
          </div>

          {/* Colossus-style stats strip */}
          {/* Colossus-style stats strip */}
          <div className="mt-8 flex flex-wrap sm:flex-nowrap items-center justify-center w-full max-w-[480px]">
            {statsData.map((stat, i) => (
              <div key={stat.label} className="flex items-center">
                <CountUpStat stat={stat} delay={i * 150} />
                {i < 3 && (
                  <div
                    className="hidden sm:block h-8 w-px"
                    style={{ background: "var(--border-strong)" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
