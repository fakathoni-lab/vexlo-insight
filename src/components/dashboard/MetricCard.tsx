import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
}

const MetricCard = ({ label, value, icon: Icon, trend }: MetricCardProps) => (
  <div
    className="rounded-outer border border-border bg-bg-card p-5 transition-[border-color] duration-[250ms] hover:border-border-strong group"
  >
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-3.5 h-3.5 text-text-muted" />
      <span className="font-mono uppercase tracking-wide text-text-muted" style={{ fontSize: "8.5px" }}>
        {label}
      </span>
    </div>
    <p className="text-text text-[28px] leading-none" style={{ fontFamily: "var(--font-headline)" }}>
      {value}
    </p>
    {trend && (
      <div className="flex items-center gap-1.5 mt-2">
        <span
          className="font-mono text-[10px]"
          style={{ color: trend.value >= 0 ? "var(--accent-success)" : "var(--accent-danger)" }}
        >
          {trend.value >= 0 ? "+" : ""}{trend.value}%
        </span>
        <span className="font-mono text-[10px] text-text-muted">{trend.label}</span>
      </div>
    )}
  </div>
);

export default MetricCard;
