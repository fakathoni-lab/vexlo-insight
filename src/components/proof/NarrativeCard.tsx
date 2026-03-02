import Typewriter from "./Typewriter";

const NarrativeCard = ({ narrative, animate = true }: { narrative: string | null; animate?: boolean }) => {
  if (!narrative) {
    return (
      <div
        className="rounded-[var(--radii-outer)] p-6"
        style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <p className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
          AI Narrative
        </p>
        <p className="font-body text-sm italic" style={{ color: "var(--text-muted)" }}>
          Narrative not yet generated.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-[var(--radii-outer)] p-6"
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--accent-border)",
        boxShadow: "0 0 30px rgba(124,58,237,0.06)",
      }}
    >
      <p className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: "var(--accent-light)" }}>
        AI Narrative
      </p>
      {animate ? <Typewriter text={narrative} /> : (
        <p className="font-body font-light leading-relaxed text-sm" style={{ color: "rgba(240,240,238,0.7)" }}>
          {narrative}
        </p>
      )}
    </div>
  );
};

export default NarrativeCard;
