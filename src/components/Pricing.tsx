import { Check, X } from "lucide-react";

interface Tier {
  name: string;
  price: number;
  desc: string;
  featured?: boolean;
  features: { label: string; included: boolean }[];
}

const tiers: Tier[] = [
  {
    name: "Starter",
    price: 39,
    desc: "For freelancers closing their first SEO clients.",
    features: [
      { label: "10 proof reports / mo", included: true },
      { label: "Branded share links", included: true },
      { label: "Proof Score", included: true },
      { label: "AI narrative", included: false },
      { label: "White-label branding", included: false },
      { label: "API access", included: false },
    ],
  },
  {
    name: "Pro",
    price: 79,
    desc: "For agencies that pitch weekly.",
    featured: true,
    features: [
      { label: "50 proof reports / mo", included: true },
      { label: "Branded share links", included: true },
      { label: "Proof Score", included: true },
      { label: "AI narrative", included: true },
      { label: "White-label branding", included: true },
      { label: "API access", included: false },
    ],
  },
  {
    name: "Elite",
    price: 149,
    desc: "For teams scaling outbound at volume.",
    features: [
      { label: "Unlimited reports", included: true },
      { label: "Branded share links", included: true },
      { label: "Proof Score", included: true },
      { label: "AI narrative", included: true },
      { label: "White-label branding", included: true },
      { label: "API access", included: true },
    ],
  },
];

const Pricing = () => {
  return (
    <section className="py-20 lg:py-32 px-5 lg:px-10 max-w-[1280px] mx-auto">
      <p className="text-accent font-mono text-xs tracking-widest uppercase mb-3">
        Pricing
      </p>
      <h2 className="font-headline text-3xl sm:text-4xl mb-16 tracking-tight">
        Simple plans, <span className="italic">serious results</span>
      </h2>

      <div className="grid sm:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`p-6 rounded-card border transition-colors duration-200 ${
              tier.featured
                ? "border-accent bg-accent/[0.04] scale-[1.02]"
                : "border-border bg-surface hover:border-accent/25"
            }`}
          >
            {tier.featured && (
              <span className="inline-block mb-4 px-3 py-1 bg-accent text-accent-foreground text-xs font-mono uppercase tracking-widest rounded-full">
                Most Popular
              </span>
            )}
            <h3 className="font-headline text-2xl mb-1">{tier.name}</h3>
            <p className="text-muted-foreground text-sm mb-4">{tier.desc}</p>
            <div className="mb-6">
              <span className="font-headline text-4xl">${tier.price}</span>
              <span className="text-muted-foreground text-sm">/mo</span>
            </div>

            <ul className="space-y-3 mb-8">
              {tier.features.map((f) => (
                <li key={f.label} className="flex items-center gap-2 text-sm">
                  {f.included ? (
                    <Check className="w-4 h-4 text-accent shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                  )}
                  <span className={f.included ? "text-foreground" : "text-muted-foreground"}>
                    {f.label}
                  </span>
                </li>
              ))}
            </ul>

            <a
              href="#cta"
              className={`block text-center h-10 leading-10 font-mono text-xs uppercase tracking-widest rounded-button transition-all duration-200 ${
                tier.featured
                  ? "bg-accent text-accent-foreground hover:brightness-110"
                  : "border border-accent/25 text-accent hover:bg-accent/[0.08]"
              }`}
            >
              Get Started
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Pricing;
