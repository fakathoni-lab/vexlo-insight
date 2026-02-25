import { Shield, Clock, Lock, XCircle } from "lucide-react";
import WaitlistForm from "@/components/sections/WaitlistForm";

const badges = [
  { icon: Shield, label: "Free to Join" },
  { icon: Clock, label: "5min Setup" },
  { icon: Lock, label: "Data Safe" },
  { icon: XCircle, label: "Cancel Anytime" },
];

const CTA = () => {
  return (
    <section
      id="waitlist"
      className="py-[100px] px-10 max-sm:py-[60px] max-sm:px-5"
      style={{ backgroundColor: '#0d0d0d' }}
    >
      <div className="max-w-[1280px] mx-auto text-center">
        <h2 className="font-headline text-4xl sm:text-5xl mb-6 tracking-tight">
          Stop pitching.
          <br />
          Start <span className="text-accent italic">proving</span>.
        </h2>
        <p className="text-muted-foreground text-lg max-w-[460px] mx-auto mb-10 leading-relaxed">
          Your next discovery call deserves data-backed proof. Join the waitlist and get early access.
        </p>

        <div className="flex justify-center mb-8">
          <WaitlistForm source="footer_cta" />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          {badges.map((b) => (
            <div
              key={b.label}
              className="flex items-center gap-2 font-mono px-4 py-2"
              style={{
                fontSize: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'rgba(240,240,238,0.45)',
                border: '1px solid rgba(255,255,255,0.13)',
                borderRadius: '100px',
              }}
            >
              <b.icon className="w-3 h-3" />
              {b.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CTA;
