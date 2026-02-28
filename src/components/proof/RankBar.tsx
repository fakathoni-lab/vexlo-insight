const RankBar = ({ keyword, position }: { keyword: string; position: number }) => {
  const maxPos = 50;
  const width = Math.max(5, 100 - (position / maxPos) * 100);
  const color = position <= 3 ? "#22c55e" : position <= 10 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex items-center gap-3">
      <span
        className="w-[180px] shrink-0 truncate font-body font-light text-right"
        style={{ fontSize: 11, color: "rgba(240,240,238,0.45)" }}
      >
        {keyword}
      </span>
      <div className="flex-1 h-5 rounded-[4px] overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
        <div
          className="h-full rounded-[4px] flex items-center justify-end pr-2 transition-all duration-700"
          style={{ width: `${width}%`, backgroundColor: color }}
        >
          <span className="font-mono text-[9px]" style={{ color: "#080808" }}>
            #{position}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RankBar;
