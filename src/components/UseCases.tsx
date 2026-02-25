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
    <section className="py-20 lg:py-32 px-5 lg:px-10 max-w-[1280px] mx-auto">
      <p className="text-accent font-mono text-xs tracking-widest uppercase mb-3">
        Who it's for
      </p>
      <h2 className="font-headline text-3xl sm:text-4xl mb-16 tracking-tight">
        Built for people who <span className="italic">ship and sell</span>
      </h2>

      <div className="grid sm:grid-cols-3 gap-6">
        {personas.map((p) => (
          <div
            key={p.title}
            className="p-6 bg-surface border border-border rounded-card hover:border-accent/25 transition-colors duration-200"
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
