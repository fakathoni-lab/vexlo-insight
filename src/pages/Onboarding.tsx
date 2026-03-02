import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowRight, Sparkles, Building2, Rocket } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SEO from "@/components/SEO";

/* ── Step 2 schema ── */
const agencySchema = z.object({
  agency_name: z.string().min(1, "Agency name is required").max(100),
  brand_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#ff6308"),
});
type AgencyData = z.infer<typeof agencySchema>;

/* ── Step 3 schema ── */
const proofSchema = z.object({
  domain: z
    .string()
    .min(3, "Enter domain without https://")
    .max(253)
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/, "Enter domain without https://"),
  keyword: z.string().trim().min(2, "Keyword must be at least 2 characters").max(100),
});
type ProofData = z.infer<typeof proofSchema>;

/* ── Dot indicator ── */
const StepDots = ({ current, total }: { current: number; total: number }) => (
  <div className="flex items-center gap-2">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className="rounded-full transition-all duration-300"
        style={{
          width: i === current ? 24 : 8,
          height: 8,
          backgroundColor: i === current ? "var(--accent)" : "var(--border-strong)",
        }}
      />
    ))}
  </div>
);

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  /* Agency form */
  const {
    register: regAgency,
    handleSubmit: handleAgency,
    formState: { errors: agencyErrors },
  } = useForm<AgencyData>({ resolver: zodResolver(agencySchema), defaultValues: { brand_color: "#ff6308" } });

  /* Proof form */
  const {
    register: regProof,
    handleSubmit: handleProof,
    formState: { errors: proofErrors },
  } = useForm<ProofData>({ resolver: zodResolver(proofSchema) });

  const inputClass =
    "h-10 bg-[var(--bg)] border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] font-body text-sm rounded-[var(--radii-inner)] focus-visible:ring-[var(--accent)] focus-visible:ring-1 focus-visible:ring-offset-0";
  const labelClass = "font-mono text-[10px] uppercase tracking-widest text-[var(--text-dim)]";

  /* Save agency & advance */
  const onSaveAgency = async (data: AgencyData) => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ agency_name: data.agency_name, brand_color: data.brand_color, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setStep(2);
  };

  /* Create first proof */
  const onCreateProof = async (data: ProofData) => {
    if (!user) return;
    setSaving(true);

    // Mark onboarding complete
    await supabase.from("profiles").update({ onboarding_completed: true } as any).eq("id", user.id);

    // Insert proof
    const { data: proofRow, error } = await (supabase
      .from("proofs")
      .insert({ user_id: user.id, domain: data.domain, keyword: data.keyword, score: 0, status: "pending" } as any)
      .select("id")
      .single() as any);

    setSaving(false);
    if (error || !proofRow) { toast.error("Failed to create proof"); return; }
    navigate(`/dashboard/proof/${proofRow.id}`);
  };

  /* Skip to dashboard */
  const skipToDashboard = async () => {
    if (!user) return;
    await supabase.from("profiles").update({ onboarding_completed: true } as any).eq("id", user.id);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ backgroundColor: "var(--bg)" }}>
      <SEO title="Welcome to VEXLO" description="Set up your account and generate your first proof report." />

      <div
        className="w-full max-w-[480px] rounded-[var(--radii-outer)] border border-[var(--border)] p-8 md:p-10 relative overflow-hidden"
        style={{ backgroundColor: "var(--bg-card)" }}
      >
        {/* Ambient glow */}
        <div
          className="absolute -top-32 -right-32 w-64 h-64 rounded-full opacity-[0.07] pointer-events-none"
          style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)" }}
        />

        {/* Logo */}
        <a href="/" className="block font-mono text-[13px] uppercase tracking-widest text-center mb-6" style={{ color: "var(--text)" }}>
          Vexlo
        </a>

        {/* Dots */}
        <div className="flex justify-center mb-8">
          <StepDots current={step} total={3} />
        </div>

        {/* ── Step 0: Welcome ── */}
        {step === 0 && (
          <div className="flex flex-col items-center text-center gap-6 animate-in fade-in duration-300">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,99,8,0.1)", border: "1px solid rgba(255,99,8,0.2)" }}
            >
              <Sparkles className="w-7 h-7" style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <h1 className="font-headline text-2xl mb-2" style={{ color: "var(--text)" }}>
                Welcome to VEXLO
              </h1>
              <p className="font-body text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>
                You're about to generate your first Sales Proof Report. Let's set up your agency profile so your reports look professional from day one.
              </p>
            </div>
            <Button
              onClick={() => setStep(1)}
              className="w-full h-10 rounded-[100px] font-mono text-[10px] uppercase tracking-widest bg-[var(--text)] text-[var(--bg)] hover:brightness-95 active:scale-[0.98] transition-all duration-200"
              style={{ boxShadow: "var(--emboss-shadow), var(--inset-shadow)" }}
            >
              Get Started <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        )}

        {/* ── Step 1: Agency ── */}
        {step === 1 && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="flex flex-col items-center text-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(255,99,8,0.1)", border: "1px solid rgba(255,99,8,0.2)" }}
              >
                <Building2 className="w-5 h-5" style={{ color: "var(--accent)" }} />
              </div>
              <h2 className="font-headline text-xl" style={{ color: "var(--text)" }}>
                Your Agency
              </h2>
              <p className="font-body text-sm" style={{ color: "var(--text-dim)" }}>
                This appears on proof reports you share with prospects.
              </p>
            </div>

            <form onSubmit={handleAgency(onSaveAgency)} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label className={labelClass}>Agency Name</Label>
                <Input placeholder="Acme Digital Marketing" {...regAgency("agency_name")} className={inputClass} disabled={saving} />
                {agencyErrors.agency_name && (
                  <p className="text-xs font-body" style={{ color: "hsl(0,80%,60%)" }}>{agencyErrors.agency_name.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className={labelClass}>Brand Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    {...regAgency("brand_color")}
                    className="w-10 h-10 rounded-[var(--radii-inner)] border border-[var(--border)] cursor-pointer bg-transparent p-0.5"
                  />
                  <Input placeholder="#ff6308" {...regAgency("brand_color")} className={`${inputClass} max-w-[140px]`} disabled={saving} />
                </div>
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="w-full h-10 rounded-[100px] font-mono text-[10px] uppercase tracking-widest bg-[var(--text)] text-[var(--bg)] hover:brightness-95 active:scale-[0.98] transition-all duration-200"
                style={{ boxShadow: "var(--emboss-shadow), var(--inset-shadow)" }}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-3.5 h-3.5 ml-1" /></>}
              </Button>
            </form>

            <button onClick={() => setStep(2)} className="font-body text-xs text-center transition-colors duration-200 hover:text-[var(--text)]" style={{ color: "var(--text-muted)" }}>
              Skip for now
            </button>
          </div>
        )}

        {/* ── Step 2: First Proof ── */}
        {step === 2 && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="flex flex-col items-center text-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(255,99,8,0.1)", border: "1px solid rgba(255,99,8,0.2)" }}
              >
                <Rocket className="w-5 h-5" style={{ color: "var(--accent)" }} />
              </div>
              <h2 className="font-headline text-xl" style={{ color: "var(--text)" }}>
                Generate Your First Proof
              </h2>
              <p className="font-body text-sm" style={{ color: "var(--text-dim)" }}>
                Enter a prospect's domain and a keyword they should rank for. Takes ~30 seconds.
              </p>
            </div>

            <form onSubmit={handleProof(onCreateProof)} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label className={labelClass}>Domain</Label>
                <Input placeholder="example.com — no https://" {...regProof("domain")} className={inputClass} disabled={saving} />
                {proofErrors.domain && (
                  <p className="text-xs font-body" style={{ color: "hsl(0,80%,60%)" }}>{proofErrors.domain.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className={labelClass}>Keyword</Label>
                <Input placeholder="best plumber london" {...regProof("keyword")} className={inputClass} disabled={saving} />
                {proofErrors.keyword && (
                  <p className="text-xs font-body" style={{ color: "hsl(0,80%,60%)" }}>{proofErrors.keyword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="w-full h-10 rounded-[100px] font-mono text-[10px] uppercase tracking-widest bg-[var(--text)] text-[var(--bg)] hover:brightness-95 active:scale-[0.98] transition-all duration-200"
                style={{ boxShadow: "var(--emboss-shadow), var(--inset-shadow)" }}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Proof Report"}
              </Button>
            </form>

            <button onClick={skipToDashboard} className="font-body text-xs text-center transition-colors duration-200 hover:text-[var(--text)]" style={{ color: "var(--text-muted)" }}>
              Skip — go to dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
