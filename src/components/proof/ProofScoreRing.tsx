import { useState, useEffect, useRef } from "react";

interface ProofScoreRingProps {
  score: number;
  size?: number;
}

const ProofScoreRing = ({ score, size = 128 }: ProofScoreRingProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [mounted, setMounted] = useState(false);
  const frameRef = useRef<number>(0);

  const r = 52;
  const strokeWidth = 8;
  const viewBox = (r + strokeWidth) * 2;
  const cx = viewBox / 2;
  const cy = viewBox / 2;
  const circumference = 2 * Math.PI * r;

  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";

  useEffect(() => {
    setMounted(true);
    const start = performance.now();
    const duration = 1200;

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [score]);

  const dashOffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${viewBox} ${viewBox}`}
          className="-rotate-90"
        >
          {/* Background ring */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={strokeWidth}
          />
          {/* Score ring */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={mounted ? dashOffset : circumference}
            style={{ transition: "stroke-dashoffset 0.08s linear" }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-headline" style={{ fontSize: 36, color }}>
            {animatedScore}
          </span>
          <span className="font-body" style={{ fontSize: 16, color: "var(--text-muted)", marginTop: 8 }}>
            /100
          </span>
        </div>
      </div>
      <span
        className="font-mono uppercase tracking-widest"
        style={{ fontSize: 10, color: "var(--text-muted)" }}
      >
        Proof Score
      </span>
    </div>
  );
};

export default ProofScoreRing;
