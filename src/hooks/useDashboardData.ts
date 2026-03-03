import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface DashboardMetrics {
  totalRevenue: number;
  proofsGenerated: number;
  activeClients: number;
  closeRate: number;
  proofsUsed: number;
  proofsLimit: number;
}

export interface ProofSession {
  id: string;
  domain: string;
  score: number;
  status: string;
  revenue: number;
  created_at: string;
  keyword?: string;
  current_rank?: number | null;
}

export interface SystemService {
  service_name: string;
  status: "operational" | "degraded" | "down";
  updated_at: string;
}

export interface DashboardData {
  metrics: DashboardMetrics | null;
  recentActivity: ProofSession[];
  proofScores: ProofSession[];
  systemHealth: SystemService[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useDashboardData = (): DashboardData => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<ProofSession[]>([]);
  const [proofScores, setProofScores] = useState<ProofSession[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      const [
        proofsRes,
        clientsRes,
        recentRes,
        scoresRes,
        systemRes,
        profileRes,
      ] = await Promise.all([
        // All proofs for metrics
        supabase
          .from("proofs")
          .select("id, score, status, created_at")
          .eq("user_id", user.id),
        // Active clients count
        supabase
          .from("clients")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("active", true),
        // Recent activity (7 most recent proofs)
        supabase
          .from("proofs")
          .select("id, domain, keyword, score, status, current_rank, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(7),
        // Top 4 proof scores
        supabase
          .from("proofs")
          .select("id, domain, score, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(4),
        // System health
        supabase
          .from("system_status")
          .select("service_name, status, updated_at")
          .order("service_name"),
        // Profile for usage stats
        supabase
          .from("profiles")
          .select("proofs_used, proofs_limit")
          .eq("id", user.id)
          .single(),
      ]);

      if (proofsRes.error) throw proofsRes.error;
      if (clientsRes.error) throw clientsRes.error;
      if (recentRes.error) throw recentRes.error;
      if (scoresRes.error) throw scoresRes.error;
      if (systemRes.error) throw systemRes.error;

      const allProofs = proofsRes.data ?? [];
      const totalCount = allProofs.length;
      const closedCount = allProofs.filter((p) => p.status === "closed").length;
      const closeRate = totalCount > 0
        ? Math.round((closedCount / totalCount) * 1000) / 10
        : 0;

      const proofsUsed = profileRes.data?.proofs_used ?? 0;
      const proofsLimit = profileRes.data?.proofs_limit ?? 5;

      setMetrics({
        totalRevenue: 0,
        proofsGenerated: totalCount,
        activeClients: clientsRes.count ?? 0,
        closeRate,
        proofsUsed,
        proofsLimit,
      });

      setRecentActivity(
        (recentRes.data ?? []).map((p: any) => ({
          id: p.id,
          domain: p.domain,
          score: p.score ?? 0,
          status: p.status ?? "generated",
          revenue: 0,
          created_at: p.created_at,
          keyword: p.keyword,
          current_rank: p.current_rank,
        }))
      );

      setProofScores(
        (scoresRes.data ?? []).map((p: any) => ({
          id: p.id,
          domain: p.domain,
          score: p.score ?? 0,
          status: "generated",
          revenue: 0,
          created_at: p.created_at,
        }))
      );

      setSystemHealth(
        (systemRes.data ?? []) as SystemService[]
      );
    } catch (err: any) {
      setError(err.message ?? "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("proof-updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "proofs",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchData]);

  return {
    metrics,
    recentActivity,
    proofScores,
    systemHealth,
    isLoading,
    error,
    refresh: fetchData,
  };
};
