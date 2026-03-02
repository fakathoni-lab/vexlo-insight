import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendDeltaProps {
  delta: number | null;
}

const TrendDelta = ({ delta }: TrendDeltaProps) => {
  if (delta === null || delta === undefined) {
    return (
      <div className="flex items-center gap-2">
        <Minus size={16} style={{ color: "var(--text-muted)" }} />
        <span className="font-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
          No trend data
        </span>
      </div>
    );
  }

  if (delta > 0) {
    return (
      <div className="flex items-center gap-2">
        <TrendingUp size={16} style={{ color: "#22c55e" }} />
        <span className="font-mono text-[11px]" style={{ color: "#22c55e" }}>
          ↑ +{delta} positions (30 days)
        </span>
      </div>
    );
  }

  if (delta < 0) {
    return (
      <div className="flex items-center gap-2">
        <TrendingDown size={16} style={{ color: "#ef4444" }} />
        <span className="font-mono text-[11px]" style={{ color: "#ef4444" }}>
          ↓ {delta} positions (30 days)
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Minus size={16} style={{ color: "var(--text-dim)" }} />
      <span className="font-mono text-[11px]" style={{ color: "var(--text-dim)" }}>
        → Stable (30 days)
      </span>
    </div>
  );
};

export default TrendDelta;
