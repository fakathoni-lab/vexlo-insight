import { useTranslation } from "react-i18next";
import { Award } from "lucide-react";

const CategoryOwnership = () => {
  const { t } = useTranslation();

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const cohorts = [t('certified.cohort_1'), t('certified.cohort_2'), t('certified.cohort_3')];

  return (
    <section className="landing-section text-center">
      <p className="section-label">{t('certified.section_label')}</p>

      <div className="mx-auto mb-10 w-24 h-24 rounded-full flex items-center justify-center" style={{ border: "2px solid var(--accent)", backgroundColor: "rgba(124,58,237,0.08)" }}>
        <Award className="w-10 h-10" style={{ color: "var(--accent)" }} />
      </div>

      <h2 className="font-headline text-3xl sm:text-4xl mb-6 tracking-tight" style={{ color: "var(--text)" }}>
        {t('certified.headline_1')}
        <br />
        <span className="italic" style={{ color: "var(--text-dim)" }}>{t('certified.headline_2')}</span>
      </h2>

      <p className="font-body text-sm leading-relaxed max-w-[520px] mx-auto mb-10" style={{ color: "var(--text-dim)" }}>
        {t('certified.body')}
      </p>

      <div className="flex items-center justify-center gap-6 mb-10 flex-wrap">
        {cohorts.map((cohort, i) => (
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
        {t('certified.cta')}
      </button>
    </section>
  );
};

export default CategoryOwnership;
