import { useTranslation } from "react-i18next";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const FeatureMatrix = () => {
  const { t } = useTranslation();

  const features = [
    { name: t('features.f1_title'), does: t('features.f1_does'), why: t('features.f1_why') },
    { name: t('features.f2_title'), does: t('features.f2_does'), why: t('features.f2_why') },
    { name: t('features.f3_title'), does: t('features.f3_does'), why: t('features.f3_why') },
    { name: t('features.f4_title'), does: t('features.f4_does'), why: t('features.f4_why') },
    { name: t('features.f5_title'), does: t('features.f5_does'), why: t('features.f5_why') },
    { name: t('features.f6_title'), does: t('features.f6_does'), why: t('features.f6_why') },
    { name: t('features.f7_title'), does: t('features.f7_does'), why: t('features.f7_why') },
    { name: t('features.f8_title'), does: t('features.f8_does'), why: t('features.f8_why') },
    { name: t('features.f9_title'), does: t('features.f9_does'), why: t('features.f9_why'), exclusive: true },
    { name: t('features.f10_title'), does: t('features.f10_does'), why: t('features.f10_why') },
  ];

  return (
    <section className="landing-section">
      <p className="section-label">{t('features.section_label')}</p>
      <h2 className="font-headline text-3xl sm:text-4xl mb-16 tracking-tight" style={{ color: "var(--text)" }}>
        {t('features.headline')}{" "}
        <span className="italic" style={{ color: "var(--text-dim)" }}>{t('features.headline_italic')}</span>
      </h2>

      <div className="grid sm:grid-cols-2 gap-4">
        {features.map((f) => (
          <FeatureCard key={f.name} feature={f} />
        ))}
      </div>
    </section>
  );
};

function FeatureCard({ feature }: { feature: { name: string; does: string; why: string; exclusive?: boolean } }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className="rounded-[var(--radii-outer)] p-5 transition-colors duration-200"
        style={{
          backgroundColor: "var(--bg-card)",
          border: feature.exclusive ? "1px solid rgba(232,255,71,0.3)" : "1px solid var(--border)",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-headline text-base" style={{ color: "var(--text)" }}>{feature.name}</h3>
              {feature.exclusive && (
                <span className="font-mono text-[7px] uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(232,255,71,0.15)", color: "var(--accent-proof)" }}>
                  {t('features.exclusive_moat')}
                </span>
              )}
            </div>
            <p className="font-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: "var(--accent)" }}>
              {t('features.what_it_does')}
            </p>
            <p className="font-body text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>{feature.does}</p>
          </div>
          <CollapsibleTrigger asChild>
            <button className="shrink-0 mt-1 p-1.5 rounded transition-colors duration-200 hover:bg-[rgba(255,255,255,0.05)]" aria-label="Toggle detail">
              <ChevronDown className="w-4 h-4 transition-transform duration-200" style={{ color: "var(--text-muted)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
            </button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="font-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: "var(--accent-success)" }}>
              {t('features.why_it_matters')}
            </p>
            <p className="font-body text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>{feature.why}</p>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export default FeatureMatrix;
