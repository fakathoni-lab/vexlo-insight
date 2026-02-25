import { RefreshCw, Hourglass, MessageSquareOff } from "lucide-react";

const pains = [
  {
    icon: RefreshCw,
    title: "Butuh akses untuk diagnosa",
    body: "Tapi prospek belum percaya cukup untuk beri akses. Dead loop dimulai.",
  },
  {
    icon: Hourglass,
    title: "Audit manual 30–60 menit",
    body: "Per domain. Sebelum satu discovery call. Yang mungkin tidak akan closing.",
  },
  {
    icon: MessageSquareOff,
    title: "'Nanti saya pikir-pikir dulu.'",
    body: "Kalimat yang mematikan pipeline lebih banyak dari objeksi harga manapun.",
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
        Dead loop yang membunuh deal{" "}
        <span className="italic" style={{ color: "var(--accent-danger)" }}>
          agency manapun.
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
