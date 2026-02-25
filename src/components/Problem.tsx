import { Clock, ShieldOff, BarChart3 } from "lucide-react";

const painPoints = [
  {
    icon: Clock,
    title: "Hours wasted on manual audits",
    desc: "You're screenshotting Ahrefs, stitching slides, and reformatting data before every sales call.",
  },
  {
    icon: ShieldOff,
    title: "Prospects won't share access",
    desc: "Asking for Search Console credentials kills trust before the conversation even starts.",
  },
  {
    icon: BarChart3,
    title: "Generic tools don't sell",
    desc: "Dashboards built for SEOs, not for closing. Your prospects don't understand the data.",
  },
];

const Problem = () => {
  return (
    <section className="py-20 lg:py-32 px-5 lg:px-10 max-w-[1280px] mx-auto">
      <div className="grid lg:grid-cols-2 gap-16 items-start">
        <div>
          <p className="text-accent font-mono text-xs tracking-widest uppercase mb-3">
            The problem
          </p>
          <h2 className="font-headline text-3xl sm:text-4xl tracking-tight leading-tight">
            You're still pitching with{" "}
            <span className="italic">screenshots and spreadsheets</span>
          </h2>
        </div>

        <div className="space-y-4">
          {painPoints.map((p) => (
            <div
              key={p.title}
              className="p-6 bg-surface border border-border rounded-card hover:border-accent/25 transition-colors duration-200"
            >
              <div className="flex items-start gap-4">
                <p.icon className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-body font-semibold text-base mb-1">{p.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problem;
