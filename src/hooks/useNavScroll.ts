// src/hooks/useNavScroll.ts
import { useState, useEffect } from "react";

export function useNavScroll(threshold = 16) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [threshold]);

  return scrolled;
}

// Usage in Navbar.tsx:
// const scrolled = useNavScroll()
// <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
