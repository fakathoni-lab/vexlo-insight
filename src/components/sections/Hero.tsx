import { useStarfield } from "@/hooks/useStarfield";

const Hero = () => {
  const canvasRef = useStarfield(100);

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="hero">
      {/* Layer 1: Canvas starfield */}
      <canvas ref={canvasRef} className="hero-canvas" />

      {/* Layer 2: Radial gradient */}
      <div className="hero-bg" />

      {/* Layer 3: Grid overlay */}
      <div className="hero-grid" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-5 pb-20">
        <div className="max-w-[900px] mx-auto flex flex-col items-center">
          {/* Eyebrow */}
          <div className="hero-eyebrow">
            <span>Sales Proof Intelligence</span>
          </div>

          {/* H1 */}
          <h1 className="hero-headline">
            Close More Clients.
            <br />
            <em>with proof they can't ignore.</em>
          </h1>

          {/* Subheadline */}
          <p
            className="mt-7 font-body font-light max-w-[520px]"
            style={{
              fontSize: 15,
              color: "rgba(240,240,238,0.45)",
              lineHeight: 1.65,
            }}
          >
            Generate a visual SEO proof report for any prospect in 30 seconds.
            <br />
            No access required. No awkward asks. Just close.
          </p>

          {/* CTA row */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-10">
            <button onClick={() => scrollTo("#cta")} className="btn-primary">
              Get Early Access — Free
            </button>
            <button onClick={() => scrollTo("#how")} className="btn-ghost">
              See How It Works
            </button>
          </div>

          {/* Social proof badge */}
          <div
            className="mt-8 inline-flex items-center rounded-[100px] font-mono uppercase"
            style={{
              fontSize: "8.5px",
              letterSpacing: "0.16em",
              color: "hsl(22, 100%, 52%)",
              border: "1px solid rgba(255,99,8,0.3)",
              padding: "3px 9px",
            }}
          >
            17 Founding Members Joined
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
