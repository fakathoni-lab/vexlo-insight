const segments = [
  {
    tier: "Freelancer SEO",
    persona: "Sam",
    desc: "2–6 clients. Look more professional than an agency.",
    pain: "Pitching without proof. Losing to bigger agencies.",
    price: "From $39/mo",
    cta: "Get Started",
    href: "#waitlist",
    highlight: false,
  },
  {
    tier: "Boutique Agency",
    persona: "Alex",
    desc: "5–15 clients. Close rate <25%. Leaking pipeline.",
    pain: "Need a weapon for discovery calls that close.",
    price: "From $79/mo",
    cta: "Get Started",
    href: "#waitlist",
    highlight: true,
  },
  {
    tier: "Agency Elite",
    persona: "Enterprise",
    desc: "5+ seats. White-label. Domain ecosystem.",
    pain: "Need infrastructure, not a tool that gets abandoned.",
    price: "Custom",
    cta: "Contact Sales",
    href: "#waitlist",
    highlight: false,
  },
];

const SegmentSelector = () => {
  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="landing-section">
      <p className="section-label">Choose Your Path</p>
      <h2 className="font-headline text-3xl sm:text-4xl mb-16 tracking-tight" style={{ color: "var(--text)" }}>
        One platform.{" "}
        <span className="italic" style={{ color: "var(--text-dim)" }}>Three paths to win.</span>
      </h2>

      <div className="grid sm:grid-cols-3 gap-6">
        {segments.map((seg) => (
          <div
            key={seg.tier}
            className="product-flagship flex flex-col"
            style={{
              border: seg.highlight
                ? "1px solid var(--accent-purple-border)"
                : "1px solid var(--border)",
            }}
          >
            <span className="corner-dot tl" />
            <span className="corner-dot tr" />
            <span className="corner-dot bl" />
            <span className="corner-dot br" />

            {seg.highlight && (
              <span
                className="inline-block mb-4 px-3 py-1 text-[8px] font-mono uppercase tracking-widest rounded-full self-start"
                style={{ backgroundColor: "var(--accent)", color: "#fff" }}
              >
                Most Popular
              </span>
            )}

            <h3 className="font-headline text-xl mb-1" style={{ color: "var(--text)" }}>
              {seg.tier}
            </h3>
            <p className="font-mono text-[9px] uppercase tracking-widest mb-4" style={{ color: "var(--accent)" }}>
              Persona: {seg.persona}
            </p>
            <p className="font-body text-sm mb-2 leading-relaxed" style={{ color: "var(--text-dim)" }}>
              {seg.desc}
            </p>
            <p className="font-body text-sm mb-6 leading-relaxed flex-1" style={{ color: "var(--text-muted)" }}>
              {seg.pain}
            </p>

            <div>
              <p className="font-headline text-2xl mb-4" style={{ color: "var(--text)" }}>{seg.price}</p>
              <button
                onClick={() => scrollTo(seg.href)}
                className={seg.highlight ? "btn-primary w-full" : "btn-ghost w-full"}
              >
                {seg.cta}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SegmentSelector;
