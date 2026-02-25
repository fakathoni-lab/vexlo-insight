import { useState } from "react";
import { Menu, ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavScroll } from "@/hooks/useNavScroll";

const navGroups = [
  {
    label: "Produk",
    items: [
      { label: "Instant Proof Engine", href: "#product-demo" },
      { label: "AI Overview Impact", href: "#ai-overview" },
      { label: "Closing Narrative", href: "#features" },
      { label: "Domain Intelligence", href: "#infrastructure" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    label: "Developers",
    items: [
      { label: "API Documentation", href: "#" },
      { label: "Integrations", href: "#" },
      { label: "White-label Setup", href: "#" },
    ],
  },
  {
    label: "Company",
    items: [
      { label: "Mission", href: "#" },
      { label: "Team", href: "#" },
      { label: "Certified Program", href: "#certified" },
      { label: "Blog", href: "#" },
    ],
  },
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
      <a href="/" className="nav-logo">VEXLO</a>

      {/* CENTER — Dropdown groups (desktop) */}
      <div className="hidden md:flex items-center gap-1">
        {navGroups.map((group) => (
          <Popover key={group.label}>
            <PopoverTrigger asChild>
              <button
                className="flex items-center gap-1 font-mono text-[10.5px] uppercase tracking-wide px-3.5 py-1.5 rounded-[4px] transition-colors duration-200 hover:bg-[rgba(255,255,255,0.05)]"
                style={{ color: "var(--text-dim)" }}
              >
                {group.label}
                <ChevronDown className="w-3 h-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[220px] p-2 border rounded-[8px]"
              style={{
                backgroundColor: "var(--bg-raised)",
                borderColor: "var(--border-strong)",
              }}
              sideOffset={8}
            >
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleNavClick(item.href)}
                    className="text-left font-body text-sm px-3 py-2 rounded-[4px] transition-colors duration-200 hover:bg-[rgba(255,255,255,0.05)]"
                    style={{ color: "var(--text-dim)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-dim)")}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        ))}
      </div>

      {/* RIGHT — Dual CTAs + Mobile menu */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => handleNavClick("#waitlist")}
          className="btn-ghost hidden md:inline-flex"
        >
          Agency Sales
        </button>
        <button
          onClick={() => handleNavClick("#waitlist")}
          className="btn-primary hidden md:inline-flex"
        >
          Coba Gratis
        </button>

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
            <div className="flex flex-col gap-6 mt-10">
              {navGroups.map((group) => (
                <div key={group.label}>
                  <p
                    className="font-mono text-[9px] uppercase tracking-[0.2em] px-4 mb-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {group.label}
                  </p>
                  {group.items.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleNavClick(item.href)}
                      className="w-full font-body text-sm text-left px-4 py-2.5 rounded transition-colors duration-200 hover:bg-[rgba(255,255,255,0.05)]"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ))}
              <div className="flex flex-col gap-2 px-4 mt-4">
                <button onClick={() => handleNavClick("#waitlist")} className="btn-primary w-full">
                  Coba Gratis
                </button>
                <button onClick={() => handleNavClick("#waitlist")} className="btn-ghost w-full">
                  Agency Sales
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;
