import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useNavScroll } from "@/hooks/useNavScroll";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "/pricing", isRoute: true },
  { label: "Use Cases", href: "#segments" },
  { label: "FAQ", href: "#faq" },
  { label: "About", href: "#infrastructure" },
];

const Navbar = () => {
  const scrolled = useNavScroll();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();

  const handleNavClick = (href: string, isRoute?: boolean) => {
    setOpen(false);
    if (isRoute || href.startsWith("/")) {
      navigate(href);
    } else if (href.startsWith("mailto:")) {
      window.location.href = href;
    } else {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
      {/* Logo + tagline */}
      <a href="/" className="nav-logo" style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <svg height="22" viewBox="0 0 120 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="0" y="18" fontFamily="'Space Mono', monospace" fontSize="18" fontWeight="700" letterSpacing="0.12em" fill="currentColor">VEXLO</text>
        </svg>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.08em", color: "#9CA3AF", textTransform: "uppercase" }}>
          Sales Proof Intelligence
        </span>
      </a>

      {/* Center — flat links (desktop) */}
      <div className="nav-links hidden md:flex" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            style={{ color: "#9CA3AF" }}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick(link.href, link.isRoute);
            }}
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Right — ghost CTA + mobile menu */}
      <div className="flex items-center gap-2.5">
        {!loading && !user && (
          <>
            <button
              onClick={() => navigate("/login")}
              className="nav-cta hidden md:inline-flex"
              style={{
                background: "transparent",
                color: "var(--text-dim)",
                border: "1.5px solid var(--border-strong)",
              }}
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="nav-cta hidden md:inline-flex"
              style={{
                background: "var(--accent)",
                color: "#fff",
                border: "none",
              }}
            >
              Get Started
            </button>
          </>
        )}
        {!loading && user && (
          <button
            onClick={() => navigate("/dashboard")}
            className="nav-cta hidden md:inline-flex"
            style={{
              background: "transparent",
              color: "var(--text)",
              border: "1.5px solid var(--border-strong)",
            }}
          >
            Dashboard
          </button>
        )}

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className="md:hidden p-2 rounded transition-colors duration-200 hover:bg-[rgba(255,255,255,0.05)]"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" style={{ color: "var(--text)" }} />
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[280px] border-l"
            style={{ backgroundColor: "var(--bg-raised)", borderColor: "var(--border)" }}
          >
            <div className="flex flex-col gap-2 mt-10">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href, link.isRoute)}
                  className="w-full font-body text-sm text-left px-4 py-2.5 rounded transition-colors duration-200 hover:bg-[rgba(255,255,255,0.05)]"
                  style={{ color: "#9CA3AF" }}
                >
                  {link.label}
                </button>
              ))}
              <div className="px-4 mt-4 flex flex-col gap-2">
                {!loading && !user && (
                  <>
                    <button onClick={() => { setOpen(false); navigate("/login"); }} className="btn-ghost w-full">
                      Login
                    </button>
                    <button
                      onClick={() => { setOpen(false); navigate("/signup"); }}
                      className="w-full rounded-full h-10 text-xs uppercase tracking-widest"
                      style={{ fontFamily: "var(--font-mono)", background: "var(--accent)", color: "#fff" }}
                    >
                      Get Started
                    </button>
                  </>
                )}
                {!loading && user && (
                  <button onClick={() => { setOpen(false); navigate("/dashboard"); }} className="btn-ghost w-full">
                    Dashboard
                  </button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;
