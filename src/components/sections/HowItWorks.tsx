const steps = [
  {
    number: "01",
    title: "Enter any domain",
    body: "Drop in your prospect's website URL and a target keyword. No login credentials, no access requests, no friction.",
  },
  {
    number: "02",
    title: "We generate the proof",
    body: "VEXLO pulls real-time SEO signals — rankings, technical issues, content gaps — and assembles a visual proof report in under 30 seconds.",
  },
  {
    number: "03",
    title: "Share & close the deal",
    body: "Send a branded, shareable report link. Your prospect sees exactly what's broken — and why you're the one to fix it.",
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
        <div className="flex items-center gap-3 mb-12" style={{ color: "hsl(22,100%,52%)" }}>
          <span className="block w-7 h-px" style={{ backgroundColor: "hsl(22,100%,52%)" }} />
          <span className="font-mono uppercase tracking-[0.18em]" style={{ fontSize: 10 }}>
            How It Works
          </span>
        </div>

        {/* Headline */}
        <h2
          className="font-headline mb-16 max-w-[700px]"
          style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1, color: "#f0f0ee" }}
        >
          Three steps to{" "}
          <span className="italic" style={{ color: "rgba(240,240,238,0.42)" }}>
            undeniable proof.
          </span>
        </h2>

        {/* 3-step horizontal grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-[12px] border border-[rgba(255,255,255,0.07)] transition-[border-color] duration-[250ms] hover:border-[rgba(255,255,255,0.13)]"
              style={{ padding: 32, backgroundColor: "#0d0d0d" }}
            >
              <span
                className="block font-mono uppercase tracking-wide mb-4"
                style={{ fontSize: 8.5, color: "hsl(22,100%,52%)" }}
              >
                Step {step.number}
              </span>
              <p className="font-body font-normal mb-2" style={{ fontSize: 15, color: "#f0f0ee" }}>
                {step.title}
              </p>
              <p
                className="font-body font-light"
                style={{ fontSize: 13, lineHeight: 1.65, color: "rgba(240,240,238,0.45)" }}
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
