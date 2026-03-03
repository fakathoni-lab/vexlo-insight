import { useState } from "react";
import { FileText, Zap, BarChart3, X, AlertCircle } from "lucide-react";
import SEO from "@/components/SEO";
import MetricCard from "@/components/dashboard/MetricCard";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import RecentProofsTable from "@/components/dashboard/RecentProofsTable";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { metrics, recentActivity, isLoading, error } = useDashboardData();
  const [errorDismissed, setErrorDismissed] = useState(false);

  const proofsUsed = metrics?.proofsGenerated ?? 0;
  const proofsLimit = 5; // fallback; real limit comes from profile
  const proofsRemaining = Math.max(0, proofsLimit - proofsUsed);

  const metricItems = [
    { label: "Proofs This Month", value: proofsUsed, icon: FileText },
    { label: "Proofs Remaining", value: proofsRemaining, icon: Zap },
    { label: "Credits Used", value: `${proofsUsed}/${proofsLimit}`, icon: BarChart3 },
  ];

  const proofs = recentActivity.slice(0, 5).map((p) => ({
    id: p.id,
    domain: p.domain,
    keyword: p.keyword ?? "",
    score: p.score,
    status: p.status === "complete" || (p.score && p.score > 0) ? "complete" : p.status,
    current_rank: p.current_rank ?? null,
    created_at: p.created_at,
  }));

  return (
    <div className="max-w-[1080px] mx-auto space-y-6">
      <SEO
        title="Dashboard — VEXLO"
        description="Manage your SEO proof reports."
        canonical="https://vexloai.com/dashboard"
      />

      {/* Error banner */}
      {error && !errorDismissed && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-outer border"
          style={{
            backgroundColor: "rgba(245,158,11,0.08)",
            borderColor: "rgba(245,158,11,0.25)",
            color: "var(--accent-warning, #f59e0b)",
          }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm flex-1" style={{ fontFamily: "var(--font-body)" }}>
            {error}
          </span>
          <button
            onClick={() => setErrorDismissed(true)}
            className="p-1 rounded hover:bg-white/5 transition-colors duration-150"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold tracking-tight text-text">Dashboard</h1>
        <p className="text-sm mt-1 text-text-dim">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          · Sales Proof Intelligence
        </p>
      </div>

      {/* Quick Action */}
      <QuickActionCard />

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-outer border border-border bg-bg-card p-5"
              >
                <Skeleton className="h-3 w-20 mb-3 bg-white/[0.08]" />
                <Skeleton className="h-8 w-24 bg-white/[0.08]" />
                <Skeleton className="h-3 w-28 mt-2 bg-white/[0.08]" />
              </div>
            ))
          : metricItems.map((m) => (
              <MetricCard key={m.label} label={m.label} value={m.value} icon={m.icon} />
            ))}
      </div>

      {/* Recent Proofs */}
      <div>
        <h2 className="font-mono uppercase tracking-wide mb-4 text-text-muted" style={{ fontSize: "9px" }}>
          Recent Proofs
        </h2>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-outer border border-border bg-bg-card p-5 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-3 w-32 mb-2 bg-white/[0.08]" />
                  <Skeleton className="h-2.5 w-24 bg-white/[0.08]" />
                </div>
                <Skeleton className="h-3 w-8 bg-white/[0.08]" />
              </div>
            ))}
          </div>
        ) : (
          <RecentProofsTable proofs={proofs} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
