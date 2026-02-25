const InfrastructureMoat = () => {
  return (
    <section className="landing-section">
      <p className="section-label">Infrastruktur</p>
      <h2 className="font-headline text-3xl sm:text-4xl mb-6 tracking-tight" style={{ color: "var(--text)" }}>
        Infrastruktur, bukan tool.{" "}
        <span className="italic" style={{ color: "rgba(240,240,238,0.42)" }}>
          Yang ditinggalkan sulit.
        </span>
      </h2>
      <p className="font-body text-sm leading-relaxed max-w-[560px] mb-16" style={{ color: "var(--text-dim)" }}>
        Domain klien yang tinggal di VEXLO. Archive pitch yang tumbuh nilainya setiap bulan.
        Identitas brand agency yang terbentuk di sini. Ini bukan tool yang dipakai lalu ditinggalkan.
      </p>

      <div className="grid sm:grid-cols-3 gap-6">
        {[
          { metric: "+60%", label: "LTV Uplift", desc: "Agency Pro users yang mengaktifkan domain integration." },
          { metric: "4.2x", label: "Pitch Archive Value", desc: "Nilai archive tumbuh setiap bulan — semakin lama, semakin sulit ditinggalkan." },
          { metric: "< 3%", label: "Churn Rate", desc: "Untuk users dengan 3+ domain aktif di platform." },
        ].map((item) => (
          <div key={item.label} className="product-flagship text-center">
            <span className="corner-dot tl" />
            <span className="corner-dot tr" />
            <span className="corner-dot bl" />
            <span className="corner-dot br" />
            <p className="font-mono text-4xl font-bold mb-2" style={{ color: "var(--accent-proof)" }}>
              {item.metric}
            </p>
            <p className="font-headline text-lg mb-2" style={{ color: "var(--text)" }}>
              {item.label}
            </p>
            <p className="font-body text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default InfrastructureMoat;
