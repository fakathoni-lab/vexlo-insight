import { useTranslation } from "react-i18next";
import { RefreshCw, Hourglass, MessageSquareOff } from "lucide-react";

const PainAmplification = () => {
  const { t } = useTranslation();

  const pains = [
    { icon: RefreshCw, title: t('pain.card_1_title'), body: t('pain.card_1_body') },
    { icon: Hourglass, title: t('pain.card_2_title'), body: t('pain.card_2_body') },
    { icon: MessageSquareOff, title: t('pain.card_3_title'), body: t('pain.card_3_body') },
  ];

  return (
    <section className="landing-section">
      <p className="section-label">{t('pain.section_label')}</p>
      <h2 className="font-headline text-3xl sm:text-4xl mb-16 tracking-tight" style={{ color: "var(--text)" }}>
        {t('pain.headline')}{" "}
        <span className="italic" style={{ color: "var(--accent-danger)" }}>{t('pain.headline_italic')}</span>
      </h2>

      <div className="grid sm:grid-cols-3 gap-6">
        {pains.map((pain) => (
          <div key={pain.title} className="product-flagship">
            <span className="corner-dot tl" />
            <span className="corner-dot tr" />
            <span className="corner-dot bl" />
            <span className="corner-dot br" />
            <pain.icon className="w-8 h-8 mb-6" style={{ color: "var(--accent-danger)" }} strokeWidth={1.5} />
            <h3 className="font-headline text-xl mb-3" style={{ color: "var(--text)" }}>{pain.title}</h3>
            <p className="font-body text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>{pain.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PainAmplification;
