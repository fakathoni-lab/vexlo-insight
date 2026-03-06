import { useState, useCallback, useEffect, FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Globe, Loader2, CheckCircle2, XCircle, Star, AlertTriangle,
  Trash2, Shield, Lock, Building2, ArrowRight, X, RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

// ── Types ──

interface DomainPricing {
  registration: number;
  renewal: number;
}

interface DomainResult {
  success: boolean;
  domain: string;
  available: boolean;
  premium: boolean;
  pricing: Record<string, DomainPricing>;
  currency: string;
  checked_at: string;
  source: "cache" | "live";
  ttl: number;
}

interface HistoryItem {
  domain: string;
  available: boolean;
  price: number | null;
  premium: boolean;
}

interface OwnedDomain {
  id: string;
  domain_name: string;
  status: string;
  expires_at: string | null;
  auto_renew: boolean;
  registered_at: string;
}

interface RegistrationSuccess {
  domain: string;
  expires_at: string;
}

type ErrorType = "rate_limit" | "service_unavailable" | "invalid_domain" | "network" | "generic" | null;
type ModalView = "checkout" | "upgrade" | null;

// ── Helpers ──

const DOMAIN_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;

function sanitizeDomain(input: string): string {
  return input.trim().toLowerCase()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/.*$/, "")
    .replace(/\?.*$/, "")
    .replace(/#.*$/, "");
}

function getYearPrice(pricing: Record<string, DomainPricing>, years: number): number | null {
  const entry = pricing?.[String(years)];
  return entry?.registration ?? null;
}

const ALLOWED_PLANS = ["agency_pro", "agency_elite"];

const ERROR_CONTENT: Record<string, { title: string; message: string; retry?: boolean }> = {
  rate_limit: { title: "Slow down", message: "You're checking domains too quickly. Please wait a moment." },
  service_unavailable: { title: "Service unavailable", message: "Domain lookup is temporarily unavailable.", retry: true },
  network: { title: "Connection error", message: "Unable to connect. Check your connection and try again.", retry: true },
  generic: { title: "Something went wrong", message: "An unexpected error occurred. Please try again.", retry: true },
};

// ── Component ──

const DomainChecker = () => {
  const { profile, session } = useAuth();
  const canPurchase = ALLOWED_PLANS.includes(profile?.plan ?? "");

  // Search state
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DomainResult | null>(null);
  const [error, setError] = useState<ErrorType>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Modal state
  const [modalView, setModalView] = useState<ModalView>(null);
  const [selectedYears, setSelectedYears] = useState(2);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Post-purchase success
  const [regSuccess, setRegSuccess] = useState<RegistrationSuccess | null>(null);

  // Portfolio
  const [ownedDomains, setOwnedDomains] = useState<OwnedDomain[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);

  // ── Fetch owned domains ──
  useEffect(() => {
    if (!session) return;
    const fetchDomains = async () => {
      setPortfolioLoading(true);
      const { data } = await supabase
        .from("domains")
        .select("id, domain_name, status, expires_at, auto_renew, registered_at")
        .eq("status", "active")
        .order("registered_at", { ascending: false });
      setOwnedDomains((data as OwnedDomain[]) ?? []);
      setPortfolioLoading(false);
    };
    fetchDomains();
  }, [session, regSuccess]);

  // ── Domain search ──
  const handleInputChange = (val: string) => {
    setDomain(val);
    if (result || error || validationError || regSuccess) {
      setResult(null);
      setError(null);
      setValidationError(null);
      setRegSuccess(null);
    }
  };

  const checkDomain = useCallback(async (rawDomain: string) => {
    const sanitized = sanitizeDomain(rawDomain);
    if (!sanitized || !DOMAIN_REGEX.test(sanitized)) {
      setValidationError("Please enter a valid domain name (e.g. example.com)");
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);
    setValidationError(null);
    setRegSuccess(null);

    try {
      const { data: { session: s } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/domain-check`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${s?.access_token ?? ""}`,
          },
          body: JSON.stringify({ domain: sanitized }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) setError("rate_limit");
        else if (response.status === 503) setError("service_unavailable");
        else if (response.status === 400) setError("invalid_domain");
        else setError("generic");
        return;
      }

      setResult(data as DomainResult);
      const price = getYearPrice(data.pricing ?? {}, 1);
      setHistory((prev) =>
        [
          { domain: data.domain, available: data.available, price, premium: data.premium ?? false },
          ...prev.filter((h: HistoryItem) => h.domain !== data.domain),
        ].slice(0, 5)
      );
    } catch {
      setError("network");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!domain.trim() || loading) return;
    checkDomain(domain);
  };

  // ── Secure Position click ──
  const handleSecureClick = () => {
    if (canPurchase) {
      setSelectedYears(2);
      setRegisterError(null);
      setModalView("checkout");
    } else {
      setModalView("upgrade");
    }
  };

  // ── Register domain ──
  const handleRegister = async () => {
    if (!result || registering) return;
    setRegistering(true);
    setRegisterError(null);

    try {
      const { data: { session: s } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/domain-register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${s?.access_token ?? ""}`,
          },
          body: JSON.stringify({ domain: result.domain, years: selectedYears }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setRegisterError(data.message ?? "Registration failed. Please try again.");
        return;
      }

      setModalView(null);
      setResult(null);
      setRegSuccess({ domain: data.domain, expires_at: data.expires_at });
    } catch {
      setRegisterError("Unable to connect. Check your connection and try again.");
    } finally {
      setRegistering(false);
    }
  };

  // ── Upgrade click ──
  const handleUpgrade = async () => {
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("polar-checkout", {
        body: { plan: "agency_pro" },
      });
      if (!fnErr && data?.url) {
        window.location.href = data.url;
      }
    } catch { /* ignore */ }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#f0f0ee" }}>
          Domain Intelligence
        </h1>
        <p className="text-sm mt-1" style={{ color: "rgba(240,240,238,0.5)" }}>
          Check availability and secure infrastructure positions for your clients
        </p>
      </div>

      {/* Search Form */}
      {!regSuccess && (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              value={domain}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter domain (e.g. example.com)"
              maxLength={253}
              disabled={loading}
              className="h-11 bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-[#f0f0ee] placeholder:text-[rgba(240,240,238,0.3)] focus-visible:ring-[#6366f1]"
            />
            {(validationError || error === "invalid_domain") && (
              <p className="text-xs mt-1.5" style={{ color: "#ef4444" }}>
                {validationError ?? "Please enter a valid domain name (e.g. example.com)"}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={loading || !domain.trim()}
            className="h-11 px-6 font-semibold rounded-[10px] sm:w-auto w-full"
            style={{ background: loading ? "rgba(99,102,241,0.4)" : "#6366f1", color: "#fff" }}
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Checking…</>
            ) : (
              <><Globe className="h-4 w-4 mr-2" />Check Domain</>
            )}
          </Button>
        </form>
      )}

      {/* Result */}
      {result && (
        <ResultCard result={result} onSecure={handleSecureClick} />
      )}

      {/* Error (non-validation) */}
      {error && error !== "invalid_domain" && (
        <ErrorCard type={error} onRetry={() => checkDomain(domain)} />
      )}

      {/* Registration Success */}
      {regSuccess && (
        <SuccessPanel
          domain={regSuccess.domain}
          expiresAt={regSuccess.expires_at}
          onCheckAnother={() => { setRegSuccess(null); setDomain(""); }}
        />
      )}

      {/* Session History */}
      {history.length > 0 && !regSuccess && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium" style={{ color: "rgba(240,240,238,0.5)" }}>
              Recent checks
            </h2>
            <button
              onClick={() => setHistory([])}
              className="flex items-center gap-1 text-xs transition-colors hover:opacity-80"
              style={{ color: "rgba(240,240,238,0.35)" }}
            >
              <Trash2 className="h-3 w-3" /> Clear
            </button>
          </div>
          <div
            className="rounded-[14px] border divide-y overflow-hidden"
            style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            {history.map((h) => (
              <div key={h.domain} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="font-medium" style={{ color: "#f0f0ee" }}>{h.domain}</span>
                <span className="flex items-center gap-2 text-xs" style={{ color: h.available ? "#22c55e" : "#ef4444" }}>
                  {h.available ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />Available
                      {h.price != null && <span style={{ color: "rgba(240,240,238,0.4)" }}>— ${h.price.toFixed(2)}</span>}
                    </>
                  ) : (
                    <><XCircle className="h-3.5 w-3.5" />Taken</>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Portfolio */}
      {!portfolioLoading && ownedDomains.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "rgba(240,240,238,0.4)" }}>
            Active Infrastructure Positions
          </h2>
          <div className="space-y-2">
            {ownedDomains.map((d) => (
              <div
                key={d.id}
                className="rounded-[16px] border p-4 flex items-center justify-between"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm" style={{ color: "#f0f0ee" }}>{d.domain_name}</span>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}
                    >
                      Active
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: "rgba(240,240,238,0.4)" }}>
                    {d.expires_at && (
                      <span>Expires: {new Date(d.expires_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                    )}
                    <span>Auto-renew: {d.auto_renew ? "ON" : "OFF"}</span>
                  </div>
                </div>
                <span className="text-xs" style={{ color: "rgba(240,240,238,0.3)" }}>
                  DNS management coming soon
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      {!canPurchase && (
        <p className="text-xs text-center pt-4" style={{ color: "rgba(240,240,238,0.25)" }}>
          Domain infrastructure available for Agency Pro and Elite members.
        </p>
      )}

      {/* ── Checkout Modal ── */}
      <Dialog open={modalView === "checkout"} onOpenChange={(o) => !o && setModalView(null)}>
        <DialogContent
          className="sm:max-w-md border"
          style={{ background: "#0d0d1a", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-bold" style={{ color: "#f0f0ee" }}>
              Secure Infrastructure Position
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            <div>
              <div className="text-sm" style={{ color: "rgba(240,240,238,0.5)" }}>Domain</div>
              <div className="font-semibold text-base" style={{ color: "#f0f0ee" }}>{result?.domain}</div>
              <div className="text-xs mt-0.5" style={{ color: "rgba(240,240,238,0.35)" }}>
                Available — act before a competitor does
              </div>
            </div>

            {/* Duration selector */}
            <div className="space-y-2">
              <div className="text-sm font-medium" style={{ color: "rgba(240,240,238,0.6)" }}>Duration</div>
              {[
                { y: 1, label: "Domain Position" },
                { y: 2, label: "Defense Layer" },
                { y: 3, label: "Infrastructure Lock" },
              ].map(({ y, label }) => {
                const price = result ? getYearPrice(result.pricing, y) : null;
                const isSelected = selectedYears === y;
                return (
                  <button
                    key={y}
                    onClick={() => setSelectedYears(y)}
                    className="w-full flex items-center justify-between rounded-[12px] border px-4 py-3 text-left transition-all"
                    style={{
                      background: isSelected ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.02)",
                      borderColor: isSelected ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                        style={{ borderColor: isSelected ? "#6366f1" : "rgba(255,255,255,0.2)" }}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full" style={{ background: "#6366f1" }} />
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-medium" style={{ color: "#f0f0ee" }}>
                          {y}-Year — {label}
                        </span>
                        {y === 2 && (
                          <span
                            className="ml-2 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                            style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8" }}
                          >
                            Recommended
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-semibold text-sm" style={{ color: "#f0f0ee" }}>
                      {price != null ? `$${price.toFixed(2)}` : "—"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="text-xs" style={{ color: "rgba(240,240,238,0.3)" }}>
              Managed via your VEXLO subscription. Domain management included.
              Auto-renewal configurable. Transfer-out available anytime.
            </div>

            {registerError && (
              <div className="rounded-[10px] border px-4 py-3 text-sm" style={{ borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}>
                {registerError}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Button
                onClick={() => setModalView(null)}
                variant="outline"
                className="flex-1 border-[rgba(255,255,255,0.1)] text-[#f0f0ee] hover:bg-[rgba(255,255,255,0.06)]"
                disabled={registering}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRegister}
                disabled={registering}
                className="flex-1 font-semibold rounded-[10px]"
                style={{ background: registering ? "rgba(99,102,241,0.4)" : "#6366f1", color: "#fff" }}
              >
                {registering ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Securing position…</>
                ) : (
                  <><Shield className="h-4 w-4 mr-2" />Secure This Domain</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Upgrade Modal ── */}
      <Dialog open={modalView === "upgrade"} onOpenChange={(o) => !o && setModalView(null)}>
        <DialogContent
          className="sm:max-w-md border"
          style={{ background: "#0d0d1a", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-bold" style={{ color: "#f0f0ee" }}>
              Domain Infrastructure is an Agency Pro Feature
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm" style={{ color: "rgba(240,240,238,0.5)" }}>
              Upgrade to Agency Pro ($79/mo) to:
            </p>
            <ul className="space-y-2">
              {[
                "Register and manage domains through VEXLO",
                "Show secured domains in client proof reports",
                "Protect client keyword territory",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm" style={{ color: "rgba(240,240,238,0.6)" }}>
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#6366f1" }} />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => setModalView(null)}
                variant="outline"
                className="flex-1 border-[rgba(255,255,255,0.1)] text-[#f0f0ee] hover:bg-[rgba(255,255,255,0.06)]"
              >
                Not now
              </Button>
              <Button
                onClick={handleUpgrade}
                className="flex-1 font-semibold rounded-[10px]"
                style={{ background: "#6366f1", color: "#fff" }}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Upgrade to Agency Pro
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ── Sub-components ──

function ResultCard({ result, onSecure }: { result: DomainResult; onSecure: () => void }) {
  const p1 = getYearPrice(result.pricing, 1);
  const p2 = getYearPrice(result.pricing, 2);
  const p3 = getYearPrice(result.pricing, 3);

  if (result.available && result.premium) {
    return (
      <div className="rounded-[20px] border p-6 space-y-3" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(245,158,11,0.4)" }}>
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5" style={{ color: "#f59e0b" }} />
          <span className="font-semibold" style={{ color: "#f0f0ee" }}>{result.domain}</span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>
            Premium
          </span>
        </div>
        <p className="text-sm" style={{ color: "rgba(240,240,238,0.5)" }}>
          This is a premium domain.
          {p1 != null && ` Price: $${p1.toLocaleString()}/year (${result.currency})`}
        </p>
        <Button
          onClick={onSecure}
          className="font-semibold rounded-[10px]"
          style={{ background: "#6366f1", color: "#fff" }}
        >
          <Shield className="h-4 w-4 mr-2" /> Secure Position
        </Button>
      </div>
    );
  }

  if (result.available) {
    return (
      <div className="rounded-[20px] border p-6 space-y-3" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(34,197,94,0.35)" }}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" style={{ color: "#22c55e" }} />
          <span className="font-semibold" style={{ color: "#f0f0ee" }}>{result.domain}</span>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#22c55e" }}>Available</span>
        </div>
        <div className="text-xs uppercase tracking-wider font-medium" style={{ color: "rgba(240,240,238,0.35)" }}>
          Strategic Category: Brand Defense Position
        </div>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          {p1 != null && <span className="text-sm" style={{ color: "rgba(240,240,238,0.5)" }}>${p1.toFixed(2)}/yr</span>}
          {p2 != null && <span className="text-sm font-semibold" style={{ color: "#f0f0ee" }}>2‑year: ${p2.toFixed(2)}</span>}
          {p3 != null && <span className="text-sm" style={{ color: "rgba(240,240,238,0.5)" }}>3‑year: ${p3.toFixed(2)}</span>}
        </div>
        <Button
          onClick={onSecure}
          className="font-semibold rounded-[10px]"
          style={{ background: "#6366f1", color: "#fff" }}
        >
          <Shield className="h-4 w-4 mr-2" /> Secure Position {p2 != null && `— $${p2.toFixed(2)}`}
        </Button>
        <p className="text-xs" style={{ color: "rgba(240,240,238,0.3)" }}>
          Managed through your VEXLO account. Appears in your client proof reports automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] border p-6 space-y-2" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(239,68,68,0.35)" }}>
      <div className="flex items-center gap-2">
        <XCircle className="h-5 w-5" style={{ color: "#ef4444" }} />
        <span className="font-semibold" style={{ color: "#f0f0ee" }}>{result.domain}</span>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#ef4444" }}>Taken</span>
      </div>
      <p className="text-sm" style={{ color: "rgba(240,240,238,0.5)" }}>
        This domain is registered. Try a different extension or variation.
      </p>
    </div>
  );
}

function SuccessPanel({ domain, expiresAt, onCheckAnother }: { domain: string; expiresAt: string; onCheckAnother: () => void }) {
  return (
    <div className="rounded-[20px] border p-6 space-y-4" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(99,102,241,0.3)" }}>
      <div className="flex items-center gap-2">
        <Building2 className="h-5 w-5" style={{ color: "#6366f1" }} />
        <span className="font-bold" style={{ color: "#f0f0ee" }}>Infrastructure position secured.</span>
      </div>
      <p className="text-sm" style={{ color: "rgba(240,240,238,0.5)" }}>
        <strong style={{ color: "#f0f0ee" }}>{domain}</strong> is now registered under your VEXLO account
        and linked to your proof reports as managed infrastructure.
      </p>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-xs uppercase tracking-wider" style={{ color: "rgba(240,240,238,0.35)" }}>Registered</div>
          <div style={{ color: "#f0f0ee" }}>{domain}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider" style={{ color: "rgba(240,240,238,0.35)" }}>Expires</div>
          <div style={{ color: "#f0f0ee" }}>
            {new Date(expiresAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider" style={{ color: "rgba(240,240,238,0.35)" }}>Status</div>
          <div style={{ color: "#22c55e" }}>Active</div>
        </div>
      </div>
      <p className="text-xs" style={{ color: "rgba(240,240,238,0.3)" }}>
        This domain now appears in your client proof reports as an agency-managed infrastructure asset.
      </p>
      <div className="flex gap-3 pt-1">
        <Button
          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}
          variant="outline"
          className="border-[rgba(255,255,255,0.1)] text-[#f0f0ee] hover:bg-[rgba(255,255,255,0.06)]"
        >
          View My Domains
        </Button>
        <Button
          onClick={onCheckAnother}
          className="font-semibold rounded-[10px]"
          style={{ background: "#6366f1", color: "#fff" }}
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Check Another Domain
        </Button>
      </div>
    </div>
  );
}

function ErrorCard({ type, onRetry }: { type: string; onRetry: () => void }) {
  const content = ERROR_CONTENT[type] ?? ERROR_CONTENT.generic;
  return (
    <div className="rounded-[20px] border p-6 space-y-3" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(245,158,11,0.3)" }}>
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5" style={{ color: "#f59e0b" }} />
        <span className="font-semibold" style={{ color: "#f0f0ee" }}>{content.title}</span>
      </div>
      <p className="text-sm" style={{ color: "rgba(240,240,238,0.5)" }}>{content.message}</p>
      {content.retry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="border-[rgba(255,255,255,0.1)] text-[#f0f0ee] hover:bg-[rgba(255,255,255,0.06)]"
        >
          Try again
        </Button>
      )}
    </div>
  );
}

export default DomainChecker;
