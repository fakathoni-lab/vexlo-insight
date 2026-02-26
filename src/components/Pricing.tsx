import { useTranslation } from "react-i18next";
import { Check, X } from "lucide-react";

const Pricing = () => {
  const { t } = useTranslation();

  const tiers = [
    {
      name: t('pricing.starter_name'),
      price: t('pricing.starter_price'),
      desc: t('pricing.starter_desc'),
      features: [
        { label: t('pricing.f_1'), included: true },
        { label: t('pricing.f_2'), included: true },
        { label: t('pricing.f_3'), included: true },
        { label: t('pricing.f_4'), included: false },
        { label: t('pricing.f_5'), included: false },
        { label: t('pricing.f_6'), included: false },
      ],
      cta: t('pricing.cta_starter'),
    },
    {
      name: t('pricing.pro_name'),
      price: t('pricing.pro_price'),
      desc: t('pricing.pro_desc'),
      featured: true,
      features: [
        { label: t('pricing.f_7'), included: true },
        { label: t('pricing.f_2'), included: true },
        { label: t('pricing.f_3'), included: true },
        { label: t('pricing.f_4'), included: true },
        { label: t('pricing.f_5'), included: true },
        { label: t('pricing.f_6'), included: false },
      ],
      cta: t('pricing.cta_pro'),
    },
    {
      name: t('pricing.elite_name'),
      price: t('pricing.elite_price'),
      desc: t('pricing.elite_desc'),
      features: [
        { label: t('pricing.f_8'), included: true },
        { label: t('pricing.f_2'), included: true },
        { label: t('pricing.f_3'), included: true },
        { label: t('pricing.f_4'), included: true },
        { label: t('pricing.f_5'), included: true },
        { label: t('pricing.f_6'), included: true },
      ],
      cta: t('pricing.cta_elite'),
    },
  ];

  return (
    <section className="landing-section">
      <p className="section-label">{t('pricing.section_label')}</p>

      <div className="max-w-[640px] mx-auto text-center rounded-[var(--radii-outer)] p-6 mb-16" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <p className="font-body text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>{t('pricing.roi_note')}</p>
      </div>

      <h2 className="font-headline text-3xl sm:text-4xl mb-16 tracking-tight text-center" style={{ color: "var(--text)" }}>
        {t('pricing.headline')}{" "}
        <span className="italic" style={{ color: "var(--text-dim)" }}>{t('pricing.headline_italic')}</span>
      </h2>

      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className="p-6 rounded-[12px] flex flex-col transition-colors duration-200"
            style={{
              backgroundColor: "var(--bg-card)",
              border: tier.featured ? "1px solid rgba(124,58,237,0.4)" : "1px solid var(--border)",
              transform: tier.featured ? "scale(1.02)" : undefined,
            }}
          >
            {tier.featured && (
              <span className="inline-block mb-4 px-3 py-1 text-[8px] font-mono uppercase tracking-widest rounded-full self-start" style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
                {t('pricing.most_popular')}
              </span>
            )}
            <h3 className="font-headline text-2xl mb-1" style={{ color: "var(--text)" }}>{tier.name}</h3>
            <p className="text-sm mb-4" style={{ color: "var(--text-dim)" }}>{tier.desc}</p>
            <div className="mb-6">
              <span className="font-headline text-4xl" style={{ color: "var(--text)" }}>{tier.price}</span>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>{t('pricing.per_month')}</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {tier.features.map((f) => (
                <li key={f.label} className="flex items-center gap-2 text-sm">
                  {f.included ? (
                    <Check className="w-4 h-4 shrink-0" style={{ color: "var(--accent)" }} />
                  ) : (
                    <X className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} />
                  )}
                  <span style={{ color: f.included ? "var(--text)" : "var(--text-muted)" }}>{f.label}</span>
                </li>
              ))}
            </ul>

            <a href="#waitlist" className={tier.featured ? "btn-primary w-full text-center" : "btn-ghost w-full text-center"}>
              {tier.cta}
            </a>
          </div>
        ))}
      </div>

      <div className="max-w-[400px] mx-auto text-center rounded-[var(--radii-outer)] p-5" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <p className="font-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>{t('pricing.ppp_label')}</p>
        <p className="font-headline text-2xl" style={{ color: "var(--text)" }}>
          {t('pricing.ppp_price')}<span className="text-sm" style={{ color: "var(--text-muted)" }}> {t('pricing.ppp_unit')}</span>
        </p>
        <p className="font-body text-xs mt-1" style={{ color: "var(--text-dim)" }}>{t('pricing.ppp_desc')}</p>
      </div>
    </section>
  );
};

export default Pricing;
