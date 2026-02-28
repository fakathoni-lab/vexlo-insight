import { useState, useEffect, useRef } from "react";

const Typewriter = ({ text }: { text: string }) => {
  const [displayed, setDisplayed] = useState("");
  const idx = useRef(0);

  useEffect(() => {
    idx.current = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      idx.current++;
      setDisplayed(text.slice(0, idx.current));
      if (idx.current >= text.length) clearInterval(interval);
    }, 18);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <p className="font-body font-light leading-relaxed" style={{ fontSize: 14, color: "rgba(240,240,238,0.7)" }}>
      {displayed}
      {displayed.length < text.length && (
        <span className="inline-block w-0.5 h-4 ml-0.5 animate-pulse" style={{ backgroundColor: "var(--accent)" }} />
      )}
    </p>
  );
};

export default Typewriter;
