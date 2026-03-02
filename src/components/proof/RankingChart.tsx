interface RankingItem {
  keyword: string;
  position: number;
  url?: string;
  etv?: number;
}

interface RankingChartProps {
  rankings: RankingItem[];
}

const BAR_HEIGHT = 28;
const MAX_BARS = 16;

const getBarColor = (position: number): string => {
  if (position <= 3) return "#f59e0b";
  if (position <= 10) return "#22c55e";
  return "rgba(255,99,8,0.6)";
};

const truncate = (str: string, max: number): string =>
  str.length > max ? str.slice(0, max) + "…" : str;

const RankingChart = ({ rankings }: RankingChartProps) => {
  const items = rankings.slice(0, MAX_BARS);
  if (items.length === 0) {
    return (
      <p className="font-body text-sm" style={{ color: "var(--text-muted)" }}>
        No ranking data available.
      </p>
    );
  }

  const maxPosition = Math.max(...items.map((r) => r.position), 20);
  const chartHeight = items.length * (BAR_HEIGHT + 6);
  const labelWidth = 180;
  const rightLabelWidth = 40;
  const barAreaWidth = 400;
  const svgWidth = labelWidth + barAreaWidth + rightLabelWidth + 16;

  return (
    <div>
      <p
        className="font-mono uppercase tracking-widest mb-4"
        style={{ fontSize: 10, color: "var(--text-muted)" }}
      >
        Keyword Rankings
      </p>
      <div className="overflow-x-auto">
        <svg
          width="100%"
          viewBox={`0 0 ${svgWidth} ${chartHeight}`}
          preserveAspectRatio="xMinYMin meet"
          style={{ minWidth: 480 }}
        >
          {items.map((item, i) => {
            const y = i * (BAR_HEIGHT + 6);
            const barWidth = Math.max(
              12,
              ((maxPosition - item.position + 1) / maxPosition) * barAreaWidth
            );
            const color = getBarColor(item.position);

            return (
              <g key={i}>
                {/* Keyword label */}
                <text
                  x={labelWidth - 8}
                  y={y + BAR_HEIGHT / 2 + 1}
                  textAnchor="end"
                  dominantBaseline="central"
                  fill="rgba(240,240,238,0.45)"
                  fontFamily="'DM Sans', sans-serif"
                  fontSize={11}
                  fontWeight={300}
                >
                  {truncate(item.keyword, 25)}
                </text>

                {/* Background track */}
                <rect
                  x={labelWidth}
                  y={y}
                  width={barAreaWidth}
                  height={BAR_HEIGHT}
                  rx={4}
                  fill="rgba(255,255,255,0.04)"
                />

                {/* Bar */}
                <rect
                  x={labelWidth}
                  y={y}
                  width={barWidth}
                  height={BAR_HEIGHT}
                  rx={4}
                  fill={color}
                  style={{
                    animation: `ranking-bar-grow 0.8s ease-out ${i * 0.05}s both`,
                  }}
                />

                {/* Position label */}
                <text
                  x={labelWidth + barAreaWidth + 8}
                  y={y + BAR_HEIGHT / 2 + 1}
                  textAnchor="start"
                  dominantBaseline="central"
                  fill="rgba(240,240,238,0.45)"
                  fontFamily="'Space Mono', monospace"
                  fontSize={10}
                >
                  #{item.position}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <style>{`
        @keyframes ranking-bar-grow {
          from { transform: scaleX(0); transform-origin: left; }
          to { transform: scaleX(1); transform-origin: left; }
        }
      `}</style>
    </div>
  );
};

export default RankingChart;
