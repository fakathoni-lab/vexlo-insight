const painCards = [
  {
    tag: "Time Sink",
    title: "45 minutes of manual work — per prospect",
    body: "Screenshots, exports, audit PDFs. All handcrafted. Not scalable. Not consistent. Not fast enough.",
  },
  {
    tag: "Trust Killer",
    title: "Requesting access signals doubt",
    body: "Asking for GSC or GA4 access before trust is built hands control to the prospect before the deal is closed.",
  },
  {
    tag: "Lost Deal",
    title: "You look solo. The deal goes to the agency.",
    body: "Perception gap kills deals. Skill without branded proof reads as amateur — regardless of your actual capability.",
  },
];

const Problem = () => {
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
            The Revenue Gap
          </span>
        </div>

        {/* 2-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* LEFT */}
          <div>
            <h2
              className="font-headline"
              style={{
                fontSize: "clamp(36px, 5vw, 64px)",
                lineHeight: 1,
                color: "#f0f0ee",
              }}
            >
              Skill doesn't close deals. Proof does.
              <br />
              <span className="italic" style={{ color: "var(--text-dim)" }}>
                And you don't have it fast enough.
              </span>
            </h2>
            <p
              className="mt-6 font-body font-light max-w-[480px]"
              style={{
                fontSize: 13.5,
                lineHeight: 1.75,
                color: "var(--text-dim)",
              }}
            >
              Every SEO freelancer who lost a deal this month lost it before the proposal. Not after.
              The closing gap is a proof gap.
            </p>
          </div>

          {/* RIGHT — pain cards */}
          <div className="flex flex-col gap-px">
            {painCards.map((card) => (
              <div
                key={card.tag}
                className="rounded-[12px] border border-[rgba(255,255,255,0.07)] transition-[border-color] duration-[250ms] hover:border-[rgba(255,255,255,0.13)]"
                style={{ padding: 32, backgroundColor: "#0d0d0d" }}
              >
                <span
                  className="block font-mono uppercase tracking-wide mb-2"
                  style={{ fontSize: 8.5, color: "var(--text-muted)" }}
                >
                  {card.tag}
                </span>
                <p
                  className="font-body font-normal mb-1.5"
                  style={{ fontSize: 15, color: "#f0f0ee" }}
                >
                  {card.title}
                </p>
                <p
                  className="font-body font-light"
                  style={{ fontSize: 13, lineHeight: 1.65, color: "var(--text-dim)" }}
                >
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Problem;
