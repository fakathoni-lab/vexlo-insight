import { useState, useEffect } from "react";

const ScoreRing = ({ score, size = 80 }: { score: number; size?: number }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (animatedScore / 100) * circ;
  const color = score <= 30 ? "#ef4444" : score <= 60 ? "#f59e0b" : "#22c55e";

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 1200;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setAnimatedScore(Math.round(progress * score));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={4} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.1s linear" }}
        />
      </svg>
      <span className="absolute font-headline" style={{ fontSize: 22, color }}>
        {animatedScore}
      </span>
    </div>
  );
};

export default ScoreRing;
