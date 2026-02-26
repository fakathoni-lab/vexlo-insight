import { Check, X } from "lucide-react";

const rows = [
  { feature: "No login / access needed", vexlo: true, diy: false, tool: false },
  { feature: "Branded shareable reports", vexlo: true, diy: false, tool: false },
  { feature: "Proof Score (0-100)", vexlo: true, diy: false, tool: false },
  { feature: "AI-generated sales narrative", vexlo: true, diy: false, tool: false },
  { feature: "AI Overview detection", vexlo: true, diy: false, tool: true },
  { feature: "Ready in under 30 seconds", vexlo: true, diy: false, tool: true },
  { feature: "White-label for agencies", vexlo: true, diy: false, tool: true },
  { feature: "Built for sales, not SEOs", vexlo: true, diy: false, tool: false },
];

const Yn = ({ yes }: { yes: boolean }) =>
  yes ? (
    <Check className="w-4 h-4 text-accent mx-auto" />
  ) : (
    <X className="w-4 h-4 mx-auto" style={{ color: 'var(--text-muted)' }} />
  );

const Comparison = () => {
  return (
    <section className="landing-section">
      <p className="section-label">Compare</p>
      <h2 className="font-headline text-3xl sm:text-4xl mb-16 tracking-tight">
        How Vexlo <span className="italic">stacks up</span>
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <th className="text-left py-4 pr-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Feature</th>
              <th className="py-4 px-4 font-mono text-[10px] uppercase tracking-widest text-accent text-center">Vexlo</th>
              <th className="py-4 px-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-center">DIY Manual</th>
              <th className="py-4 pl-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-center">Generic Tool</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.feature} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td className="py-4 pr-4 text-foreground">{r.feature}</td>
                <td className="py-4 px-4"><Yn yes={r.vexlo} /></td>
                <td className="py-4 px-4"><Yn yes={r.diy} /></td>
                <td className="py-4 pl-4"><Yn yes={r.tool} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Comparison;
