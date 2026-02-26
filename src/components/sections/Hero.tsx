import { useStarfield } from "@/hooks/useStarfield";
import ProofScoreWidget from "@/components/sections/ProofScoreWidget";
import { Database, Eye, Palette, Globe } from "lucide-react";

const trustBadges = [
  { icon: Database, label: "DataForSEO-powered" },
  { icon: Eye, label: "AI Overview impact" },
  { icon: Palette, label: "White-label ready" },
  { icon: Globe, label: "Domain integration" },
];

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
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-[480px]">
            {[
              { value: "23,847", label: "Proofs Generated" },
              { value: "< 30s", label: "Avg Proof Time" },
              { value: "0", label: "Permissions Required" },
              { value: "$4.2M", label: "Deals Closed" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <span className="font-mono text-lg font-bold" style={{ color: "var(--text)" }}>
                  {stat.value}
                </span>
                <span
                  className="font-mono text-[9px] uppercase tracking-[0.14em]"
                  style={{ color: "var(--text-muted)" }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
