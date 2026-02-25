import { useEffect, useRef } from "react";

const Hero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const stars: { x: number; y: number; phase: number; speed: number }[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const init = () => {
      stars.length = 0;
      for (let i = 0; i < 100; i++) {
        stars.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          phase: Math.random() * Math.PI * 2,
          speed: 0.3 + Math.random() * 0.7,
        });
      }
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      for (const star of stars) {
        const alpha =
          0.12 + 0.2 * (0.5 + 0.5 * Math.sin(time * 0.001 * star.speed + star.phase));
        ctx.beginPath();
        ctx.arc(star.x, star.y, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240,240,238,${alpha})`;
        ctx.fill();
      }
      animationId = requestAnimationFrame(draw);
    };

    resize();
    init();
    animationId = requestAnimationFrame(draw);

    window.addEventListener("resize", () => {
      resize();
      init();
    });

    return () => cancelAnimationFrame(animationId);
  }, []);

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative border-b border-[rgba(255,255,255,0.07)] overflow-hidden"
      style={{ minHeight: "100svh", paddingTop: 128 }}
    >
      {/* Layer 1: Canvas starfield */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: "none" }}
      />

      {/* Layer 2: Radial gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(255,99,8,0.08), transparent)",
        }}
      />

      {/* Layer 3: Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse 90% 90% at 50% 50%, black 20%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 90% at 50% 50%, black 20%, transparent 75%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-5 pb-20">
        <div className="max-w-[900px] mx-auto flex flex-col items-center">
          {/* Eyebrow */}
          <div
            className="flex items-center gap-3 mb-8"
            style={{ color: "hsl(22, 100%, 52%)" }}
          >
            <span
              className="block w-7 h-px"
              style={{ backgroundColor: "hsl(22, 100%, 52%)" }}
            />
            <span
              className="font-mono uppercase tracking-[0.18em]"
              style={{ fontSize: "10px" }}
            >
              Sales Proof Intelligence
            </span>
          </div>

          {/* H1 */}
          <h1
            className="font-headline"
            style={{
              fontSize: "clamp(52px, 8.5vw, 120px)",
              lineHeight: 0.93,
              letterSpacing: "-0.025em",
              color: "#f0f0ee",
            }}
          >
            Close More Clients.
            <br />
            <span className="italic" style={{ color: "rgba(240,240,238,0.42)" }}>
              with proof they can't ignore.
            </span>
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
            <button
              onClick={() => scrollTo("#cta")}
              className="inline-flex items-center justify-center h-10 px-6 rounded-[100px] font-mono uppercase tracking-widest transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
              style={{
                fontSize: 10,
                backgroundColor: "#f0f0ee",
                color: "#080808",
                boxShadow:
                  "0px 1.5px 2px -1px hsla(0,0%,100%,.2) inset, 0px 1.5px 1px 0px hsla(0,0%,100%,.06)",
              }}
            >
              Get Early Access — Free
            </button>
            <button
              onClick={() => scrollTo("#how")}
              className="inline-flex items-center justify-center h-10 px-6 rounded-[100px] font-mono uppercase tracking-widest border transition-all duration-200 hover:bg-[rgba(255,255,255,0.05)]"
              style={{
                fontSize: 10,
                borderColor: "rgba(255,255,255,0.13)",
                color: "rgba(240,240,238,0.45)",
                backgroundColor: "transparent",
              }}
            >
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
