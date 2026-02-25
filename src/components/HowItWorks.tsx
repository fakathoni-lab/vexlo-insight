import { Globe, ScanSearch, Share2 } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: Globe,
    title: "Enter domain & keyword",
    desc: "Paste your prospect's website and the keyword they want to rank for.",
  },
  {
    num: "02",
    icon: ScanSearch,
    title: "We scan in real-time",
    desc: "Vexlo pulls rankings, backlinks, and on-page data — no permissions needed.",
  },
  {
    num: "03",
    icon: Share2,
    title: "Share visual proof",
    desc: "Get a branded, shareable report that makes your pitch impossible to ignore.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 lg:py-32 px-5 lg:px-10 max-w-[1280px] mx-auto">
      <p className="text-accent font-mono text-xs tracking-widest uppercase mb-3">
        How it works
      </p>
      <h2 className="font-headline text-3xl sm:text-4xl mb-16 tracking-tight">
        Three steps to a <span className="italic">closed deal</span>
      </h2>

      <div className="grid sm:grid-cols-3 gap-8">
        {steps.map((step) => (
          <div
            key={step.num}
            className="group p-6 bg-surface border border-border rounded-card hover:border-accent/25 transition-colors duration-200"
          >
            <step.icon className="w-5 h-5 text-accent mb-4" />
            <span className="text-accent font-mono text-sm font-bold mb-2 block">
              {step.num}
            </span>
            <h3 className="font-headline text-xl mb-2">{step.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
