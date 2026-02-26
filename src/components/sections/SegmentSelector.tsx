import { useTranslation } from "react-i18next";

const SegmentSelector = () => {
  const { t } = useTranslation();

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const segments = [
    {
      tier: t('segments.seg_1_tier'),
      persona: t('segments.seg_1_persona'),
      desc: t('segments.seg_1_desc'),
      pain: t('segments.seg_1_pain'),
      price: t('segments.seg_1_price'),
      cta: t('segments.seg_1_cta'),
      href: "#waitlist",
      highlight: false,
    },
    {
      tier: t('segments.seg_2_tier'),
      persona: t('segments.seg_2_persona'),
      desc: t('segments.seg_2_desc'),
      pain: t('segments.seg_2_pain'),
      price: t('segments.seg_2_price'),
      cta: t('segments.seg_2_cta'),
      href: "#waitlist",
      highlight: true,
    },
    {
      tier: t('segments.seg_3_tier'),
      persona: t('segments.seg_3_persona'),
      desc: t('segments.seg_3_desc'),
      pain: t('segments.seg_3_pain'),
      price: t('segments.seg_3_price'),
      cta: t('segments.seg_3_cta'),
      href: "#waitlist",
      highlight: false,
    },
  ];

  return (
    <section className="landing-section">
      <p className="section-label">{t('segments.section_label')}</p>
      <h2 className="font-headline text-3xl sm:text-4xl mb-16 tracking-tight" style={{ color: "var(--text)" }}>
        {t('segments.headline')}{" "}
        <span className="italic" style={{ color: "var(--text-dim)" }}>{t('segments.headline_italic')}</span>
      </h2>

      <div className="grid sm:grid-cols-3 gap-6">
        {segments.map((seg) => (
          <div
            key={seg.tier}
            className="product-flagship flex flex-col"
            style={{
              border: seg.highlight ? "1px solid rgba(124,58,237,0.4)" : "1px solid var(--border)",
            }}
          >
            <span className="corner-dot tl" />
            <span className="corner-dot tr" />
            <span className="corner-dot bl" />
            <span className="corner-dot br" />

            {seg.highlight && (
              <span className="inline-block mb-4 px-3 py-1 text-[8px] font-mono uppercase tracking-widest rounded-full self-start" style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
                {t('segments.most_popular')}
              </span>
            )}

            <h3 className="font-headline text-xl mb-1" style={{ color: "var(--text)" }}>{seg.tier}</h3>
            <p className="font-mono text-[9px] uppercase tracking-widest mb-4" style={{ color: "var(--accent)" }}>
              {t('segments.persona_label')} {seg.persona}
            </p>
            <p className="font-body text-sm mb-2 leading-relaxed" style={{ color: "var(--text-dim)" }}>{seg.desc}</p>
            <p className="font-body text-sm mb-6 leading-relaxed flex-1" style={{ color: "var(--text-muted)" }}>{seg.pain}</p>

            <div>
              <p className="font-headline text-2xl mb-4" style={{ color: "var(--text)" }}>{seg.price}</p>
              <button onClick={() => scrollTo(seg.href)} className={seg.highlight ? "btn-primary w-full" : "btn-ghost w-full"}>
                {seg.cta}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SegmentSelector;
