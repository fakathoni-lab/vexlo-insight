import { useState } from "react";

const Hero = () => {
  const [domain, setDomain] = useState("");
  const [keyword, setKeyword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Future: trigger report generation
    console.log("Generate report for:", domain, keyword);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-6 overflow-hidden">
      {/* Glow effect */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] opacity-20 blur-[120px] pointer-events-none"
        style={{ background: "hsl(22 100% 52%)" }}
      />

      <div className="relative z-10 max-w-[720px] w-full text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 border rounded-full text-xs font-mono tracking-wide text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
          No access permissions required
        </div>

        <h1 className="font-headline text-5xl sm:text-6xl md:text-7xl leading-[1.05] mb-6 tracking-tight">
          Close more calls with{" "}
          <span className="text-accent italic">visual proof</span>
        </h1>

        <p className="text-muted-foreground text-lg sm:text-xl max-w-[520px] mx-auto mb-12 leading-relaxed">
          Input a domain and keyword. Get a shareable SEO proof report in under 30 seconds. No logins, no permissions.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-[560px] mx-auto"
        >
          <input
            type="text"
            placeholder="example.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="flex-1 h-12 px-4 bg-surface border rounded-input text-foreground placeholder:text-muted-foreground text-sm font-body focus:outline-none focus:ring-1 focus:ring-accent transition-all duration-200"
          />
          <input
            type="text"
            placeholder="target keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1 h-12 px-4 bg-surface border rounded-input text-foreground placeholder:text-muted-foreground text-sm font-body focus:outline-none focus:ring-1 focus:ring-accent transition-all duration-200"
          />
          <button
            type="submit"
            className="h-12 px-6 bg-accent text-accent-foreground font-mono text-sm font-bold rounded-button hover:brightness-110 active:brightness-95 transition-all duration-200 whitespace-nowrap"
          >
            Get Report →
          </button>
        </form>

        <p className="text-muted-foreground text-xs mt-4 font-mono">
          Free • No signup required • Results in &lt;30s
        </p>
      </div>
    </section>
  );
};

export default Hero;
