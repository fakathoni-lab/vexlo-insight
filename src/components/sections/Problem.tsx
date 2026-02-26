const painCards = [
  {
    tag: "Time Sink",
    title: "45 minutes of manual research",
    body: "Every audit you run manually is time you're not spending closing. Repetitive. Error-prone. Unscalable.",
  },
  {
    tag: "Trust Killer",
    title: "Asking for access kills momentum",
    body: "Requesting GSC or GA4 access signals doubt. It puts the prospect in control before trust is built.",
  },
  {
    tag: "Lost Deal",
    title: "Generic pitches lose to specific proof",
    body: "Your competitor walked in with their domain data. You walked in with a slide deck.",
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
        <div className="flex items-center gap-3 mb-12" style={{ color: "hsl(22,100%,52%)" }}>
          <span className="block w-7 h-px" style={{ backgroundColor: "hsl(22,100%,52%)" }} />
          <span className="font-mono uppercase tracking-[0.18em]" style={{ fontSize: 10 }}>
            The Problem
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
              Your prospects don't believe
              <br />
              they have a problem.
              <br />
              <span className="italic" style={{ color: "var(--text-dim)" }}>
                Until you show them.
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
              Every lost deal has the same story. Great pitch, solid service, wrong timing.
              The timing problem is really a proof problem.
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
