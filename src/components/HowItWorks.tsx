const steps = [
  {
    num: "01",
    title: "Enter domain & keyword",
    desc: "Paste your prospect's website and the keyword they want to rank for.",
  },
  {
    num: "02",
    title: "We scan in real-time",
    desc: "Vexlo pulls rankings, backlinks, and on-page data — no permissions needed.",
  },
  {
    num: "03",
    title: "Share visual proof",
    desc: "Get a branded, shareable report that makes your pitch impossible to ignore.",
  },
];

const HowItWorks = () => {
  return (
    <section className="px-6 py-24 max-w-[1000px] mx-auto">
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
            className="group p-6 bg-surface border rounded-card hover:border-accent/40 transition-colors duration-300"
          >
            <span className="text-accent font-mono text-sm font-bold mb-4 block">
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
