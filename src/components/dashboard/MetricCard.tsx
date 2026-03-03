import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
}

const MetricCard = ({ label, value, icon: Icon, trend }: MetricCardProps) => (
  <div
    className="rounded-outer border border-border bg-bg-card p-5 group transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(99,102,241,0.15)] hover:border-border-strong"
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
