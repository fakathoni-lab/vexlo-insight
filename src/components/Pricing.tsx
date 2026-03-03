import { useEffect, useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  usePolarCheckout,
  POLAR_PRODUCT_STARTER,
  POLAR_PRODUCT_AGENCY_PRO,
  POLAR_PRODUCT_AGENCY_ELITE,
} from "@/hooks/usePolarCheckout";
import { supabase } from "@/integrations/supabase/client";

interface Tier {
  name: string;
  price: string;
  desc: string;
  featured?: boolean;
  features: { label: string; included: boolean }[];
  cta: string;
  planKey: string;
  productId: string;
}

const tiers: Tier[] = [
  {
    name: "Starter",
    price: "$39",
    desc: "Solo Freelancer",
    planKey: "starter",
    productId: POLAR_PRODUCT_STARTER,
    features: [
      { label: "10 proof reports / mo", included: true },
      { label: "Branded share links", included: true },
      { label: "Proof Score", included: true },
      { label: "AI narrative", included: false },
      { label: "White-label branding", included: false },
      { label: "API access", included: false },
    ],
    cta: "Start Closing",
  },
  {
    name: "Agency Pro",
    price: "$79",
    desc: "Growing Operator",
    featured: true,
    planKey: "agency_pro",
    productId: POLAR_PRODUCT_AGENCY_PRO,
    features: [
      { label: "50 proof reports / mo", included: true },
      { label: "Branded share links", included: true },
      { label: "Proof Score", included: true },
      { label: "AI narrative", included: true },
      { label: "White-label branding", included: true },
      { label: "API access", included: false },
    ],
    cta: "Claim Founding Slot",
  },
  {
    name: "Elite",
    price: "$149",
    desc: "Scale Operator",
    planKey: "agency_elite",
    productId: POLAR_PRODUCT_AGENCY_ELITE,
    features: [
      { label: "Unlimited reports", included: true },
      { label: "Branded share links", included: true },
      { label: "Proof Score", included: true },
      { label: "AI narrative", included: true },
      { label: "White-label branding", included: true },
      { label: "API access", included: true },
    ],
    cta: "Lock Elite Access",
  },
];

const Pricing = () => {
  const { user, loading: authLoading } = useAuth();
  const { checkout, isLoading, loadingProductId } = usePolarCheckout();
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setCurrentPlan(null);
      return;
    }
    supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        setCurrentPlan(data?.plan ?? "free");
      });
  }, [user]);

  const handleTierClick = (tier: Tier) => {
    if (!user) {
      navigate("/signup");
      return;
    }
    // Same plan → do nothing (button is disabled)
    if (currentPlan === tier.planKey) return;
    // Free or different plan → checkout
    checkout(tier.productId);
  };

  const getButtonState = (tier: Tier) => {
    if (authLoading) return { disabled: true, label: tier.cta };
    if (!user) return { disabled: false, label: tier.cta };
    if (currentPlan === tier.planKey) return { disabled: true, label: "Current Plan" };
    return { disabled: false, label: tier.cta };
  };

  return (
    <section className="landing-section">
      <p className="section-label">Founding Member Pricing</p>

      {/* ROI framing */}
      <div
        className="max-w-[640px] mx-auto text-center rounded-[var(--radii-outer)] p-6 mb-16"
        style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <p className="font-body text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>
          50 founding members only. Price increases once seats are gone.
        </p>
      </div>

      <h2 className="font-headline text-3xl sm:text-4xl mb-16 tracking-tight text-center" style={{ color: "var(--text)" }}>
        Early access pricing.{" "}
        <span className="italic" style={{ color: "var(--text-dim)" }}>Locked in forever.</span>
      </h2>

      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        {tiers.map((tier) => {
          const { disabled, label } = getButtonState(tier);
          const isTierLoading = isLoading && loadingProductId === tier.productId;

          return (
            <div
              key={tier.name}
              className="p-6 rounded-[12px] flex flex-col transition-colors duration-200"
              style={{
                backgroundColor: "var(--bg-card)",
                border: tier.featured
                  ? "1px solid var(--accent-purple-border)"
                  : "1px solid var(--border)",
                transform: tier.featured ? "scale(1.02)" : undefined,
              }}
            >
              {tier.featured && (
                <span
                  className="inline-block mb-4 px-3 py-1 text-[8px] font-mono uppercase tracking-widest rounded-full self-start"
                  style={{ backgroundColor: "var(--accent)", color: "#fff" }}
                >
                  Most Popular
                </span>
              )}
              <h3 className="font-headline text-2xl mb-1" style={{ color: "var(--text)" }}>{tier.name}</h3>
              <p className="text-sm mb-4" style={{ color: "var(--text-dim)" }}>{tier.desc}</p>
              <div className="mb-6">
                <span className="font-headline text-4xl" style={{ color: "var(--text)" }}>{tier.price}</span>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>/mo</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((f) => (
                  <li key={f.label} className="flex items-center gap-2 text-sm">
                    {f.included ? (
                      <Check className="w-4 h-4 shrink-0" style={{ color: "var(--accent)" }} />
                    ) : (
                      <X className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} />
                    )}
                    <span style={{ color: f.included ? "var(--text)" : "var(--text-muted)" }}>
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleTierClick(tier)}
                disabled={disabled || isTierLoading}
                className={tier.featured ? "btn-primary w-full text-center" : "btn-ghost w-full text-center"}
                style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
              >
                {isTierLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing…
                  </span>
                ) : (
                  label
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Pay-Per-Proof */}
      <div
        className="max-w-[400px] mx-auto text-center rounded-[var(--radii-outer)] p-5"
        style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <p className="font-mono text-[9px] uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
          Or pay per proof
        </p>
        <p className="font-headline text-2xl" style={{ color: "var(--text)" }}>
          $12<span className="text-sm" style={{ color: "var(--text-muted)" }}> / proof</span>
        </p>
        <p className="font-body text-xs mt-1" style={{ color: "var(--text-dim)" }}>
          No subscription. Pay only when you need it.
        </p>
      </div>
    </section>
  );
};

export default Pricing;
