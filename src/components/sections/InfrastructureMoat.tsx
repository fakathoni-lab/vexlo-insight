import { useTranslation } from "react-i18next";

const InfrastructureMoat = () => {
  const { t } = useTranslation();

  const metrics = [
    { metric: t('infrastructure.metric_1'), label: t('infrastructure.metric_1_label'), desc: t('infrastructure.metric_1_desc') },
    { metric: t('infrastructure.metric_2'), label: t('infrastructure.metric_2_label'), desc: t('infrastructure.metric_2_desc') },
    { metric: t('infrastructure.metric_3'), label: t('infrastructure.metric_3_label'), desc: t('infrastructure.metric_3_desc') },
  ];

  return (
    <section className="landing-section">
      <p className="section-label">{t('infrastructure.section_label')}</p>
      <h2 className="font-headline text-3xl sm:text-4xl mb-6 tracking-tight" style={{ color: "var(--text)" }}>
        {t('infrastructure.headline')}{" "}
        <span className="italic" style={{ color: "var(--text-dim)" }}>{t('infrastructure.headline_italic')}</span>
      </h2>
      <p className="font-body text-sm leading-relaxed max-w-[560px] mb-16" style={{ color: "var(--text-dim)" }}>
        {t('infrastructure.body')}
      </p>

      <div className="grid sm:grid-cols-3 gap-6">
        {metrics.map((item) => (
          <div key={item.label} className="product-flagship text-center">
            <span className="corner-dot tl" />
            <span className="corner-dot tr" />
            <span className="corner-dot bl" />
            <span className="corner-dot br" />
            <p className="font-mono text-4xl font-bold mb-2" style={{ color: "var(--accent-proof)" }}>{item.metric}</p>
            <p className="font-headline text-lg mb-2" style={{ color: "var(--text)" }}>{item.label}</p>
            <p className="font-body text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default InfrastructureMoat;
