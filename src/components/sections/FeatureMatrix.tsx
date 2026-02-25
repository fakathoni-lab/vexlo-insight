import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const features = [
  {
    name: "Instant Proof Engine",
    does: "Generate visual proof kerentanan SEO prospek dalam <30 detik dari data publik.",
    why: "Anda tidak perlu akses GA4 atau GSC. Masuk ke call dengan bukti, bukan permintaan.",
  },
  {
    name: "AI Overview Impact Visualizer",
    does: "Visualisasikan seberapa besar AI Overview Google mengambil traffic organik prospek.",
    why: "Prospek tidak tahu mereka kehilangan traffic. Anda yang pertama menunjukkannya.",
  },
  {
    name: "Closing Narrative Generator",
    does: "AI menulis closing narrative berdasarkan data proof — siap dibacakan di call.",
    why: "Ubah data mentah jadi storyline yang membuat prospek sulit menolak.",
  },
  {
    name: "Proof Score Dashboard",
    does: "Skor 0-100 yang merangkum kerentanan SEO dalam satu angka yang mudah dipahami.",
    why: "Satu angka lebih powerful dari 20 slide. Prospek langsung paham.",
  },
  {
    name: "Pitch Intelligence Archive",
    does: "Semua proof report tersimpan dan bisa diakses ulang kapan saja.",
    why: "Bangun database pitch yang tumbuh nilainya setiap bulan.",
  },
  {
    name: "White-Label Brand Vault",
    does: "Kustomisasi logo, warna, dan domain untuk setiap report yang dibuat.",
    why: "Klien melihat brand agency Anda, bukan brand VEXLO. Profesionalisme instan.",
  },
  {
    name: "Client-Facing Portal",
    does: "Portal khusus klien untuk melihat proof report dan update progress.",
    why: "Klien merasa di-handle secara profesional. Retention meningkat.",
  },
  {
    name: "Shareable Proof Link",
    does: "Setiap report punya link unik yang bisa dikirim sebelum call.",
    why: "Biarkan data 'memanaskan' percakapan sebelum Anda bicara.",
  },
  {
    name: "Domain Reseller Integration",
    does: "Domain strategis yang terdeteksi bisa langsung diamankan dari VEXLO.",
    why: "Revenue stream tambahan. Ketika domain 'tinggal' di VEXLO, relationship berubah dari transaksional ke custodial.",
    exclusive: true,
  },
  {
    name: "Daily Battlefield Intelligence Brief",
    does: "Briefing harian perubahan ranking, AI Overview, dan peluang pitch baru.",
    why: "Jangan pernah ketinggalan peluang. Setiap pagi, Anda tahu siapa yang harus ditelepon.",
  },
];

const FeatureMatrix = () => {
  return (
    <section className="landing-section">
      <p className="section-label">Proof Arsenal</p>
      <h2 className="font-headline text-3xl sm:text-4xl mb-16 tracking-tight" style={{ color: "var(--text)" }}>
        10 senjata untuk{" "}
        <span className="italic" style={{ color: "rgba(240,240,238,0.42)" }}>menutup deal.</span>
      </h2>

      <div className="grid sm:grid-cols-2 gap-4">
        {features.map((f) => (
          <FeatureCard key={f.name} feature={f} />
        ))}
      </div>
    </section>
  );
};

function FeatureCard({ feature }: { feature: typeof features[number] }) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className="rounded-[var(--radii-outer)] p-5 transition-colors duration-200"
        style={{
          backgroundColor: "var(--bg-card)",
          border: feature.exclusive
            ? "1px solid rgba(232,255,71,0.3)"
            : "1px solid var(--border)",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-headline text-base" style={{ color: "var(--text)" }}>
                {feature.name}
              </h3>
              {feature.exclusive && (
                <span
                  className="font-mono text-[7px] uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "rgba(232,255,71,0.15)", color: "var(--accent-proof)" }}
                >
                  Exclusive Moat
                </span>
              )}
            </div>
            <p className="font-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: "var(--accent)" }}>
              Apa yang dilakukan
            </p>
            <p className="font-body text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>
              {feature.does}
            </p>
          </div>
          <CollapsibleTrigger asChild>
            <button
              className="shrink-0 mt-1 p-1.5 rounded transition-colors duration-200 hover:bg-[rgba(255,255,255,0.05)]"
              aria-label="Toggle detail"
            >
              <ChevronDown
                className="w-4 h-4 transition-transform duration-200"
                style={{
                  color: "var(--text-muted)",
                  transform: open ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent>
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="font-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: "var(--accent-success)" }}>
              Mengapa penting
            </p>
            <p className="font-body text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>
              {feature.why}
            </p>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export default FeatureMatrix;
