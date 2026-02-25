const rankBars = [
  { kw: "best plumber london", rank: 3, width: "85%" },
  { kw: "emergency plumber", rank: 7, width: "65%" },
  { kw: "plumber near me", rank: 12, width: "45%" },
  { kw: "24hr plumbing service", rank: 5, width: "75%" },
  { kw: "london plumber reviews", rank: 2, width: "90%" },
];

const Demo = () => {
  return (
    <section className="py-20 lg:py-32 px-5 lg:px-10 max-w-[1280px] mx-auto">
      <p className="text-accent font-mono text-xs tracking-widest uppercase mb-3">
        See it in action
      </p>
      <h2 className="font-headline text-3xl sm:text-4xl mb-16 tracking-tight">
        A proof report that <span className="italic">sells itself</span>
      </h2>

      {/* Browser chrome mockup */}
      <div className="border border-border rounded-card overflow-hidden bg-surface max-w-[960px] mx-auto">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-border" />
            <span className="w-3 h-3 rounded-full bg-border" />
            <span className="w-3 h-3 rounded-full bg-border" />
          </div>
          <div className="flex-1 mx-4">
            <div className="h-6 bg-surface rounded-sm flex items-center px-3">
              <span className="text-muted-foreground text-xs font-mono truncate">
                app.vexlo.io/proof/acme-plumbing
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 lg:p-10">
          <div className="grid lg:grid-cols-[200px_1fr] gap-10">
            {/* Proof Score ring */}
            <div className="flex flex-col items-center gap-3">
              <svg viewBox="0 0 120 120" className="w-40 h-40">
                <circle
                  cx="60" cy="60" r="50"
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="8"
                />
                <circle
                  cx="60" cy="60" r="50"
                  fill="none"
                  stroke="hsl(var(--accent))"
                  strokeWidth="8"
                  strokeDasharray={`${0.72 * 314} ${0.28 * 314}`}
                  strokeDashoffset="78.5"
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
                <text
                  x="60" y="56"
                  textAnchor="middle"
                  className="fill-foreground font-headline text-3xl"
                  style={{ fontSize: "28px" }}
                >
                  72
                </text>
                <text
                  x="60" y="74"
                  textAnchor="middle"
                  className="fill-muted-foreground font-mono"
                  style={{ fontSize: "9px" }}
                >
                  PROOF SCORE
                </text>
              </svg>
              <div className="flex gap-4 text-center">
                <div>
                  <div className="text-foreground font-headline text-lg">#3</div>
                  <div className="text-muted-foreground text-xs font-mono">AVG RANK</div>
                </div>
                <div>
                  <div className="text-accent font-headline text-lg">+4</div>
                  <div className="text-muted-foreground text-xs font-mono">30D DELTA</div>
                </div>
              </div>
            </div>

            {/* Ranking chart + narrative */}
            <div className="space-y-6">
              <div className="space-y-3">
                {rankBars.map((b) => (
                  <div key={b.kw} className="flex items-center gap-3">
                    <span className="text-muted-foreground text-xs font-mono w-44 truncate shrink-0">
                      {b.kw}
                    </span>
                    <div className="flex-1 h-5 bg-background rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-accent/80 rounded-sm"
                        style={{ width: b.width }}
                      />
                    </div>
                    <span className="text-foreground text-xs font-mono w-6 text-right">
                      #{b.rank}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-background border border-border rounded-card">
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">
                  AI Narrative
                </p>
                <p className="text-sm text-foreground leading-relaxed">
                  Acme Plumbing ranks in the top 5 for 3 of 5 tracked keywords, with strong visibility for "london plumber reviews" (#2). Their 30-day trajectory shows positive momentum, suggesting recent content or link-building efforts are paying off. Recommend targeting "plumber near me" for the highest-impact growth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Demo;
