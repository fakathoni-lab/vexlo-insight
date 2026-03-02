import { useState } from "react";
import { Search, Globe, CheckCircle2, XCircle, Loader2, Crown, Database, Radio } from "lucide-react";
import { useDomainCheck } from "@/hooks/useDomainCheck";
import SEO from "@/components/SEO";

const DomainSearch = () => {
  const [input, setInput] = useState("");
  const { data, isLoading, error, checkDomain } = useDomainCheck();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    checkDomain(trimmed);
  };

  const ttlMinutes = data ? Math.max(1, Math.round(data.ttl / 60)) : 0;

  return (
    <div className="max-w-[720px] mx-auto space-y-6">
      <SEO
        title="Domain Search — VEXLO"
        description="Check domain availability and pricing."
        canonical="https://vexloai.com/dashboard/domains"
      />

      <div>
        <h1 className="font-headline" style={{ fontSize: 28, color: "var(--text)" }}>
          Domain Search
        </h1>
        <p
          className="font-body font-light mt-1"
          style={{ fontSize: 13, color: "var(--text-dim)" }}
        >
          Check availability and multi-year pricing instantly.
        </p>
      </div>

      {/* Search Card */}
      <form onSubmit={handleSubmit}>
        <div
          className="rounded-[var(--radii-outer)] border p-5 transition-[border-color] duration-200 focus-within:border-[var(--accent-purple-border)]"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="example.com"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none font-body placeholder:text-[var(--text-muted)]"
              style={{ fontSize: 15, color: "var(--text)", caretColor: "var(--accent-purple)" }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="h-10 px-5 rounded-[100px] font-mono text-[10px] uppercase tracking-widest transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              style={{
                backgroundColor: "var(--text)",
                color: "var(--bg)",
                boxShadow: "var(--emboss-shadow), var(--inset-shadow)",
              }}
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
              Check
            </button>
          </div>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div
          className="rounded-[var(--radii-outer)] border p-5 flex items-start gap-3"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "rgba(239,68,68,0.25)",
          }}
        >
          <XCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--accent-danger)" }} />
          <p className="font-body text-sm" style={{ color: "var(--accent-danger)" }}>
            {error}
          </p>
        </div>
      )}

      {/* Results */}
      {data && (
        <div className="space-y-4">
          {/* Availability Banner */}
          <div
            className="rounded-[var(--radii-outer)] border p-6 flex items-center gap-4"
            style={{
              backgroundColor: "var(--bg-card)",
              borderColor: data.available
                ? "rgba(71,255,143,0.25)"
                : "rgba(239,68,68,0.25)",
            }}
          >
            {data.available ? (
              <CheckCircle2 className="w-6 h-6 shrink-0" style={{ color: "var(--accent-success)" }} />
            ) : (
              <XCircle className="w-6 h-6 shrink-0" style={{ color: "var(--accent-danger)" }} />
            )}
            <div className="flex-1">
              <p className="font-body font-medium" style={{ fontSize: 16, color: "var(--text)" }}>
                {data.domain}
              </p>
              <p className="font-body font-light" style={{ fontSize: 13, color: "var(--text-dim)" }}>
                {data.available ? "This domain is available!" : "This domain is already taken."}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {data.premium && (
                <span
                  className="flex items-center gap-1.5 font-mono uppercase text-[9px] tracking-widest px-3 py-1 rounded-full border"
                  style={{
                    color: "var(--accent)",
                    borderColor: "var(--accent-border)",
                    backgroundColor: "var(--accent-dim)",
                  }}
                >
                  <Crown className="w-3 h-3" />
                  Premium
                </span>
              )}
            </div>
          </div>

          {/* Source indicator */}
          <div className="flex items-center gap-2 px-1">
            {data.source === "cache" ? (
              <Database className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
            ) : (
              <Radio className="w-3 h-3" style={{ color: "var(--accent-success)" }} />
            )}
            <span
              className="font-mono uppercase tracking-widest"
              style={{ fontSize: 9, color: "var(--text-muted)" }}
            >
              {data.source === "cache"
                ? `Cached result · refreshes in ${ttlMinutes} min`
                : "Live result"}
            </span>
          </div>

          {/* Pricing Table */}
          {data.available && data.pricing && (
            <div
              className="rounded-[var(--radii-outer)] border overflow-hidden"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border)",
              }}
            >
              <div
                className="px-5 py-3 border-b"
                style={{ borderColor: "var(--border)" }}
              >
                <span
                  className="font-mono uppercase tracking-wide"
                  style={{ fontSize: 9, color: "var(--text-muted)" }}
                >
                  Pricing ({data.currency})
                </span>
              </div>

              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {Object.entries(data.pricing).map(([years, prices]) => (
                  <div
                    key={years}
                    className="px-5 py-4 flex items-center justify-between hover:bg-[rgba(255,255,255,0.02)] transition-colors duration-150"
                  >
                    <div>
                      <span className="font-body" style={{ fontSize: 14, color: "var(--text)" }}>
                        {years} {Number(years) === 1 ? "Year" : "Years"}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p
                          className="font-mono uppercase tracking-wide"
                          style={{ fontSize: 8, color: "var(--text-muted)" }}
                        >
                          Registration
                        </p>
                        <p className="font-headline" style={{ fontSize: 20, color: "var(--text)" }}>
                          ${prices.registration.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className="font-mono uppercase tracking-wide"
                          style={{ fontSize: 8, color: "var(--text-muted)" }}
                        >
                          Renewal
                        </p>
                        <p
                          className="font-headline"
                          style={{ fontSize: 20, color: "var(--text-dim)" }}
                        >
                          ${prices.renewal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DomainSearch;
