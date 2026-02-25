import { Shield, Zap, Lock, XCircle } from "lucide-react";
import WaitlistForm from "@/components/sections/WaitlistForm";

const badges = [
  { icon: Shield, label: "Gratis untuk mulai" },
  { icon: Zap, label: "Setup 5 menit" },
  { icon: Lock, label: "Data aman" },
  { icon: XCircle, label: "Batal kapan saja" },
];

const CTA = () => {
  return (
    <section
      id="waitlist"
      className="py-[100px] px-10 max-sm:py-[60px] max-sm:px-5"
      style={{ backgroundColor: "var(--bg-card)" }}
    >
      <div className="max-w-[1280px] mx-auto text-center">
        <h2 className="font-headline text-4xl sm:text-5xl mb-6 tracking-tight" style={{ color: "var(--text)" }}>
          Kirim Buktinya.
          <br />
          <span className="italic" style={{ color: "var(--accent)" }}>Tutup Dealnya.</span>
        </h2>
        <p className="text-lg max-w-[460px] mx-auto mb-10 leading-relaxed" style={{ color: "var(--text-dim)" }}>
          Discovery call berikutnya layak mendapat data-backed proof. Daftar sekarang dan dapatkan akses awal.
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
                fontSize: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--text-dim)",
                border: "1px solid var(--border-strong)",
                borderRadius: "100px",
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
