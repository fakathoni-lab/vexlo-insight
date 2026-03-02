import { Check, AlertTriangle } from "lucide-react";

interface AIOverviewBadgeProps {
  aiOverview: boolean;
  serpFeatures?: {
    ai_overview: boolean;
    featured_snippet: boolean;
    local_pack: boolean;
    knowledge_panel: boolean;
  } | null;
  aiImpactPercent?: number;
}

const AIOverviewBadge = ({ aiOverview, aiImpactPercent = 0 }: AIOverviewBadgeProps) => {
  if (!aiOverview) {
    return (
      <div
        className="inline-flex items-center gap-2 rounded-full px-4 py-2"
        style={{
          backgroundColor: "rgba(34,197,94,0.1)",
          border: "1px solid rgba(34,197,94,0.25)",
        }}
      >
        <Check size={14} style={{ color: "#22c55e" }} />
        <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "#22c55e" }}>
          AI Overview: Not Detected
        </span>
      </div>
    );
  }

  // Risk levels based on AI impact
  let riskLabel: string;
  let riskColor: string;
  let bgColor: string;
  let borderColor: string;

  if (aiImpactPercent > 40) {
    riskLabel = "HIGH RISK";
    riskColor = "#ef4444";
    bgColor = "rgba(239,68,68,0.1)";
    borderColor = "rgba(239,68,68,0.25)";
  } else if (aiImpactPercent >= 20) {
    riskLabel = "MEDIUM RISK";
    riskColor = "#f59e0b";
    bgColor = "rgba(245,158,11,0.1)";
    borderColor = "rgba(245,158,11,0.25)";
  } else {
    riskLabel = "LOW RISK";
    riskColor = "#eab308";
    bgColor = "rgba(234,179,8,0.1)";
    borderColor = "rgba(234,179,8,0.25)";
  }

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full px-4 py-2"
      style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}
    >
      <AlertTriangle size={14} style={{ color: riskColor }} />
      <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: riskColor }}>
        {riskLabel} — {aiImpactPercent}% Traffic at Risk
      </span>
    </div>
  );
};

export default AIOverviewBadge;
