import { useEffect, useState } from "react";
import { FileText, Zap, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import MetricCard from "@/components/dashboard/MetricCard";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import RecentProofsTable from "@/components/dashboard/RecentProofsTable";

interface Proof {
  id: string;
  domain: string;
  keyword: string;
  score: number;
  status: string;
  current_rank: number | null;
  created_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ proofs_used: number | null; proofs_limit: number | null } | null>(null);
  const [recentProofs, setRecentProofs] = useState<Proof[]>([]);

  useEffect(() => {
    if (!user) return;

    Promise.all([
      supabase
        .from("profiles")
        .select("proofs_used, proofs_limit")
        .eq("id", user.id)
        .single(),
      supabase
        .from("proofs")
        .select("id, domain, keyword, score, current_rank, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]).then(([profileRes, proofsRes]) => {
      if (profileRes.data) setProfile(profileRes.data);
      if (proofsRes.data)
        setRecentProofs(
          (proofsRes.data as any[]).map((p) => ({
            ...p,
            status: p.status ?? (p.score > 0 ? "complete" : "pending"),
          })) as Proof[]
        );
    });
  }, [user]);

  const proofsUsed = profile?.proofs_used ?? 0;
  const proofsLimit = profile?.proofs_limit ?? 5;
  const proofsRemaining = Math.max(0, proofsLimit - proofsUsed);

  const metrics = [
    { label: "Proofs This Month", value: proofsUsed, icon: FileText },
    { label: "Proofs Remaining", value: proofsRemaining, icon: Zap },
    { label: "Credits Used", value: `${proofsUsed}/${proofsLimit}`, icon: BarChart3 },
  ];

  return (
    <div className="max-w-[1080px] mx-auto space-y-6">
      <SEO
        title="Dashboard — VEXLO"
        description="Manage your SEO proof reports."
        canonical="https://vexloai.com/dashboard"
      />

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
        {metrics.map((m) => (
          <MetricCard key={m.label} label={m.label} value={m.value} icon={m.icon} />
        ))}
      </div>

      {/* Recent Proofs */}
      <div>
        <h2 className="font-mono uppercase tracking-wide mb-4 text-text-muted" style={{ fontSize: "9px" }}>
          Recent Proofs
        </h2>
        <RecentProofsTable proofs={recentProofs} />
      </div>
    </div>
  );
};

export default Dashboard;
