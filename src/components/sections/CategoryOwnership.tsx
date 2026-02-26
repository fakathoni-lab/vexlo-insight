import { Award } from "lucide-react";

const CategoryOwnership = () => {
  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="landing-section text-center">
      <p className="section-label">Proof-First Certified</p>

      {/* Badge */}
      <div className="mx-auto mb-10 w-24 h-24 rounded-full flex items-center justify-center" style={{ border: "2px solid var(--accent)", backgroundColor: "rgba(124,58,237,0.08)" }}>
        <Award className="w-10 h-10" style={{ color: "var(--accent)" }} />
      </div>

      <h2 className="font-headline text-3xl sm:text-4xl mb-6 tracking-tight" style={{ color: "var(--text)" }}>
        Bukan sekadar pelanggan.
        <br />
        <span className="italic" style={{ color: "var(--text-dim)" }}>
          Founding members standar industri baru.
        </span>
      </h2>

      <p className="font-body text-sm leading-relaxed max-w-[520px] mx-auto mb-10" style={{ color: "var(--text-dim)" }}>
        Proof-First Certified Program — bergabung dengan cohort pertama agency yang mendefinisikan
        standar baru dalam SEO sales. Badge LinkedIn. Akses eksklusif. Network yang tidak bisa dibeli.
      </p>

      {/* Timeline */}
      <div className="flex items-center justify-center gap-6 mb-10 flex-wrap">
        {["Cohort 1: Q1 2026", "Cohort 2: Q2 2026", "Cohort 3: Q3 2026"].map((cohort, i) => (
          <div
            key={cohort}
            className="font-mono text-[9px] uppercase tracking-widest px-4 py-2 rounded-[100px]"
            style={{
              color: i === 0 ? "var(--accent)" : "var(--text-muted)",
              border: i === 0 ? "1px solid rgba(124,58,237,0.4)" : "1px solid var(--border)",
            }}
          >
            {cohort}
          </div>
        ))}
      </div>

      <button onClick={() => scrollTo("#waitlist")} className="btn-primary">
        Apply untuk Cohort 1
      </button>
    </section>
  );
};

export default CategoryOwnership;
