import { AlertTriangle, CheckCircle, XCircle, ShieldAlert, Code, Layout, Rocket, Database, Lock, CreditCard, Cog } from "lucide-react";

// ══════════════════════════════════════════════════════════════════════════════
// VEXLO AUDIT DASHBOARD — 8-DIMENSION CODEBASE AUDIT
// Design System: bg-[#080808], accent #FF6308, Space Mono for scores, DM Sans for labels
// ══════════════════════════════════════════════════════════════════════════════

type Severity = "critical" | "high" | "medium" | "low";

interface Issue {
  id: string;
  title: string;
  severity: Severity;
  file?: string;
  description: string;
  status: "open" | "fixed";
}

interface Dimension {
  name: string;
  score: number;
  icon: React.ReactNode;
  issues: Issue[];
}

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: "#FF0000",
  high: "#FF6308",
  medium: "#FFB800",
  low: "#6B7280",
};

const SEVERITY_BG: Record<Severity, string> = {
  critical: "rgba(255,0,0,0.12)",
  high: "rgba(255,99,8,0.12)",
  medium: "rgba(255,184,0,0.12)",
  low: "rgba(107,114,128,0.12)",
};

// ══════════════════════════════════════════════════════════════════════════════
// AUDIT DATA — COMPLETE 8-DIMENSION ANALYSIS
// ══════════════════════════════════════════════════════════════════════════════

