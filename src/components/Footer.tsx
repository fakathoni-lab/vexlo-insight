import { useState } from "react";
import { Input } from "@/components/ui/input";

const footerLinks = [
  {
    title: "Produk",
    links: [
      { label: "Instant Proof Engine", href: "#product-demo" },
      { label: "AI Overview Impact", href: "#ai-overview" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "API Docs", href: "#" },
      { label: "Integrations", href: "#" },
      { label: "White-label Setup", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Mission", href: "#" },
      { label: "Certified Program", href: "#certified" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

const Footer = () => {
  const [email, setEmail] = useState("");

  return (
    <footer className="py-[100px] px-10 max-sm:py-[60px] max-sm:px-5" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="max-w-[1280px] mx-auto">
        {/* Newsletter */}
        <div
          className="rounded-[var(--radii-outer)] p-8 mb-16 text-center"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <p className="font-mono text-[9px] uppercase tracking-widest mb-3" style={{ color: "var(--accent)" }}>
            Monthly AI Overview Impact Index
          </p>
          <p className="font-body text-sm mb-6 max-w-[440px] mx-auto" style={{ color: "var(--text-dim)" }}>
            Data dari ribuan proof yang tidak bisa kamu dapat dari tool lain manapun.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex gap-2 max-w-[400px] mx-auto"
          >
            <Input
              type="email"
              placeholder="email@agency.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-10 rounded-[100px] text-sm bg-[var(--bg-raised)]"
              style={{ borderColor: "var(--border-strong)", color: "var(--text)" }}
            />
            <button type="submit" className="btn-primary" style={{ fontSize: 9 }}>
              Terima Laporan Gratis
            </button>
          </form>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="font-mono text-[10px] uppercase tracking-widest mb-4" style={{ color: "var(--text)" }}>
                {group.title}
              </h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm transition-colors duration-200 hover:text-foreground"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Agency seats CTA */}
        <div className="text-center mb-10">
          <p className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
            Need Agency seats? Talk to us →{" "}
            <a href="mailto:sales@vexlo.com" className="underline" style={{ color: "var(--accent)" }}>
              sales@vexlo.com
            </a>
          </p>
        </div>

        {/* Copyright */}
        <div className="pt-8" style={{ borderTop: "1px solid var(--border)" }}>
          <p className="font-mono text-xs text-center" style={{ color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} Vexlo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
