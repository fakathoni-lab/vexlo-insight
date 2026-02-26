const steps = [
  {
    label: "01 — INPUT",
    title: "Enter any prospect domain + keyword",
    body: "No logins. No API keys. No access requests. Public data only.",
  },
  {
    label: "02 — GENERATE",
    title: "VEXLO builds the proof report",
    body: "Ranking position, 30-day trend, AI Overview coverage, Proof Score 0–100. Branded with your identity.",
  },
  {
    label: "03 — CLOSE",
    title: "Share. Present. Win.",
    body: "One link. One PDF. Decisive visual proof. The prospect sees data — not a pitch.",
  },
];

const HowItWorks = () => {
  return (
    <section
      className="border-b border-[rgba(255,255,255,0.07)]"
      style={{ padding: "100px 40px" }}
    >
      <div className="max-w-[1280px] mx-auto">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-12" style={{ color: "var(--accent)" }}>
          <span className="block w-7 h-px" style={{ backgroundColor: "var(--accent)" }} />
          <span className="font-mono uppercase tracking-[0.18em]" style={{ fontSize: 10 }}>
            How It Works
          </span>
        </div>

        {/* Headline */}
        <h2
          className="font-headline mb-16 max-w-[700px]"
          style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1, color: "#f0f0ee" }}
        >
          Proof in under 60 seconds.{" "}
          <span className="italic" style={{ color: "var(--text-dim)" }}>
            Before the call ends.
          </span>
        </h2>

        {/* 3-step horizontal grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px">
          {steps.map((step) => (
            <div
              key={step.label}
              className="rounded-[12px] border border-[rgba(255,255,255,0.07)] transition-[border-color] duration-[250ms] hover:border-[rgba(255,255,255,0.13)]"
              style={{ padding: 32, backgroundColor: "#0d0d0d" }}
            >
              <span
                className="block font-mono uppercase tracking-wide mb-4"
                style={{ fontSize: 8.5, color: "var(--accent)" }}
              >
                {step.label}
              </span>
              <p className="font-body font-normal mb-2" style={{ fontSize: 15, color: "#f0f0ee" }}>
                {step.title}
              </p>
              <p
                className="font-body font-light"
                style={{ fontSize: 13, lineHeight: 1.65, color: "var(--text-dim)" }}
              >
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
