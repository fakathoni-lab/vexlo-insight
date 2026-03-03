import { useNavigate } from "react-router-dom";
import { ExternalLink } from "lucide-react";

interface Proof {
  id: string;
  domain: string;
  keyword: string;
  score: number;
  status: string;
  current_rank: number | null;
  created_at: string;
}

const scoreColor = (score: number, status: string) => {
  if (status !== "complete") return "var(--text-muted)";
  if (score <= 30) return "var(--accent-danger)";
  if (score <= 60) return "var(--accent)";
  return "var(--accent-success)";
};

const RecentProofsTable = ({ proofs }: { proofs: Proof[] }) => {
  const navigate = useNavigate();

  if (proofs.length === 0) {
    return (
      <div className="rounded-outer border border-border bg-bg-card p-12 text-center">
        <p className="text-[14px] text-text-dim font-light" style={{ fontFamily: "var(--font-body)" }}>
          No proofs yet. Generate your first one.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {proofs.map((proof) => {
        const isComplete = proof.status === "complete";
        const statusLabel = proof.status === "failed" ? "failed" : "processing";

        return (
          <div
            key={proof.id}
            className="rounded-outer border border-border bg-bg-card p-5 flex items-center justify-between gap-4 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(99,102,241,0.15)] hover:border-border-strong cursor-pointer"
            onClick={() => navigate(`/dashboard/proof/${proof.id}`)}
          >
            <div className="flex-1 min-w-0">
              <p className="text-[14px] text-text truncate" style={{ fontFamily: "var(--font-body)" }}>
                {proof.domain}
              </p>
              <p className="text-[12px] text-text-dim font-light truncate" style={{ fontFamily: "var(--font-body)" }}>
                {proof.keyword}
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              {isComplete ? (
                <span
                  className="text-[18px]"
                  style={{ fontFamily: "var(--font-headline)", color: scoreColor(proof.score, proof.status) }}
                >
                  {proof.score}
                </span>
              ) : (
                <span
                  className="font-mono uppercase text-[9px] tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    color: proof.status === "failed" ? "var(--accent-danger)" : "var(--text-muted)",
                    border: `1px solid ${proof.status === "failed" ? "rgba(255,71,71,0.25)" : "var(--border)"}`,
                  }}
                >
                  {statusLabel}
                </span>
              )}

              {proof.current_rank !== null && (
                <span className="font-mono text-[11px] text-text-dim">
                  #{proof.current_rank}
                </span>
              )}

              <ExternalLink className="w-3.5 h-3.5 text-text-muted" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RecentProofsTable;
