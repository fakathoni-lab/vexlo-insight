const AIOverview = () => {
  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="py-[120px] px-10 max-sm:py-[80px] max-sm:px-5"
      style={{
        borderBottom: "1px solid var(--border)",
        background: "linear-gradient(180deg, var(--bg) 0%, rgba(232,255,71,0.03) 50%, var(--bg) 100%)",
      }}
    >
      <div className="max-w-[800px] mx-auto text-center">
        <p className="section-label mb-10">AI Overview Impact</p>

        <h2 className="font-headline text-3xl sm:text-5xl tracking-tight mb-6" style={{ color: "var(--text)" }}>
          Ribuan bisnis kehilangan traffic.{" "}
          <span style={{ color: "var(--accent-proof)" }}>Mereka tidak tahu.</span>
          <br />
          <em className="italic" style={{ color: "var(--text-dim)" }}>Kamu tahu.</em>
        </h2>

        <p className="font-body text-sm leading-relaxed max-w-[520px] mx-auto mb-10" style={{ color: "var(--text-dim)" }}>
          Google AI Overview sudah mengambil traffic organik ribuan bisnis lokal hari ini.
          VEXLO adalah satu-satunya platform yang memvisualisasikan kerusakan itu dalam hitungan detik.
        </p>

        {/* Damage visualization bar */}
        <div
          className="max-w-[480px] mx-auto rounded-[var(--radii-outer)] p-6 mb-10"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Traffic sebelum AI Overview
            </span>
            <span className="font-mono text-sm" style={{ color: "var(--accent-success)" }}>100%</span>
          </div>
          <div className="w-full h-3 rounded-full mb-4" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
            <div className="h-full rounded-full" style={{ width: "100%", backgroundColor: "var(--accent-success)" }} />
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Traffic setelah AI Overview
            </span>
            <span className="font-mono text-sm" style={{ color: "var(--accent-danger)" }}>66%</span>
          </div>
          <div className="w-full h-3 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
            <div className="h-full rounded-full" style={{ width: "66%", backgroundColor: "var(--accent-danger)" }} />
          </div>

          <p className="font-mono text-[9px] uppercase tracking-widest mt-4 text-center" style={{ color: "var(--accent-proof)" }}>
            -34% organic traffic lost
          </p>
        </div>

        <button onClick={() => scrollTo("#waitlist")} className="btn-primary">
          Lihat Contoh AI Overview Impact Report
        </button>
      </div>
    </section>
  );
};

export default AIOverview;
