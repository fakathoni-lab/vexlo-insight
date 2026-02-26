import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

const ProductDemo = () => {
  const { t } = useTranslation();
  const narrativeText = t('product_demo.narrative_text');
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.4 }
    );
    const el = document.getElementById("product-demo-section");
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    setTyped("");
    const interval = setInterval(() => {
      i++;
      setTyped(narrativeText.slice(0, i));
      if (i >= narrativeText.length) clearInterval(interval);
    }, 25);
    return () => clearInterval(interval);
  }, [started, narrativeText]);

  return (
    <section id="product-demo-section" className="landing-section">
      <p className="section-label">{t('product_demo.section_label')}</p>
      <h2 className="font-headline text-3xl sm:text-4xl mb-4 tracking-tight" style={{ color: "var(--text)" }}>
        {t('product_demo.headline')}{" "}
        <span className="italic" style={{ color: "var(--text-dim)" }}>{t('product_demo.headline_italic')}</span>
      </h2>
      <p className="font-body text-sm mb-12 max-w-[520px]" style={{ color: "var(--text-dim)" }}>
        {t('product_demo.subheadline')}
      </p>

      <div className="product-flagship max-w-[800px] mx-auto">
        <span className="corner-dot tl" />
        <span className="corner-dot tr" />
        <span className="corner-dot bl" />
        <span className="corner-dot br" />

        <div className="flex items-center gap-3 mb-6">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--accent-danger)" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--accent-success)" }} />
          <span className="font-mono text-[10px] ml-2" style={{ color: "var(--text-muted)" }}>
            {t('product_demo.proof_report_label')}
          </span>
        </div>

        <div className="grid sm:grid-cols-[140px_1fr] gap-8">
          <div className="flex flex-col items-center gap-2">
            <div className="proof-score-gauge">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
                <circle cx="60" cy="60" r="45" fill="none" stroke="var(--accent-danger)" strokeWidth="6" strokeLinecap="round" strokeDasharray="283" strokeDashoffset={started ? "218" : "283"} transform="rotate(-90 60 60)" style={{ transition: "stroke-dashoffset 1.2s var(--ease-circ-out)" }} />
              </svg>
              <span className="absolute font-mono text-2xl font-bold" style={{ color: "var(--accent-danger)" }}>23</span>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              {t('product_demo.proof_score_label')}
            </span>
          </div>

          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest mb-3" style={{ color: "var(--accent)" }}>
              {t('product_demo.closing_narrative')}
            </p>
            <p className="font-body text-sm leading-relaxed" style={{ color: "var(--text-dim)", minHeight: 80 }}>
              {typed}
              {typed.length < narrativeText.length && <span className="typing-animation" />}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDemo;
