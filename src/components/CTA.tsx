import { useTranslation } from "react-i18next";
import { Shield, Zap, Lock, XCircle } from "lucide-react";
import WaitlistForm from "@/components/sections/WaitlistForm";

const CTA = () => {
  const { t } = useTranslation();

  const badges = [
    { icon: Shield, label: t('cta_badges.free') },
    { icon: Zap, label: t('cta_badges.setup') },
    { icon: Lock, label: t('cta_badges.no_card') },
    { icon: XCircle, label: t('cta_badges.cancel') },
  ];

  return (
    <section id="waitlist" className="py-[100px] px-10 max-sm:py-[60px] max-sm:px-5" style={{ backgroundColor: "var(--bg-card)" }}>
      <div className="max-w-[1280px] mx-auto text-center">
        <h2 className="font-headline text-4xl sm:text-5xl mb-6 tracking-tight" style={{ color: "var(--text)" }}>
          {t('early_access.headline_main')}
          <br />
          <span className="italic" style={{ color: "var(--accent)" }}>{t('early_access.headline_italic')}</span>
        </h2>
        <p className="text-lg max-w-[460px] mx-auto mb-10 leading-relaxed" style={{ color: "var(--text-dim)" }}>
          {t('early_access.subheadline')}
        </p>

        <div className="flex justify-center mb-8">
          <WaitlistForm source="footer_cta" />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
          {badges.map((b) => (
            <div
              key={b.label}
              className="flex items-center gap-2 font-mono px-4 py-2"
              style={{
                fontSize: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--text-dim)",
                border: "1px solid var(--border-strong)",
                borderRadius: "100px",
              }}
            >
              <b.icon className="w-3 h-3" />
              {b.label}
            </div>
          ))}
        </div>

        <p className="font-body text-sm" style={{ color: "var(--text-muted)" }}>
          {t('early_access.exclusive_frame')}
        </p>
      </div>
    </section>
  );
};

export default CTA;