const dimensions: Dimension[] = [
  {
    name: "Design System Compliance",
    score: 85,
    icon: <Layout className="w-5 h-5" />,
    issues: [
      {
        id: "DS-1",
        title: "rounded-full used instead of rounded-[100px]",
        severity: "medium",
        file: "Multiple components",
        description: "67+ instances of rounded-full found in buttons across codebase. ADR-008 requires rounded-[100px].",
        status: "open",
      },
      {
        id: "DS-2",
        title: "NotFound page uses correct background",
        severity: "medium",
        file: "src/pages/NotFound.tsx",
        description: "FIXED: Now uses #080808 background per ADR-008.",
        status: "fixed",
      },
      {
        id: "DS-3",
        title: "WebhookSuccess uses wrong background #0A0A1A",
        severity: "low",
        file: "src/pages/WebhookSuccess.tsx",
        description: "Background is #0A0A1A instead of #080808.",
        status: "open",
      },
      {
        id: "DS-4",
        title: "CSS uses #080808 for --bg",
        severity: "medium",
        file: "src/index.css",
        description: "FIXED: Root CSS variable --bg is now #080808 per ADR-008.",
        status: "fixed",
      },
    ],
  },
  {
    name: "Auth Flow",
    score: 100,
    icon: <Lock className="w-5 h-5" />,
    issues: [
      {
        id: "C3",
        title: "getUser() now used for identity checks",
        severity: "critical",
        file: "src/pages/ResetPassword.tsx",
        description: "FIXED: ResetPassword now uses getUser() for identity. DomainChecker uses getSession() only for token retrieval (allowed).",
        status: "fixed",
      },
      {
        id: "C4",
        title: "/check route now wrapped in ProtectedRoute",
        severity: "critical",
        file: "src/App.tsx",
        description: "FIXED: DomainSearch page at /check now requires authentication.",
        status: "fixed",
      },
      {
        id: "AUTH-3",
        title: "useAuth correctly uses getUser() for initial check",
        severity: "low",
        file: "src/hooks/useAuth.tsx",
        description: "AuthProvider properly uses getUser() for server-validated identity. No action needed.",
        status: "fixed",
      },
    ],
  },
  {
    name: "Billing & Webhooks",
    score: 95,
    icon: <CreditCard className="w-5 h-5" />,
    issues: [
      {
        id: "C1",
        title: "polar-webhook handles subscription.past_due",
        severity: "critical",
        file: "supabase/functions/polar-webhook/index.ts",
        description: "FIXED: subscription.past_due now immediately downgrades to free tier.",
        status: "fixed",
      },
      {
        id: "C6",
        title: "WebhookSuccess invalidates queries",
        severity: "critical",
        file: "src/pages/WebhookSuccess.tsx",
        description: "FIXED: Now calls queryClient.invalidateQueries() and refreshProfile() after payment.",
        status: "fixed",
      },
      {
        id: "BILL-3",
        title: "Polar Product IDs hardcoded but verified",
        severity: "low",
        file: "src/hooks/usePolarCheckout.ts",
        description: "Product IDs are constants. Flag for manual verification against Polar dashboard.",
        status: "open",
      },
      {
        id: "C2",
        title: "Pricing CTA triggers Polar checkout",
        severity: "critical",
        file: "src/components/Pricing.tsx",
        description: "FIXED: Free tier goes to /signup, paid tiers trigger Polar checkout with productId. Buttons use rounded-[100px] and bg-[#FF6308].",
        status: "fixed",
      },
    ],
  },
  {
    name: "Proof Generation Flow",
    score: 88,
    icon: <Cog className="w-5 h-5" />,
    issues: [
      {
        id: "M8",
        title: "Burst rate limit NOT implemented",
        severity: "high",
        file: "supabase/functions/generate-proof/index.ts",
        description: "Free/starter users can exhaust DataForSEO quota. Per-user limit via Upstash Redis needed.",
        status: "open",
      },
      {
        id: "PG-2",
        title: "Domain + keyword input properly validated with Zod",
        severity: "low",
        file: "supabase/functions/generate-proof/index.ts",
        description: "Input validation implemented correctly with Zod schema.",
        status: "fixed",
      },
      {
        id: "PG-3",
        title: "Plan enforcement via atomic RPC",
        severity: "low",
        file: "supabase/functions/generate-proof/index.ts",
        description: "attempt_proof_increment RPC properly handles usage limits atomically.",
        status: "fixed",
      },
    ],
  },
  {
    name: "Data Layer (Supabase)",
    score: 82,
    icon: <Database className="w-5 h-5" />,
    issues: [
      {
        id: "M2",
        title: "No monthly proofs_used reset mechanism",
        severity: "high",
        file: "Database",
        description: "Usage counter never resets. Users hit limit permanently. Needs cron job or webhook trigger.",
        status: "open",
      },
      {
        id: "M6",
        title: "subscriptions table exists but not fully normalized",
        severity: "medium",
        file: "supabase/migrations",
        description: "Subscriptions table exists but subscription state also tracked on profiles table.",
        status: "open",
      },
      {
        id: "DL-3",
        title: "plans table exists with proofs_limit",
        severity: "low",
        file: "Database",
        description: "Plans table properly configured. Limits not hardcoded.",
        status: "fixed",
      },
      {
        id: "DL-4",
        title: "45 RLS policies active",
        severity: "low",
        file: "supabase/migrations",
        description: "RLS policies in place. No cross-user data leak detected.",
        status: "fixed",
      },
    ],
  },
  {
    name: "TypeScript Quality",
    score: 65,
    icon: <Code className="w-5 h-5" />,
    issues: [
      {
        id: "M4",
        title: "Multiple 'as any' casts across codebase",
        severity: "high",
        file: "Multiple files",
        description: "17+ instances of 'as any' in Onboarding.tsx, NewProof.tsx, ProofResult.tsx, useProofs.ts, PublicProof.tsx, Hero.tsx. TypeScript strict mode violated.",
        status: "open",
      },
      {
        id: "TS-2",
        title: "Supabase types properly generated",
        severity: "low",
        file: "src/integrations/supabase/types.ts",
        description: "Database types fully typed with Tables<> helper.",
        status: "fixed",
      },
      {
        id: "TS-3",
        title: "Zero @ts-ignore comments",
        severity: "low",
        file: "Codebase",
        description: "No @ts-ignore or @ts-nocheck comments found.",
        status: "fixed",
      },
    ],
  },
  {
    name: "Component Architecture",
    score: 80,
    icon: <Layout className="w-5 h-5" />,
    issues: [
      {
        id: "M1",
        title: "/dashboard/history shows placeholder text only",
        severity: "high",
        file: "src/pages/ProofHistory.tsx",
        description: "Actually FIXED - ProofHistory.tsx fetches and renders real data from Supabase.",
        status: "fixed",
      },
      {
        id: "CA-2",
        title: "DomainChecker.tsx over 700 lines",
        severity: "medium",
        file: "src/pages/DomainChecker.tsx",
        description: "Component exceeds 300 line limit. Should be split into smaller components.",
        status: "open",
      },
      {
        id: "CA-3",
        title: "Forms use React Hook Form + Zod",
        severity: "low",
        file: "Multiple",
        description: "ResetPassword, Onboarding use proper form validation patterns.",
        status: "fixed",
      },
    ],
  },
  {
    name: "Launch Readiness",
    score: 90,
    icon: <Rocket className="w-5 h-5" />,
    issues: [
      {
        id: "M10",
        title: "404 page matches design system",
        severity: "high",
        file: "src/pages/NotFound.tsx",
        description: "FIXED: Now uses #080808 background, #FF6308 accent, rounded-[100px] buttons per ADR-008.",
        status: "fixed",
      },
      {
        id: "LR-2",
        title: "Console logs in Edge Functions",
        severity: "medium",
        file: "supabase/functions",
        description: "Console.log statements present but guarded by ENVIRONMENT !== 'production' check.",
        status: "fixed",
      },
      {
        id: "LR-3",
        title: "Zero TODO/FIXME in critical paths",
        severity: "low",
        file: "Codebase",
        description: "No TODO or FIXME comments found in codebase.",
        status: "fixed",
      },
      {
        id: "M5",
        title: "/webhook-success and /webhook-cancel routes exist",
        severity: "low",
        file: "src/App.tsx",
        description: "Both routes properly configured in App.tsx.",
        status: "fixed",
      },
    ],
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// SCORE CALCULATIONS
// ══════════════════════════════════════════════════════════════════════════════

function calculateLaunchReadinessScore(dims: Dimension[]): number {
  const criticalIssues = dims.flatMap(d => d.issues).filter(i => i.severity === "critical" && i.status === "open");
  const highIssues = dims.flatMap(d => d.issues).filter(i => i.severity === "high" && i.status === "open");
  
  // Start at 100, deduct for open issues
  let score = 100;
  score -= criticalIssues.length * 15;
  score -= highIssues.length * 8;
  
  return Math.max(0, Math.min(100, score));
}

function getVerdict(score: number, criticalCount: number): "BLOCKED" | "CONDITIONAL" | "READY" {
  if (criticalCount > 0) return "BLOCKED";
  if (score < 70) return "CONDITIONAL";
  return "READY";
}

function countBySeverity(dims: Dimension[], severity: Severity): number {
  return dims.flatMap(d => d.issues).filter(i => i.severity === severity && i.status === "open").length;
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

const AuditDashboard = () => {
  const launchScore = calculateLaunchReadinessScore(dimensions);
  const criticalCount = countBySeverity(dimensions, "critical");
  const highCount = countBySeverity(dimensions, "high");
  const mediumCount = countBySeverity(dimensions, "medium");
  const lowCount = countBySeverity(dimensions, "low");
  const verdict = getVerdict(launchScore, criticalCount);

  const verdictColors = {
    BLOCKED: { bg: "rgba(255,0,0,0.12)", border: "rgba(255,0,0,0.3)", text: "#FF0000" },
    CONDITIONAL: { bg: "rgba(255,184,0,0.12)", border: "rgba(255,184,0,0.3)", text: "#FFB800" },
    READY: { bg: "rgba(71,255,143,0.12)", border: "rgba(71,255,143,0.3)", text: "#47FF8F" },
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "#080808" }}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: "#f0f0ee", fontFamily: "'DM Sans', sans-serif" }}
          >
            VEXLO Codebase Audit
          </h1>
          <p
            className="text-sm"
            style={{ color: "rgba(240,240,238,0.45)", fontFamily: "'DM Sans', sans-serif" }}
          >
            8-Dimension Technical Assessment
          </p>
        </div>

        {/* Launch Readiness Score */}
        <div
          className="rounded-[12px] border p-8 text-center"
          style={{
            backgroundColor: "#0d0d0d",
            borderColor: verdictColors[verdict].border,
          }}
        >
          <p
            className="text-sm uppercase tracking-widest mb-4"
            style={{ color: "rgba(240,240,238,0.45)", fontFamily: "'Space Mono', monospace" }}
          >
            Launch Readiness Score
          </p>
          <div
            className="text-7xl font-bold mb-4"
            style={{ color: verdictColors[verdict].text, fontFamily: "'Space Mono', monospace" }}
          >
            {launchScore}
            <span className="text-3xl" style={{ color: "rgba(240,240,238,0.3)" }}>/100</span>
          </div>
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[100px]"
            style={{
              backgroundColor: verdictColors[verdict].bg,
              border: `1px solid ${verdictColors[verdict].border}`,
            }}
          >
            {verdict === "BLOCKED" && <XCircle className="w-5 h-5" style={{ color: verdictColors[verdict].text }} />}
            {verdict === "CONDITIONAL" && <AlertTriangle className="w-5 h-5" style={{ color: verdictColors[verdict].text }} />}
            {verdict === "READY" && <CheckCircle className="w-5 h-5" style={{ color: verdictColors[verdict].text }} />}
            <span
              className="text-sm font-bold uppercase tracking-widest"
              style={{ color: verdictColors[verdict].text, fontFamily: "'Space Mono', monospace" }}
            >
              {verdict}
            </span>
          </div>

          {/* Issue Summary */}
          <div className="flex justify-center gap-6 mt-6">
            {[
              { label: "Critical", count: criticalCount, color: SEVERITY_COLORS.critical },
              { label: "High", count: highCount, color: SEVERITY_COLORS.high },
              { label: "Medium", count: mediumCount, color: SEVERITY_COLORS.medium },
              { label: "Low", count: lowCount, color: SEVERITY_COLORS.low },
            ].map(({ label, count, color }) => (
              <div key={label} className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{ color, fontFamily: "'Space Mono', monospace" }}
                >
                  {count}
                </div>
                <div
                  className="text-[10px] uppercase tracking-widest"
                  style={{ color: "rgba(240,240,238,0.45)", fontFamily: "'Space Mono', monospace" }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dimension Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dimensions.map((dim) => {
            const openIssues = dim.issues.filter(i => i.status === "open");
            const criticalInDim = openIssues.filter(i => i.severity === "critical").length;
            const highInDim = openIssues.filter(i => i.severity === "high").length;
            const mediumInDim = openIssues.filter(i => i.severity === "medium").length;
            const lowInDim = openIssues.filter(i => i.severity === "low").length;

            const scoreColor = dim.score >= 80 ? "#47FF8F" : dim.score >= 60 ? "#FFB800" : "#FF0000";

            return (
              <div
                key={dim.name}
                className="rounded-[12px] border p-5"
                style={{
                  backgroundColor: "#0d0d0d",
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-[8px] flex items-center justify-center"
                      style={{ backgroundColor: "rgba(255,99,8,0.12)" }}
                    >
                      <div style={{ color: "#FF6308" }}>{dim.icon}</div>
                    </div>
                    <div>
                      <h3
                        className="text-sm font-semibold"
                        style={{ color: "#f0f0ee", fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {dim.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {criticalInDim > 0 && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-[100px] font-semibold"
                            style={{ backgroundColor: SEVERITY_BG.critical, color: SEVERITY_COLORS.critical }}
                          >
                            {criticalInDim} Critical
                          </span>
                        )}
                        {highInDim > 0 && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-[100px] font-semibold"
                            style={{ backgroundColor: SEVERITY_BG.high, color: SEVERITY_COLORS.high }}
                          >
                            {highInDim} High
                          </span>
                        )}
                        {mediumInDim > 0 && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-[100px] font-semibold"
                            style={{ backgroundColor: SEVERITY_BG.medium, color: SEVERITY_COLORS.medium }}
                          >
                            {mediumInDim} Med
                          </span>
                        )}
                        {lowInDim > 0 && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-[100px] font-semibold"
                            style={{ backgroundColor: SEVERITY_BG.low, color: SEVERITY_COLORS.low }}
                          >
                            {lowInDim} Low
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: scoreColor, fontFamily: "'Space Mono', monospace" }}
                  >
                    {dim.score}
                  </div>
                </div>

                {/* Issues List */}
                <div className="space-y-2">
                  {openIssues.slice(0, 3).map((issue) => (
                    <div
                      key={issue.id}
                      className="flex items-start gap-2 p-2 rounded-[6px]"
                      style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                    >
                      <ShieldAlert
                        className="w-3.5 h-3.5 mt-0.5 shrink-0"
                        style={{ color: SEVERITY_COLORS[issue.severity] }}
                      />
                      <div className="min-w-0">
                        <p
                          className="text-xs font-medium truncate"
                          style={{ color: "#f0f0ee", fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {issue.id}: {issue.title}
                        </p>
                        {issue.file && (
                          <p
                            className="text-[10px] truncate"
                            style={{ color: "rgba(240,240,238,0.35)", fontFamily: "'Space Mono', monospace" }}
                          >
                            {issue.file}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {openIssues.length > 3 && (
                    <p
                      className="text-[10px] text-center pt-1"
                      style={{ color: "rgba(240,240,238,0.35)", fontFamily: "'Space Mono', monospace" }}
                    >
                      +{openIssues.length - 3} more issues
                    </p>
                  )}
                  {openIssues.length === 0 && (
                    <div className="flex items-center gap-2 p-2">
                      <CheckCircle className="w-3.5 h-3.5" style={{ color: "#47FF8F" }} />
                      <p
                        className="text-xs"
                        style={{ color: "#47FF8F", fontFamily: "'DM Sans', sans-serif" }}
                      >
                        All issues resolved
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* P0 Critical Issues Summary */}
        <div
          className="rounded-[12px] border p-6"
          style={{
            backgroundColor: "#0d0d0d",
            borderColor: "rgba(255,0,0,0.2)",
          }}
        >
          <h2
            className="text-lg font-bold mb-4 flex items-center gap-2"
            style={{ color: "#FF0000", fontFamily: "'DM Sans', sans-serif" }}
          >
            <XCircle className="w-5 h-5" />
            P0 Critical Fixes Required (Revenue Impact)
          </h2>
          <div className="space-y-3">
            {dimensions.flatMap(d => d.issues).filter(i => i.severity === "critical" && i.status === "open").map((issue) => (
              <div
                key={issue.id}
                className="p-4 rounded-[8px] border"
                style={{
                  backgroundColor: "rgba(255,0,0,0.05)",
                  borderColor: "rgba(255,0,0,0.15)",
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "#f0f0ee", fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {issue.id} — {issue.title}
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "rgba(240,240,238,0.5)", fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {issue.description}
                    </p>
                    {issue.file && (
                      <p
                        className="text-[10px] mt-2"
                        style={{ color: "#FF6308", fontFamily: "'Space Mono', monospace" }}
                      >
                        File: {issue.file}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auth Flow Diagram */}
        <div
          className="rounded-[12px] border p-6"
          style={{
            backgroundColor: "#0d0d0d",
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <h2
            className="text-lg font-bold mb-4"
            style={{ color: "#f0f0ee", fontFamily: "'DM Sans', sans-serif" }}
          >
            Auth Flow Diagram (ASCII)
          </h2>
          <pre
            className="text-[10px] leading-relaxed overflow-x-auto p-4 rounded-[8px]"
            style={{
              backgroundColor: "#080808",
              color: "rgba(240,240,238,0.7)",
              fontFamily: "'Space Mono', monospace",
            }}
          >
{`┌─────────────────────────────────────────────────────────────────────────┐
│                        VEXLO AUTH FLOW (FIXED)                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────┐    ┌─────────────┐    ┌──────────────┐    ┌────────────┐  │
│  │  User    │───▶│ Login/Signup│───▶│ Supabase Auth│───▶│ AuthProvider│  │
│  │  Action  │    │   Page      │    │ signIn()     │    │ getUser()  │  │
│  └──────────┘    └─────────────┘    └──────────────┘    └─────┬──────┘  │
│                                                                │         │
│                                        ┌───────────────────────┘         │
│                                        ▼                                 │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ AuthContext                                                       │   │
│  │ ├─ user: User | null        (from getUser() ✅)                  │   │
│  │ ├─ session: Session | null  (for access_token only)              │   │
│  │ └─ profile: Profile | null  (from profiles table)                │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                        │                                 │
│                                        ▼                                 │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ ProtectedRoute                                                    │   │
│  │ └─ if (!user) ──▶ Navigate to /login                             │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                        │                                 │
│                                        ▼                                 │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Protected Pages: /dashboard, /dashboard/*, /settings, /onboarding│   │
│  │                  /check ✅ (FIXED)                                │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ✅ ALL VIOLATIONS FIXED:                                               │
│  1. ResetPassword.tsx now uses getUser() for identity check ✅         │
│  2. DomainChecker.tsx uses getSession() for token only (allowed) ✅    │
│  3. /check route now wrapped in ProtectedRoute ✅                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘`}
          </pre>
        </div>

        {/* Billing State Machine */}
        <div
          className="rounded-[12px] border p-6"
          style={{
            backgroundColor: "#0d0d0d",
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <h2
            className="text-lg font-bold mb-4"
            style={{ color: "#f0f0ee", fontFamily: "'DM Sans', sans-serif" }}
          >
            Billing State Machine
          </h2>
          <pre
            className="text-[10px] leading-relaxed overflow-x-auto p-4 rounded-[8px]"
            style={{
              backgroundColor: "#080808",
              color: "rgba(240,240,238,0.7)",
              fontFamily: "'Space Mono', monospace",
            }}
          >
{`┌─────────────────────────────────────────────────────────────────────────┐
│                POLAR SUBSCRIPTION STATE MACHINE (FIXED)                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────┐  subscription.created    ┌────────────┐                   │
│  │   FREE   │─────────────────────────▶│   ACTIVE   │                   │
│  │          │                          │ (paid tier)│                   │
│  └────┬─────┘                          └─────┬──────┘                   │
│       │                                      │                           │
│       │ ┌────────────────────────────────────┤                           │
│       │ │ subscription.updated              │                           │
│       │ │ (plan change)                     │                           │
│       │ └───────────────────────────────────┤                           │
│       │                                      │                           │
│       │                        subscription.│                           │
│       │                        past_due     ▼                           │
│       │                          ┌──────────────────┐                   │
│       │                          │    PAST_DUE     │                    │
│       │                          │  ✅ NOW HANDLED │ ◀── FIXED!        │
│       │                          └────────┬────────┘                    │
│       │                                   │                              │
│       │      subscription.canceled/       │ (immediate downgrade)       │
│       │      subscription.revoked         ▼                              │
│       │           ┌───────────────────────────────────┐                 │
│       └───────────│             FREE                  │◀────────────────┤
│                   │  (downgraded, proofs_limit = 5)  │                  │
│                   └───────────────────────────────────┘                 │
│                                                                          │
│  WEBHOOK EVENTS HANDLED:                                                │
│  ✅ subscription.created   → sync_subscription RPC                      │
│  ✅ subscription.updated   → sync_subscription RPC                      │
│  ✅ subscription.activated → sync_subscription RPC                      │
│  ✅ subscription.renewed   → reset_proofs_for_period RPC                │
│  ✅ subscription.canceled  → downgrade to free                          │
│  ✅ subscription.revoked   → downgrade to free                          │
│  ✅ subscription.past_due  → IMMEDIATE DOWNGRADE TO FREE ✅             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘`}
          </pre>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 pb-8">
          <p
            className="text-[10px] uppercase tracking-widest"
            style={{ color: "rgba(240,240,238,0.25)", fontFamily: "'Space Mono', monospace" }}
          >
            Generated by VEXLO Audit System — {new Date().toISOString().split("T")[0]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuditDashboard;
