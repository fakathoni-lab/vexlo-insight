import { Briefcase, Code, Rocket } from "lucide-react";

const personas = [
  {
    icon: Briefcase,
    title: "SEO Agency Founder",
    desc: "Send proof reports before every discovery call. Close faster with data that speaks louder than slides.",
  },
  {
    icon: Code,
    title: "Freelance Developer",
    desc: "Upsell SEO services to existing clients. Show them exactly where they stand — and where you can take them.",
  },
  {
    icon: Rocket,
    title: "Indie Hacker",
    desc: "Validate your product's search presence. Track keyword traction without enterprise tooling.",
  },
];

const UseCases = () => {
  return (
    <section className="landing-section">
      <p className="section-label">Who it's for</p>
      <h2 className="font-headline text-3xl sm:text-4xl mb-16 tracking-tight">
        Built for people who <span className="italic">ship and sell</span>
      </h2>

      <div className="grid sm:grid-cols-3 gap-6">
        {personas.map((p) => (
          <div
            key={p.title}
            className="p-6 rounded-[12px] border transition-colors duration-200"
            style={{
              backgroundColor: '#0d0d0d',
              borderColor: 'rgba(255,255,255,0.07)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.13)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
          >
            <p.icon className="w-5 h-5 text-accent mb-4" />
            <h3 className="font-headline text-xl mb-2">{p.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default UseCases;
