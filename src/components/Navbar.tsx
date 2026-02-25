import { useState, useEffect } from "react";

const navLinks = [
  { label: "Problem", href: "#problem" },
  { label: "How it works", href: "#how" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-10 max-sm:px-5 transition-all duration-300 ${
        scrolled ? "backdrop-blur-md bg-background/80 border-b border-border" : ""
      }`}
    >
      <a
        href="/"
        className="font-mono text-sm uppercase tracking-widest text-foreground"
      >
        Vexlo
      </a>

      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-muted-foreground text-sm font-body hover:text-foreground transition-colors duration-200"
          >
            {link.label}
          </a>
        ))}
      </div>

      <a
        href="#cta"
        className="h-9 px-4 inline-flex items-center border border-accent/25 text-accent font-mono text-xs uppercase tracking-widest rounded-button hover:bg-accent/[0.08] transition-all duration-200"
      >
        Early Access
      </a>
    </nav>
  );
};

export default Navbar;
