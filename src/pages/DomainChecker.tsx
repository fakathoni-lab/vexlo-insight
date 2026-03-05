import { useState, useCallback, FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Globe, Loader2, CheckCircle2, XCircle, Star, AlertTriangle, Trash2, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

type ErrorType = "rate_limit" | "service_unavailable" | "invalid_domain" | "network" | "generic" | null;

// ── Helpers ──

const DOMAIN_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;

function sanitizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/.*$/, "")
    .replace(/\?.*$/, "")
    .replace(/#.*$/, "");
}

function getFirstYearPrice(pricing: Record<string, DomainPricing>): number | null {
  const y1 = pricing?.["1"];
  return y1?.registration ?? null;
}

// ── Error messages ──

const ERROR_CONTENT: Record<string, { title: string; message: string; retry?: boolean }> = {
  rate_limit: {
    title: "Slow down",
    message: "You're checking domains too quickly. Please wait a moment before trying again.",
  },
  service_unavailable: {
    title: "Service unavailable",
    message: "Domain lookup is temporarily unavailable. Please try again in a moment.",
    retry: true,
  },
  network: {
    title: "Connection error",
    message: "Unable to connect. Check your connection and try again.",
    retry: true,
  },
  generic: {
    title: "Something went wrong",
    message: "An unexpected error occurred. Please try again.",
    retry: true,
  },
};

// ── Component ──

const DomainChecker = () => {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DomainResult | null>(null);
  const [error, setError] = useState<ErrorType>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleInputChange = (val: string) => {
    setDomain(val);
    if (result || error || validationError) {
      setResult(null);
      setError(null);
      setValidationError(null);
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

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/domain-check`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token ?? ""}`,
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
      const price = getFirstYearPrice(data.pricing ?? {});
      setHistory((prev) =>
        [
          {
            domain: data.domain,
            available: data.available,
            price,
            premium: data.premium ?? false,
          },
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

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: "#f0f0ee" }}
        >
          Domain Intelligence
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: "rgba(240,240,238,0.5)" }}
        >
          Check domain availability and pricing for your clients' prospects
        </p>
      </div>

      {/* Search Form */}
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
          style={{
            background: loading ? "rgba(99,102,241,0.4)" : "#6366f1",
            color: "#fff",
          }}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Checking…
            </>
          ) : (
            <>
              <Globe className="h-4 w-4 mr-2" />
              Check Domain
            </>
          )}
        </Button>
      </form>

      {/* Result */}
      {result && <ResultCard result={result} />}

      {/* Error (non-validation) */}
      {error && error !== "invalid_domain" && (
        <ErrorCard type={error} onRetry={() => checkDomain(domain)} />
      )}

      {/* Session History */}
      {history.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2
              className="text-sm font-medium"
              style={{ color: "rgba(240,240,238,0.5)" }}
            >
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
            style={{
              background: "rgba(255,255,255,0.04)",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            {history.map((h) => (
              <div
                key={h.domain}
                className="flex items-center justify-between px-4 py-2.5 text-sm"
              >
                <span className="font-medium" style={{ color: "#f0f0ee" }}>
                  {h.domain}
                </span>
                <span
                  className="flex items-center gap-2 text-xs"
                  style={{
                    color: h.available ? "#22c55e" : "#ef4444",
                  }}
                >
                  {h.available ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Available
                      {h.price != null && (
                        <span style={{ color: "rgba(240,240,238,0.4)" }}>
                          — ${h.price.toFixed(2)}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5" />
                      Taken
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coming Soon */}
      <p
        className="text-xs text-center pt-4"
        style={{ color: "rgba(240,240,238,0.25)" }}
      >
        Domain purchase and management coming soon for Agency Pro and Elite members.
      </p>
    </div>
  );
};

// ── Sub-components ──

function ResultCard({ result }: { result: DomainResult }) {
  const price = getFirstYearPrice(result.pricing ?? {});

  if (result.available && result.premium) {
    return (
      <div
        className="rounded-[20px] border p-6 space-y-2"
        style={{
          background: "rgba(255,255,255,0.04)",
          borderColor: "rgba(245,158,11,0.4)",
        }}
      >
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5" style={{ color: "#f59e0b" }} />
          <span className="font-semibold" style={{ color: "#f0f0ee" }}>
            {result.domain}
          </span>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(245,158,11,0.15)",
              color: "#f59e0b",
            }}
          >
            Premium
          </span>
        </div>
        <p className="text-sm" style={{ color: "rgba(240,240,238,0.5)" }}>
          This is a premium domain.
          {price != null && ` Price: $${price.toLocaleString()}/year (${result.currency})`}
        </p>
      </div>
    );
  }

  if (result.available) {
    return (
      <div
        className="rounded-[20px] border p-6 space-y-3"
        style={{
          background: "rgba(255,255,255,0.04)",
          borderColor: "rgba(34,197,94,0.35)",
        }}
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" style={{ color: "#22c55e" }} />
          <span className="font-semibold" style={{ color: "#f0f0ee" }}>
            {result.domain}
          </span>
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#22c55e" }}
          >
            Available
          </span>
        </div>
        {price != null && (
          <p className="text-sm" style={{ color: "rgba(240,240,238,0.5)" }}>
            Price: ${price.toFixed(2)}/year ({result.currency})
          </p>
        )}
        <a
          href={`https://www.dynadot.com/domain/search?domain=${result.domain}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: "#6366f1" }}
        >
          Register Domain <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    );
  }

  return (
    <div
      className="rounded-[20px] border p-6 space-y-2"
      style={{
        background: "rgba(255,255,255,0.04)",
        borderColor: "rgba(239,68,68,0.35)",
      }}
    >
      <div className="flex items-center gap-2">
        <XCircle className="h-5 w-5" style={{ color: "#ef4444" }} />
        <span className="font-semibold" style={{ color: "#f0f0ee" }}>
          {result.domain}
        </span>
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "#ef4444" }}
        >
          Taken
        </span>
      </div>
      <p className="text-sm" style={{ color: "rgba(240,240,238,0.5)" }}>
        This domain is registered. Try a different extension or variation.
      </p>
    </div>
  );
}

function ErrorCard({ type, onRetry }: { type: string; onRetry: () => void }) {
  const content = ERROR_CONTENT[type] ?? ERROR_CONTENT.generic;
  return (
    <div
      className="rounded-[20px] border p-6 space-y-3"
      style={{
        background: "rgba(255,255,255,0.04)",
        borderColor: "rgba(245,158,11,0.3)",
      }}
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5" style={{ color: "#f59e0b" }} />
        <span className="font-semibold" style={{ color: "#f0f0ee" }}>
          {content.title}
        </span>
      </div>
      <p className="text-sm" style={{ color: "rgba(240,240,238,0.5)" }}>
        {content.message}
      </p>
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
