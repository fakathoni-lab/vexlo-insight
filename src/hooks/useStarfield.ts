import { useEffect, useRef } from "react";

export function useStarfield(starCount = 100) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const stars: { x: number; y: number; phase: number; speed: number }[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const init = () => {
      stars.length = 0;
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          phase: Math.random() * Math.PI * 2,
          speed: 0.3 + Math.random() * 0.7,
        });
      }
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      for (const star of stars) {
        const alpha =
          0.12 + 0.2 * (0.5 + 0.5 * Math.sin(time * 0.001 * star.speed + star.phase));
        ctx.beginPath();
        ctx.arc(star.x, star.y, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240,240,238,${alpha})`;
        ctx.fill();
      }
      animationId = requestAnimationFrame(draw);
    };

    resize();
    init();
    animationId = requestAnimationFrame(draw);

    const onResize = () => {
      resize();
      init();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
    };
  }, [starCount]);

  return canvasRef;
}
