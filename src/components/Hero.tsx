const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-10 max-sm:px-5 overflow-hidden">
      {/* CSS grid background pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] opacity-15 blur-[120px] pointer-events-none"
        style={{ background: "hsl(var(--accent))" }}
      />

      <div className="relative z-10 max-w-[800px] w-full text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 border border-border rounded-full text-xs font-mono tracking-wide text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
          No access permissions required
        </div>

        <h1
          className="font-headline leading-[1.05] mb-6 tracking-tight"
          style={{ fontSize: "clamp(40px, 8vw, 96px)" }}
        >
          Close more calls with{" "}
          <span className="text-accent italic">visual proof</span>
        </h1>

        <p className="text-muted-foreground text-lg sm:text-xl max-w-[560px] mx-auto mb-12 leading-relaxed font-body">
          Generate shareable SEO proof reports in under 30 seconds. No logins, no permissions, no awkward screen shares.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#cta"
            className="h-12 px-8 inline-flex items-center bg-accent text-accent-foreground font-mono text-xs uppercase tracking-widest rounded-button hover:brightness-110 active:scale-[0.98] transition-all duration-200"
          >
            Get Early Access
          </a>
          <a
            href="#demo"
            className="h-12 px-8 inline-flex items-center border border-accent/25 text-accent font-mono text-xs uppercase tracking-widest rounded-button hover:bg-accent/[0.08] transition-all duration-200"
          >
            See Demo
          </a>
        </div>

        <div className="mt-8 inline-flex items-center gap-2 text-muted-foreground text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-accent inline-block animate-pulse" />
          17 Founding Members Joined
        </div>
      </div>
    </section>
  );
};

export default Hero;
