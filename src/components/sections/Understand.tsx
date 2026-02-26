import { useParallax } from "@/hooks/useParallax";

const lines = [
  { text: "They don't need", style: "hollow" as const },
  { text: "another audit.", style: "hollow" as const },
  { text: "They need to", style: "solid" as const },
  { text: "understand.", style: "solid" as const },
];

const Understand = () => {
  const { sectionRef, offset } = useParallax(0.12);

  return (
    <section
      ref={sectionRef}
      className="relative border-b overflow-hidden"
      style={{
        borderColor: "var(--border)",
        padding: "160px 40px",
      }}
    >
      {/* Orb glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="understand-orb" />
      </div>

      {/* Parallax text block */}
      <div
        className="relative z-10 max-w-[1280px] mx-auto text-center"
        style={{ transform: `translateY(${offset}px)` }}
      >
        {lines.map((line, i) => (
          <div key={i} className={`st-line ${line.style}`} style={{ fontFamily: 'var(--serif)' }}>
            {line.text}
          </div>
        ))}

        <p
          className="mt-10 mx-auto max-w-[520px] font-body font-light"
          style={{
            fontSize: 14,
            lineHeight: 1.75,
            color: "var(--text-dim)",
          }}
        >
          Your prospects already know SEO matters. What they don't know is how
          far behind they are — until you show them the data they can't ignore.
        </p>

        <div className="mt-10 flex justify-center">
          <a href="#how" className="arrow-link">
            See how it works
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Understand;
