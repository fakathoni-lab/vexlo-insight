import { useTranslation } from "react-i18next";

const HowItWorks = () => {
  const { t } = useTranslation();

  const steps = [
    { label: t('how_it_works.step_1_label'), title: t('how_it_works.step_1_title'), body: t('how_it_works.step_1_desc') },
    { label: t('how_it_works.step_2_label'), title: t('how_it_works.step_2_title'), body: t('how_it_works.step_2_desc') },
    { label: t('how_it_works.step_3_label'), title: t('how_it_works.step_3_title'), body: t('how_it_works.step_3_desc') },
  ];

  return (
    <section className="border-b border-[rgba(255,255,255,0.07)]" style={{ padding: "100px 40px" }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="flex items-center gap-3 mb-12" style={{ color: "var(--accent)" }}>
          <span className="block w-7 h-px" style={{ backgroundColor: "var(--accent)" }} />
          <span className="font-mono uppercase tracking-[0.18em]" style={{ fontSize: 10 }}>
            {t('how_it_works.section_label')}
          </span>
        </div>

        <h2 className="font-headline mb-16 max-w-[700px]" style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1, color: "#f0f0ee" }}>
          {t('how_it_works.headline')}{" "}
          <span className="italic" style={{ color: "var(--text-dim)" }}>{t('how_it_works.headline_italic')}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px">
          {steps.map((step) => (
            <div key={step.label} className="rounded-[12px] border border-[rgba(255,255,255,0.07)] transition-[border-color] duration-[250ms] hover:border-[rgba(255,255,255,0.13)]" style={{ padding: 32, backgroundColor: "#0d0d0d" }}>
              <span className="block font-mono uppercase tracking-wide mb-4" style={{ fontSize: 8.5, color: "var(--accent)" }}>{step.label}</span>
              <p className="font-body font-normal mb-2" style={{ fontSize: 15, color: "#f0f0ee" }}>{step.title}</p>
              <p className="font-body font-light" style={{ fontSize: 13, lineHeight: 1.65, color: "var(--text-dim)" }}>{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
