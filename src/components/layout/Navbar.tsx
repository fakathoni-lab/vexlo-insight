import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useNavScroll } from "@/hooks/useNavScroll";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Use Cases", href: "#usecases" },
  { label: "FAQ", href: "#faq" },
];

const Navbar = () => {
  const scrolled = useNavScroll();
  const [open, setOpen] = useState(false);

  const handleNavClick = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
      {/* LEFT — Wordmark */}
      <a href="/" className="nav-logo">
        VEXLO
      </a>

      {/* CENTER — Nav links (desktop) */}
      <div className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => (
          <button
            key={link.href}
            onClick={() => handleNavClick(link.href)}
            className="font-mono text-[10.5px] uppercase tracking-wide px-3.5 py-1.5 rounded-[4px] transition-colors duration-200 hover:bg-[rgba(255,255,255,0.05)]"
            style={{ color: "rgba(240,240,238,0.45)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f0f0ee")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(240,240,238,0.45)")
            }
          >
            {link.label}
          </button>
        ))}
      </div>

      {/* RIGHT — CTA + Mobile menu */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleNavClick("#waitlist")}
          className="btn-primary hidden md:inline-flex"
        >
          Get Early Access
        </button>

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className="md:hidden p-2 rounded transition-colors duration-200 hover:bg-[rgba(255,255,255,0.05)]"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" style={{ color: "#f0f0ee" }} />
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[280px] border-l border-[rgba(255,255,255,0.07)]"
            style={{ backgroundColor: "#0f0f0f" }}
          >
            <div className="flex flex-col gap-2 mt-10">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="font-mono text-[11px] uppercase tracking-wide px-4 py-3 rounded text-left transition-colors duration-200 hover:bg-[rgba(255,255,255,0.05)]"
                  style={{ color: "rgba(240,240,238,0.45)" }}
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => handleNavClick("#waitlist")}
                className="btn-primary mt-4 w-full"
              >
                Get Early Access
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;
