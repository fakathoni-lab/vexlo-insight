interface RankingItem {
  keyword: string;
  position: number;
  url: string;
  etv: number;
}

const RankingsTable = ({
  rankings,
  domainPosition,
  domain,
}: {
  rankings: RankingItem[];
  domainPosition: number | null;
  domain: string;
}) => {
  if (!rankings || rankings.length === 0) {
    return (
      <p className="font-body text-sm" style={{ color: "var(--text-muted)" }}>
        No ranking data available.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[var(--radii-inner)]" style={{ border: "1px solid var(--border)" }}>
      <table className="w-full text-left">
        <thead>
          <tr style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
            <th className="font-mono text-[10px] uppercase tracking-widest px-4 py-3" style={{ color: "var(--text-dim)" }}>#</th>
            <th className="font-mono text-[10px] uppercase tracking-widest px-4 py-3" style={{ color: "var(--text-dim)" }}>Page</th>
            <th className="font-mono text-[10px] uppercase tracking-widest px-4 py-3 text-right" style={{ color: "var(--text-dim)" }}>ETV</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((item, i) => {
            const isDomain = item.url?.includes(domain);
            return (
              <tr
                key={i}
                className="transition-colors duration-200"
                style={{
                  borderTop: "1px solid var(--border)",
                  backgroundColor: isDomain ? "var(--accent-purple-dim)" : "transparent",
                }}
              >
                <td className="px-4 py-2.5 font-mono text-xs" style={{ color: isDomain ? "var(--accent-light)" : "var(--text-dim)" }}>
                  {item.position}
                </td>
                <td className="px-4 py-2.5">
                  <div className="font-body text-xs truncate max-w-[300px] sm:max-w-[500px]" style={{ color: isDomain ? "var(--text)" : "var(--text-dim)" }}>
                    {item.keyword}
                  </div>
                  <div className="font-mono text-[10px] truncate max-w-[300px] sm:max-w-[500px]" style={{ color: "var(--text-muted)" }}>
                    {item.url}
                  </div>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-right" style={{ color: "var(--text-dim)" }}>
                  {item.etv?.toLocaleString() ?? "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RankingsTable;
