import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Zap, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ proofs_used: number; proofs_limit: number } | null>(null);

  const firstName =
    (user?.user_metadata?.full_name as string)?.split(" ")[0] ?? "there";

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("proofs_used, proofs_limit")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data);
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
      {/* Greeting */}
      <h1 className="font-headline" style={{ fontSize: 28, color: "#f0f0ee" }}>
        Welcome back, {firstName}
      </h1>

      {/* Quick Action Card */}
      <div
        className="rounded-[12px] border border-[rgba(255,255,255,0.07)] p-8"
        style={{ backgroundColor: "#0d0d0d" }}
      >
        <p className="font-body mb-1" style={{ fontSize: 15, color: "#f0f0ee" }}>
          Generate New Proof
        </p>
        <p className="font-body font-light mb-5" style={{ fontSize: 13, color: "rgba(240,240,238,0.45)" }}>
          Enter any domain + keyword. Get proof in 30 seconds.
        </p>
        <button
          onClick={() => navigate("/dashboard/new")}
          className="h-10 px-6 rounded-[100px] font-mono text-[10px] uppercase tracking-widest transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
          style={{
            backgroundColor: "#f0f0ee",
            color: "#080808",
            boxShadow:
              "0px 1.5px 2px -1px hsla(0,0%,100%,.2) inset, 0px 1.5px 1px 0px hsla(0,0%,100%,.06)",
          }}
        >
          Start New Proof
        </button>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-[12px] border border-[rgba(255,255,255,0.07)] p-5 transition-[border-color] duration-[250ms] hover:border-[rgba(255,255,255,0.13)]"
            style={{ backgroundColor: "#0d0d0d" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <m.icon className="w-3.5 h-3.5" style={{ color: "rgba(240,240,238,0.25)" }} />
              <span
                className="font-mono uppercase tracking-wide"
                style={{ fontSize: 8.5, color: "rgba(240,240,238,0.25)" }}
              >
                {m.label}
              </span>
            </div>
            <p className="font-headline" style={{ fontSize: 28, color: "#f0f0ee" }}>
              {m.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Proofs — empty state for now (proofs table not yet created) */}
      <div>
        <h2
          className="font-mono uppercase tracking-wide mb-4"
          style={{ fontSize: 9, color: "rgba(240,240,238,0.25)" }}
        >
          Recent Proofs
        </h2>
        <div
          className="rounded-[12px] border border-[rgba(255,255,255,0.07)] p-12 text-center"
          style={{ backgroundColor: "#0d0d0d" }}
        >
          <p className="font-body font-light" style={{ fontSize: 14, color: "rgba(240,240,238,0.45)" }}>
            No proofs yet. Generate your first one.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
