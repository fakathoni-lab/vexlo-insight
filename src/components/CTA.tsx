import { useState } from "react";
import { Shield, Clock, Lock, XCircle } from "lucide-react";

const badges = [
  { icon: Shield, label: "Free to Join" },
  { icon: Clock, label: "5min Setup" },
  { icon: Lock, label: "Data Safe" },
  { icon: XCircle, label: "Cancel Anytime" },
];

const CTA = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Waitlist signup:", email);
    setEmail("");
  };

  return (
    <section className="py-20 lg:py-32 bg-surface">
      <div className="px-5 lg:px-10 max-w-[1280px] mx-auto text-center">
        <h2 className="font-headline text-4xl sm:text-5xl mb-6 tracking-tight">
          Stop pitching.
          <br />
          Start <span className="text-accent italic">proving</span>.
        </h2>
        <p className="text-muted-foreground text-lg max-w-[460px] mx-auto mb-10 leading-relaxed">
          Your next discovery call deserves data-backed proof. Join the waitlist and get early access.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-[480px] mx-auto mb-8"
        >
          <input
            type="email"
            placeholder="you@agency.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 h-12 px-4 bg-background border border-border rounded-input text-foreground placeholder:text-muted-foreground text-sm font-body focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-all duration-200"
          />
          <button
            type="submit"
            className="h-12 px-8 bg-accent text-accent-foreground font-mono text-xs uppercase tracking-widest rounded-button hover:brightness-110 active:scale-[0.98] transition-all duration-200 whitespace-nowrap"
          >
            Join Waitlist
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-6">
          {badges.map((b) => (
            <div
              key={b.label}
              className="flex items-center gap-2 text-muted-foreground text-xs font-mono"
            >
              <b.icon className="w-3.5 h-3.5" />
              {b.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CTA;
