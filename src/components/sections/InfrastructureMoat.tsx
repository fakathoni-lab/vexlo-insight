const InfrastructureMoat = () => {
  return (
    <section className="landing-section">
      <p className="section-label">Infrastructure</p>
      <h2 className="font-headline text-3xl sm:text-4xl mb-6 tracking-tight" style={{ color: "var(--text)" }}>
        Infrastructure, not a tool.{" "}
        <span className="italic" style={{ color: "var(--text-dim)" }}>
          Hard to walk away from.
        </span>
      </h2>
      <p className="font-body text-sm leading-relaxed max-w-[560px] mb-16" style={{ color: "var(--text-dim)" }}>
        Client domains that live in VEXLO. A pitch archive that grows in value every month.
        Agency brand identity shaped here. This isn't a tool you use and forget.
      </p>

      <div className="grid sm:grid-cols-3 gap-6">
        {[
          { metric: "+60%", label: "LTV Uplift", desc: "Agency Pro users who activate domain integration." },
          { metric: "4.2x", label: "Pitch Archive Value", desc: "Archive value grows every month — the longer you stay, the harder it is to leave." },
          { metric: "< 3%", label: "Churn Rate", desc: "For users with 3+ active domains on the platform." },
        ].map((item) => (
          <div key={item.label} className="product-flagship text-center">
            <span className="corner-dot tl" />
            <span className="corner-dot tr" />
            <span className="corner-dot bl" />
            <span className="corner-dot br" />
            <p className="font-mono text-4xl font-bold mb-2" style={{ color: "var(--accent-proof)" }}>
              {item.metric}
            </p>
            <p className="font-headline text-lg mb-2" style={{ color: "var(--text)" }}>
              {item.label}
            </p>
            <p className="font-body text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default InfrastructureMoat;
