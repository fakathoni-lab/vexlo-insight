import { useEffect, useState, useRef } from "react";

const stats = [
  { value: 23847, label: "Proof Generated", prefix: "", suffix: "" },
  { value: 4.2, label: "Deals Closed by Users", prefix: "$", suffix: "M" },
  { value: 30, label: "Average Proof Time", prefix: "<", suffix: "s" },
  { value: 0, label: "Permissions Required", prefix: "", suffix: "" },
];

const testimonials = [
  {
    name: "Alex R.",
    role: "Agency Founder, 12 klien",
    quote:
      "Saya masuk ke discovery call dengan Proof Score mereka. Mereka tanda tangan hari itu juga. Close rate saya naik dari 18% ke 41%.",
  },
  {
    name: "Sam T.",
    role: "Freelancer SEO",
    quote:
      "Dulu saya pitch seperti freelancer yang memohon kepercayaan. Sekarang saya pitch seperti agency yang membawa verdict. VEXLO mengubah cara saya menjual.",
  },
];

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
  return (
    <section className="landing-section">
      <p className="section-label">Terbukti</p>

      {/* Stats bar */}
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

      {/* Testimonials */}
      <div className="grid sm:grid-cols-2 gap-6">
        {testimonials.map((t) => (
          <div key={t.name} className="testimonial-card">
            <span className="corner-dot tl" />
            <span className="corner-dot tr" />
            <span className="corner-dot bl" />
            <span className="corner-dot br" />
            <p className="font-body text-sm leading-relaxed mb-6" style={{ color: "var(--text-dim)" }}>
              "{t.quote}"
            </p>
            <div>
              <p className="font-headline text-base" style={{ color: "var(--text)" }}>{t.name}</p>
              <p className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                {t.role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SocialProof;
