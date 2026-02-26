import { useTranslation } from "react-i18next";
import { useEffect, useState, useRef } from "react";

function useAnimatedCounter(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            setCount(target * progress);
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { ref, count };
}

const SocialProof = () => {
  const { t } = useTranslation();

  const stats = [
    { value: 23847, label: t('social_proof.stat_1_label'), prefix: "", suffix: "" },
    { value: 4.2, label: t('social_proof.stat_2_label'), prefix: "$", suffix: "M" },
    { value: 30, label: t('social_proof.stat_3_label'), prefix: "<", suffix: "s" },
    { value: 0, label: t('social_proof.stat_4_label'), prefix: "", suffix: "" },
  ];

  const testimonials = [
    { name: t('social_proof.testimonial_1_name'), role: t('social_proof.testimonial_1_role'), quote: t('social_proof.testimonial_1_quote') },
    { name: t('social_proof.testimonial_2_name'), role: t('social_proof.testimonial_2_role'), quote: t('social_proof.testimonial_2_quote') },
  ];

  return (
    <section className="landing-section">
      <p className="section-label">{t('social_proof.section_label')}</p>

      <div className="stats-bar mb-16">
        {stats.map((stat) => {
          const { ref, count } = useAnimatedCounter(stat.value);
          const display = stat.value === 0 ? "0" :
            stat.value >= 1000 ? Math.floor(count).toLocaleString() :
            Number.isInteger(stat.value) ? Math.floor(count).toString() :
            count.toFixed(1);
          return (
            <div key={stat.label} ref={ref}>
              <p className="font-mono text-2xl sm:text-3xl font-bold mb-1" style={{ color: "var(--text)" }}>
                {stat.prefix}{display}{stat.suffix}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {testimonials.map((item) => (
          <div key={item.name} className="testimonial-card">
            <span className="corner-dot tl" />
            <span className="corner-dot tr" />
            <span className="corner-dot bl" />
            <span className="corner-dot br" />
            <p className="font-body text-sm leading-relaxed mb-6" style={{ color: "var(--text-dim)" }}>
              "{item.quote}"
            </p>
            <div>
              <p className="font-headline text-base" style={{ color: "var(--text)" }}>{item.name}</p>
              <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>{item.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SocialProof;
