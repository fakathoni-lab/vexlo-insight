import { RefreshCw, Hourglass, MessageSquareOff } from "lucide-react";

const pains = [
  {
    icon: RefreshCw,
    title: "Need access to diagnose",
    body: "But the prospect doesn't trust you enough to grant it yet. The dead loop begins.",
  },
  {
    icon: Hourglass,
    title: "30–60 minute manual audit",
    body: "Per domain. Before a single discovery call. That might not even close.",
  },
  {
    icon: MessageSquareOff,
    title: "'Let me think about it.'",
    body: "The sentence that kills more pipeline than any price objection ever could.",
  },
];

const PainAmplification = () => {
  return (
    <section className="landing-section">
      <p className="section-label">Dead Loop</p>
      <h2
        className="font-headline text-3xl sm:text-4xl mb-16 tracking-tight"
        style={{ color: "var(--text)" }}
      >
        The dead loop that kills deals{" "}
        <span className="italic" style={{ color: "var(--accent-danger)" }}>
          at every agency.
        </span>
      </h2>

      <div className="grid sm:grid-cols-3 gap-6">
        {pains.map((pain) => (
          <div key={pain.title} className="product-flagship">
            <span className="corner-dot tl" />
            <span className="corner-dot tr" />
            <span className="corner-dot bl" />
            <span className="corner-dot br" />

            <pain.icon
              className="w-8 h-8 mb-6"
              style={{ color: "var(--accent-danger)" }}
              strokeWidth={1.5}
            />
            <h3
              className="font-headline text-xl mb-3"
              style={{ color: "var(--text)" }}
            >
              {pain.title}
            </h3>
            <p
              className="font-body text-sm leading-relaxed"
              style={{ color: "var(--text-dim)" }}
            >
              {pain.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PainAmplification;
