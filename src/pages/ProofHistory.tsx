import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileSearch, Loader2, Share2, Eye, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 20;

type SortOption = "newest" | "highest" | "lowest";

interface ProofRow {
  id: string;
  domain: string;
  keyword: string;
  score: number | null;
  status: string | null;
  is_public: boolean;
  public_slug: string | null;
  created_at: string | null;
}

const scoreBadge = (score: number | null) => {
  if (score === null || score === undefined) return null;
  const s = Number(score);
  let bg = "rgba(239,68,68,0.15)";
  let color = "#ef4444";
  let border = "rgba(239,68,68,0.3)";
  if (s >= 70) {
    bg = "rgba(71,255,143,0.12)";
    color = "var(--accent-success)";
    border = "rgba(71,255,143,0.25)";
  } else if (s >= 40) {
    bg = "rgba(245,158,11,0.12)";
    color = "#f59e0b";
    border = "rgba(245,158,11,0.25)";
  }
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold"
      style={{ background: bg, color, border: `1px solid ${border}`, borderRadius: "9999px", fontFamily: "var(--font-mono)" }}
    >
      {s}
    </span>
  );
};

const statusBadge = (status: string | null) => {
  const s = status ?? "pending";
  if (s === "complete") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider" style={{ background: "rgba(71,255,143,0.1)", color: "var(--accent-success)", border: "1px solid rgba(71,255,143,0.2)", borderRadius: "9999px" }}>
        Complete
      </span>
    );
  }
  if (s === "failed") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "9999px" }}>
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-dim)", border: "1px solid var(--border)", borderRadius: "9999px" }}>
      <Loader2 className="w-3 h-3 animate-spin" /> Processing
    </span>
  );
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const ProofHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [proofs, setProofs] = useState<ProofRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reset pagination on search/sort change
  useEffect(() => {
    setPage(0);
    setProofs([]);
  }, [debouncedSearch, sort]);

  const fetchProofs = useCallback(async (pageNum: number, append = false) => {
    if (!user) return;
    if (!append) setIsLoading(true);
    else setLoadingMore(true);

    try {
      let query = supabase
        .from("proofs")
        .select("id, domain, keyword, score, status, is_public, public_slug, created_at")
        .eq("user_id", user.id);

      if (debouncedSearch) {
        query = query.ilike("domain", `%${debouncedSearch}%`);
      }

      if (sort === "newest") query = query.order("created_at", { ascending: false });
      else if (sort === "highest") query = query.order("score", { ascending: false });
      else query = query.order("score", { ascending: true });

      query = query.range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      const { data, error } = await query;
      if (error) throw error;

      const rows = (data ?? []) as ProofRow[];
      setHasMore(rows.length === PAGE_SIZE);

      if (append) {
        setProofs((prev) => [...prev, ...rows]);
      } else {
        setProofs(rows);
      }
    } catch (err: unknown) {
      toast.error("Failed to load proofs");
      console.error(err);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  }, [user, debouncedSearch, sort]);

  useEffect(() => {
    fetchProofs(page, page > 0);
  }, [page, fetchProofs]);

  const handleLoadMore = () => setPage((p) => p + 1);

  const handleShare = async (proof: ProofRow) => {
    const slug = proof.public_slug;
    if (!slug) return;
    const url = `${window.location.origin}/p/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const sortLabel = useMemo(() => {
    if (sort === "newest") return "Newest First";
    if (sort === "highest") return "Highest Score";
    return "Lowest Score";
  }, [sort]);

  return (
    <div className="max-w-[1080px] mx-auto space-y-6">
      <SEO title="Proof History — VEXLO" description="View all your generated SEO proof reports." canonical="https://vexloai.com/dashboard/history" />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>Proof History</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-dim)" }}>All proof reports you have generated</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search by domain..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-[var(--radii-outer)] outline-none transition-colors duration-150"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              fontFamily: "var(--font-sans)",
            }}
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="appearance-none pl-4 pr-9 py-2.5 text-sm rounded-[var(--radii-outer)] outline-none cursor-pointer transition-colors duration-150"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              fontFamily: "var(--font-sans)",
              minWidth: 160,
            }}
          >
            <option value="newest">Newest First</option>
            <option value="highest">Highest Score</option>
            <option value="lowest">Lowest Score</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--text-muted)" }} />
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-[var(--radii-outer)] p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <Skeleton className="h-4 w-36 mb-3 bg-white/[0.06]" />
              <Skeleton className="h-3 w-24 mb-4 bg-white/[0.06]" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-10 rounded-full bg-white/[0.06]" />
                <Skeleton className="h-5 w-16 rounded-full bg-white/[0.06]" />
              </div>
              <Skeleton className="h-3 w-28 mt-3 bg-white/[0.06]" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && proofs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-border)" }}>
            <FileSearch className="w-7 h-7" style={{ color: "var(--accent)" }} />
          </div>
          <p className="text-base font-semibold mb-1" style={{ color: "var(--text)", fontFamily: "var(--font-sans)" }}>
            No proofs yet
          </p>
          <p className="text-sm mb-6" style={{ color: "var(--text-dim)" }}>
            Generate your first proof to see it here.
          </p>
          <button
            onClick={() => navigate("/dashboard/new")}
            className="px-5 py-2.5 text-sm font-semibold rounded-[var(--radii-outer)] transition-all duration-200"
            style={{
              background: "var(--accent)",
              color: "#fff",
              fontFamily: "var(--font-sans)",
            }}
          >
            Generate Proof
          </button>
        </div>
      )}

      {/* Proof Cards Grid */}
      {!isLoading && proofs.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {proofs.map((proof) => (
              <div
                key={proof.id}
                className="rounded-[var(--radii-outer)] p-5 transition-all duration-200 group"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(255,99,8,0.08)";
                  e.currentTarget.style.borderColor = "var(--border-strong)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
              >
                {/* Top row: domain + score */}
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate" style={{ color: "var(--text)", fontFamily: "var(--font-sans)" }}>
                      {proof.domain}
                    </p>
                    <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-dim)", fontFamily: "var(--font-sans)" }}>
                      {proof.keyword}
                    </p>
                  </div>
                  {scoreBadge(proof.score)}
                </div>

                {/* Status + date */}
                <div className="flex items-center gap-2 mt-3 mb-4">
                  {statusBadge(proof.status)}
                  <span className="text-[11px]" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    {formatDate(proof.created_at)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/dashboard/proof/${proof.id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--radii-inner)] transition-colors duration-150"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      color: "var(--text)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>

                  {proof.status === "complete" && proof.is_public && proof.public_slug && (
                    <button
                      onClick={() => handleShare(proof)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--radii-inner)] transition-colors duration-150"
                      style={{
                        background: "var(--accent-dim)",
                        color: "var(--accent)",
                        border: "1px solid var(--accent-border)",
                      }}
                    >
                      <Share2 className="w-3.5 h-3.5" /> Share
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center pt-2 pb-4">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-[var(--radii-outer)] transition-colors duration-150 disabled:opacity-50"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                }}
              >
                {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProofHistory;
