import { useEffect, useRef, useState } from "react";

export function useParallax(speed = 0.15) {
  const sectionRef = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let animationId: number;
    let currentOffset = 0;
    let targetOffset = 0;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight;
      // Only calculate when section is in view
      if (rect.bottom > 0 && rect.top < viewportH) {
        const progress = (viewportH - rect.top) / (viewportH + rect.height);
        targetOffset = (progress - 0.5) * rect.height * speed;
      }
    };

    const tick = () => {
      currentOffset = lerp(currentOffset, targetOffset, 0.08);
      setOffset(currentOffset);
      animationId = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    animationId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(animationId);
    };
  }, [speed]);

  return { sectionRef, offset };
}
