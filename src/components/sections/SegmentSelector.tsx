const segments = [
  {
    tier: "Freelancer SEO",
    persona: "Sam",
    desc: "2–6 klien. Terlihat lebih profesional dari agency.",
    pain: "Pitch tanpa bukti. Kalah dari agency yang lebih besar.",
    price: "Mulai $39/bln",
    cta: "Mulai Sekarang",
    href: "#waitlist",
    highlight: false,
  },
  {
    tier: "Boutique Agency",
    persona: "Alex",
    desc: "5–15 klien. Close rate <25%. Pipeline bocor.",
    pain: "Butuh senjata untuk discovery call yang mematikan.",
    price: "Mulai $79/bln",
    cta: "Mulai Sekarang",
    href: "#waitlist",
    highlight: true,
  },
  {
    tier: "Agency Elite",
    persona: "Enterprise",
    desc: "5+ seats. White-label. Domain ecosystem.",
    pain: "Butuh infrastruktur, bukan tool yang dipakai lalu ditinggalkan.",
    price: "Custom",
    cta: "Hubungi Sales",
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
      <p className="section-label">Pilih Jalurmu</p>
      <h2 className="font-headline text-3xl sm:text-4xl mb-16 tracking-tight" style={{ color: "var(--text)" }}>
        Satu platform.{" "}
        <span className="italic" style={{ color: "var(--text-dim)" }}>Tiga jalur menang.</span>
      </h2>

      <div className="grid sm:grid-cols-3 gap-6">
        {segments.map((seg) => (
          <div
            key={seg.tier}
            className="product-flagship flex flex-col"
            style={{
              border: seg.highlight
                ? "1px solid rgba(124,58,237,0.4)"
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
