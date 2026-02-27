import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const features = [
  {
    name: "Instant Proof Engine",
    does: "Generate visual proof of a prospect's SEO vulnerability in <30 seconds from public data.",
    why: "You don't need GA4 or GSC access. Walk into the call with evidence, not requests.",
  },
  {
    name: "AI Overview Impact Visualizer",
    does: "Visualize how much of a prospect's organic traffic Google AI Overview is capturing.",
    why: "Prospects don't know they're losing traffic. You're the first to show them.",
  },
  {
    name: "Closing Narrative Generator",
    does: "AI writes a closing narrative based on proof data — ready to read on the call.",
    why: "Turn raw data into a storyline the prospect can't ignore.",
  },
  {
    name: "Proof Score Dashboard",
    does: "A 0–100 score summarizing SEO vulnerability in one number anyone can understand.",
    why: "One number is more powerful than 20 slides. The prospect gets it instantly.",
  },
  {
    name: "Pitch Intelligence Archive",
    does: "Every proof report is stored and accessible anytime.",
    why: "Build a pitch database that grows in value every month.",
  },
  {
    name: "White-Label Brand Vault",
    does: "Customize logo, colors, and domain for every report you create.",
    why: "Clients see your agency brand, not VEXLO. Instant professionalism.",
  },
  {
    name: "Client-Facing Portal",
    does: "A dedicated portal for clients to view proof reports and progress updates.",
    why: "Clients feel professionally managed. Retention increases.",
  },
  {
    name: "Shareable Proof Link",
    does: "Every report has a unique link you can send before the call.",
    why: "Let the data 'warm up' the conversation before you speak.",
  },
  {
    name: "Domain Integration",
    does: "Strategic domains detected can be secured directly from VEXLO.",
    why: "Additional revenue stream. When domains 'live' in VEXLO, the relationship shifts from transactional to custodial.",
    exclusive: true,
  },
  {
    name: "Daily Battlefield Intelligence Brief",
    does: "Daily briefing on ranking changes, AI Overview shifts, and new pitch opportunities.",
    why: "Never miss an opportunity. Every morning, you know who to call.",
  },
];

const FeatureMatrix = () => {
  return (
    <section className="landing-section">
      <p className="section-label">Proof Arsenal</p>
      <h2 className="font-headline text-3xl sm:text-4xl mb-16 tracking-tight" style={{ color: "var(--text)" }}>
        10 weapons to{" "}
        <span className="italic" style={{ color: "var(--text-dim)" }}>close the deal.</span>
      </h2>

      <div className="grid sm:grid-cols-2 gap-4">
        {features.map((f) => (
          <FeatureCard key={f.name} feature={f} />
        ))}
      </div>
    </section>
  );
};

function FeatureCard({ feature }: { feature: typeof features[number] }) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className="rounded-[var(--radii-outer)] p-5 transition-colors duration-200"
        style={{
          backgroundColor: "var(--bg-card)",
          border: feature.exclusive
            ? "1px solid rgba(232,255,71,0.3)"
            : "1px solid var(--border)",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-headline text-base" style={{ color: "var(--text)" }}>
                {feature.name}
              </h3>
              {feature.exclusive && (
                <span
                  className="font-mono text-[7px] uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "rgba(232,255,71,0.15)", color: "var(--accent-proof)" }}
                >
                  Exclusive Moat
                </span>
              )}
            </div>
            <p className="font-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: "var(--accent)" }}>
              What it does
            </p>
            <p className="font-body text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>
              {feature.does}
            </p>
          </div>
          <CollapsibleTrigger asChild>
            <button
              className="shrink-0 mt-1 p-1.5 rounded transition-colors duration-200 hover:bg-[rgba(255,255,255,0.05)]"
              aria-label="Toggle detail"
            >
              <ChevronDown
                className="w-4 h-4 transition-transform duration-200"
                style={{
                  color: "var(--text-muted)",
                  transform: open ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="font-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: "var(--accent-success)" }}>
              Why it matters
            </p>
            <p className="font-body text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>
              {feature.why}
            </p>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export default FeatureMatrix;
