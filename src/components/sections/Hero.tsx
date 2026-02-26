import { useTranslation } from "react-i18next";
import { ChevronDown, ArrowRight } from "lucide-react";

const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="hero">
      <div className="hero-atmosphere" />
      <div className="light-streaks" />
      <div className="hero-vignette" />
      <div className="hero-wordmark">
        <span className="hero-wordmark-text">VEXLO</span>
      </div>

      <div className="hero-content">
        <div className="hero-eyebrow">{t('hero.eyebrow')}</div>
        <p className="hero-tagline">{t('hero.tagline')}</p>
      </div>

      <div className="hero-search-outer">
        <div className="search-box">
          <textarea placeholder={t('hero.placeholder')} rows={3} />
          <div className="search-actions">
            <button className="search-submit" aria-label={t('hero.cta_primary')}>
              <ArrowRight />
            </button>
          </div>
        </div>
      </div>

      <div className="hero-bottom">
        <div className="scroll-indicator">
          <ChevronDown />
        </div>

        <div className="announcement">
          <div>
            <p className="ann-label">
              <strong>{t('hero.ann_label')}</strong> {t('hero.ann_label_suffix')}
            </p>
            <p className="ann-sub">{t('hero.ann_sub')}</p>
          </div>
          <button
            className="ann-btn"
            onClick={() => {
              const el = document.querySelector("#waitlist");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            {t('hero.ann_btn')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
