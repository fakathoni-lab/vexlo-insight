import { Eye, Paintbrush, Link2, Activity, Sparkles, Gauge } from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "Zero-access audits",
    desc: "No Google Search Console or Analytics access needed. Just a domain.",
  },
  {
    icon: Paintbrush,
    title: "Branded reports",
    desc: "White-label proof pages with your agency's logo and colors.",
  },
  {
    icon: Link2,
    title: "Instant sharing",
    desc: "One link. Send it before the call. Let the data do the talking.",
  },
  {
    icon: Activity,
    title: "Real-time data",
    desc: "Rankings, backlinks, and technical SEO pulled fresh every time.",
  },
  {
    icon: Sparkles,
    title: "AI Overview detection",
    desc: "See if your prospect appears in Google's AI-generated answers.",
  },
  {
    icon: Gauge,
    title: "Proof Score system",
    desc: "A single 0-100 metric that quantifies SEO authority at a glance.",
  },
];

const Features = () => {
  return (
    <section className="landing-section">
      <p className="section-label">Why Vexlo</p>
      <h2 className="font-headline text-3xl sm:text-4xl mb-16 tracking-tight">
        Built for agencies that{" "}
        <span className="italic">move fast</span>
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <div
            key={f.title}
            className="p-6 rounded-[12px] border transition-colors duration-200"
            style={{
              backgroundColor: '#0d0d0d',
              borderColor: 'rgba(255,255,255,0.07)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.13)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
          >
            <f.icon className="w-5 h-5 text-accent mb-4" />
            <h3 className="font-body font-semibold text-base mb-2">{f.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
