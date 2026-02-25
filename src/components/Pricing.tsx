import { Check, X } from "lucide-react";

interface Tier {
  name: string;
  price: string;
  desc: string;
  featured?: boolean;
  features: { label: string; included: boolean }[];
  cta: string;
}

const tiers: Tier[] = [
  {
    name: "Starter",
    price: "$39",
    desc: "Untuk freelancer yang closing klien pertama.",
    features: [
      { label: "10 proof reports / bln", included: true },
      { label: "Branded share links", included: true },
      { label: "Proof Score", included: true },
      { label: "AI narrative", included: false },
      { label: "White-label branding", included: false },
      { label: "API access", included: false },
    ],
    cta: "Mulai Sekarang",
  },
  {
    name: "Agency Pro",
    price: "$79",
    desc: "Untuk agency yang pitch setiap minggu.",
    featured: true,
    features: [
      { label: "50 proof reports / bln", included: true },
      { label: "Branded share links", included: true },
      { label: "Proof Score", included: true },
      { label: "AI narrative", included: true },
      { label: "White-label branding", included: true },
      { label: "API access", included: false },
    ],
    cta: "Mulai Sekarang",
  },
  {
    name: "Agency Elite",
    price: "$149",
    desc: "Untuk tim yang scaling outbound.",
    features: [
      { label: "Unlimited reports", included: true },
      { label: "Branded share links", included: true },
      { label: "Proof Score", included: true },
      { label: "AI narrative", included: true },
      { label: "White-label branding", included: true },
      { label: "API access", included: true },
    ],
    cta: "Hubungi Sales",
  },
];

const Pricing = () => {
  return (
    <section className="landing-section">
      <p className="section-label">Pricing</p>

      {/* ROI framing */}
      <div
        className="max-w-[640px] mx-auto text-center rounded-[var(--radii-outer)] p-6 mb-16"
        style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <p className="font-body text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>
          Rata-rata retainer SEO:{" "}
          <span className="font-bold" style={{ color: "var(--text)" }}>$1.500/bln</span>.
          Satu deal yang closed ={" "}
          <span style={{ color: "var(--accent-proof)" }}>19 bulan subscription gratis</span>.
        </p>
      </div>

      <h2 className="font-headline text-3xl sm:text-4xl mb-16 tracking-tight text-center" style={{ color: "var(--text)" }}>
        Investasi yang{" "}
        <span className="italic" style={{ color: "rgba(240,240,238,0.42)" }}>membayar dirinya sendiri.</span>
      </h2>

      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className="p-6 rounded-[12px] flex flex-col transition-colors duration-200"
            style={{
              backgroundColor: "var(--bg-card)",
              border: tier.featured
                ? "1px solid rgba(255,99,8,0.4)"
                : "1px solid var(--border)",
              transform: tier.featured ? "scale(1.02)" : undefined,
            }}
          >
            {tier.featured && (
              <span
                className="inline-block mb-4 px-3 py-1 text-[8px] font-mono uppercase tracking-widest rounded-full self-start"
                style={{ backgroundColor: "hsl(22,100%,52%)", color: "#fff" }}
              >
                Most Popular
              </span>
            )}
            <h3 className="font-headline text-2xl mb-1" style={{ color: "var(--text)" }}>{tier.name}</h3>
            <p className="text-sm mb-4" style={{ color: "var(--text-dim)" }}>{tier.desc}</p>
            <div className="mb-6">
              <span className="font-headline text-4xl" style={{ color: "var(--text)" }}>{tier.price}</span>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>/bln</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {tier.features.map((f) => (
                <li key={f.label} className="flex items-center gap-2 text-sm">
                  {f.included ? (
                    <Check className="w-4 h-4 shrink-0" style={{ color: "var(--accent)" }} />
                  ) : (
                    <X className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} />
                  )}
                  <span style={{ color: f.included ? "var(--text)" : "var(--text-muted)" }}>
                    {f.label}
                  </span>
                </li>
              ))}
            </ul>

            <a
              href="#waitlist"
              className={tier.featured ? "btn-primary w-full text-center" : "btn-ghost w-full text-center"}
            >
              {tier.cta}
            </a>
          </div>
        ))}
      </div>

      {/* Pay-Per-Proof */}
      <div
        className="max-w-[400px] mx-auto text-center rounded-[var(--radii-outer)] p-5"
        style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <p className="font-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
          Atau bayar per proof
        </p>
        <p className="font-headline text-2xl" style={{ color: "var(--text)" }}>
          $12<span className="text-sm" style={{ color: "var(--text-muted)" }}> / proof</span>
        </p>
        <p className="font-body text-xs mt-1" style={{ color: "var(--text-dim)" }}>
          Tanpa subscription. Bayar hanya saat butuh.
        </p>
      </div>
    </section>
  );
};

export default Pricing;
