const features = [
  {
    title: "Zero-access audits",
    desc: "No Google Search Console or Analytics access needed. Just a domain.",
  },
  {
    title: "Branded reports",
    desc: "White-label proof pages with your agency's logo and colors.",
  },
  {
    title: "Instant sharing",
    desc: "One link. Send it before the call. Let the data do the talking.",
  },
  {
    title: "Real-time data",
    desc: "Rankings, backlinks, and technical SEO pulled fresh every time.",
  },
];

const Features = () => {
  return (
    <section className="px-6 py-24 max-w-[1000px] mx-auto">
      <p className="text-accent font-mono text-xs tracking-widest uppercase mb-3">
        Why Vexlo
      </p>
      <h2 className="font-headline text-3xl sm:text-4xl mb-16 tracking-tight">
        Built for agencies that{" "}
        <span className="italic">move fast</span>
      </h2>

      <div className="grid sm:grid-cols-2 gap-6">
        {features.map((f) => (
          <div
            key={f.title}
            className="p-6 border rounded-card hover:bg-surface transition-colors duration-300"
          >
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
