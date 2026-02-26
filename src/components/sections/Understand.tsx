import { useParallax } from "@/hooks/useParallax";
import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";

const QUESTIONS = [
  "What sparked the universe's birth?",
  "Are we alone in the cosmos?",
  "What lies beyond the observable universe?",
  "Can entropy be reversed?",
  "What is consciousness, really?",
  "Is time travel physically possible?",
  "What existed before the Big Bang?",
  "How many dimensions are there?",
  "What is dark matter made of?",
  "Could physics differ elsewhere in the multiverse?",
  "Where does mathematics come from?",
  "What happens at a black hole singularity?",
];

const Understand = () => {
  const { sectionRef, offset } = useParallax();

  // Cursor tooltip state
  const [isInside, setIsInside] = useState(false);
  const [questionIdx, setQuestionIdx] = useState(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const nextQuestion = useCallback(() => {
    setQuestionIdx((prev) => (prev + 1) % QUESTIONS.length);
  }, []);

  // Lerp animation loop
  useEffect(() => {
    const tick = () => {
      posRef.current.x += (mouseRef.current.x - posRef.current.x) * 0.13;
      posRef.current.y += (mouseRef.current.y - posRef.current.y) * 0.13;
      if (tooltipRef.current) {
        tooltipRef.current.style.left = `${posRef.current.x}px`;
        tooltipRef.current.style.top = `${posRef.current.y}px`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Auto-cycle questions
  useEffect(() => {
    if (isInside) {
      intervalRef.current = setInterval(nextQuestion, 3000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isInside, nextQuestion]);

  const handleMouseEnter = () => {
    setIsInside(true);
    nextQuestion();
  };
  const handleMouseLeave = () => setIsInside(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
  };
  const handleClick = () => nextQuestion();

  return (
    <>
      <section
        className="understand-section"
        ref={sectionRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      >
        <div className="understand-atmo" />
        <div className="understand-line-sep" />
        <div className="understand-orb" />
        <div className="understand-text">
          <div
            className="understand-line understand-line-1"
            style={{ transform: `translateX(${offset}px)` }}
          >
            Understand
          </div>
          <div
            className="understand-line understand-line-2"
            style={{ transform: `translateX(${-offset}px)` }}
          >
            The Universe
          </div>
        </div>
      </section>

      {createPortal(
        <div
          ref={tooltipRef}
          className={`question-tooltip${isInside ? " visible" : ""}`}
        >
          {QUESTIONS[questionIdx]}
        </div>,
        document.body
      )}
    </>
  );
};

export default Understand;
