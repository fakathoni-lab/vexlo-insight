import { Bot, FileText, MapPin, BookOpen } from "lucide-react";

interface SerpFeatures {
  ai_overview: boolean;
  featured_snippet: boolean;
  local_pack: boolean;
  knowledge_panel: boolean;
}

const features = [
  { key: "ai_overview" as const, label: "AI Overview", icon: Bot },
  { key: "featured_snippet" as const, label: "Featured Snippet", icon: FileText },
  { key: "local_pack" as const, label: "Local Pack", icon: MapPin },
  { key: "knowledge_panel" as const, label: "Knowledge Panel", icon: BookOpen },
];

const SerpFeatureGrid = ({ serpFeatures }: { serpFeatures: SerpFeatures }) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
    {features.map(({ key, label, icon: Icon }) => {
      const active = serpFeatures[key];
      return (
        <div
          key={key}
          className="flex flex-col items-center gap-2 rounded-[var(--radii-inner)] p-4 transition-colors duration-300"
          style={{
            backgroundColor: active ? "var(--accent-purple-dim)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${active ? "var(--accent-purple-border)" : "var(--border)"}`,
          }}
        >
          <Icon
            size={20}
            style={{ color: active ? "var(--accent-light)" : "var(--text-muted)" }}
          />
          <span
            className="font-mono text-[10px] uppercase tracking-widest text-center"
            style={{ color: active ? "var(--text)" : "var(--text-muted)" }}
          >
            {label}
          </span>
          <span
            className="font-mono text-[9px] uppercase tracking-wider"
            style={{ color: active ? "var(--accent-success)" : "var(--text-muted)" }}
          >
            {active ? "Detected" : "Not Found"}
          </span>
        </div>
      );
    })}
  </div>
);

export default SerpFeatureGrid;
