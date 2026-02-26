import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Footer = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");

  const footerLinks = [
    {
      title: t('footer.product'),
      links: [
        { label: t('footer.link_instant_proof'), href: "#product-demo" },
        { label: t('footer.link_ai_overview'), href: "#ai-overview" },
        { label: t('footer.link_features'), href: "#features" },
        { label: t('footer.link_pricing'), href: "/pricing" },
      ],
    },
    {
      title: t('footer.resources'),
      links: [
        { label: t('footer.link_blog'), href: "#" },
        { label: t('footer.link_case_studies'), href: "#" },
        { label: t('footer.link_faq'), href: "#faq" },
        { label: t('footer.link_help'), href: "#" },
      ],
    },
    {
      title: t('footer.developers'),
      links: [
        { label: t('footer.link_api'), href: "#" },
        { label: t('footer.link_integrations'), href: "#" },
        { label: t('footer.link_whitelabel'), href: "#" },
      ],
    },
    {
      title: t('footer.company'),
      links: [
        { label: t('footer.link_about'), href: "/company" },
        { label: t('footer.link_team'), href: "/company#team" },
        { label: t('footer.link_certified'), href: "#certified" },
        { label: t('footer.link_contact'), href: "mailto:sales@vexloai.com" },
      ],
    },
  ];

  return (
    <footer className="py-[100px] px-10 max-sm:py-[60px] max-sm:px-5" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="max-w-[1280px] mx-auto">
        {/* Newsletter */}
        <div className="rounded-[var(--radii-outer)] p-8 mb-16 text-center" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <p className="font-mono text-[9px] uppercase tracking-widest mb-3" style={{ color: "var(--accent)" }}>
            {t('footer.newsletter_label')}
          </p>
          <p className="font-body text-sm mb-6 max-w-[440px] mx-auto" style={{ color: "var(--text-dim)" }}>
            {t('footer.newsletter_body')}
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="flex gap-2 max-w-[400px] mx-auto">
            <Input
              type="email"
              placeholder={t('footer.newsletter_placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-10 rounded-[100px] text-sm bg-[var(--bg-raised)]"
              style={{ borderColor: "var(--border-strong)", color: "var(--text)" }}
            />
            <button type="submit" className="btn-primary" style={{ fontSize: 9 }}>
              {t('footer.newsletter_cta')}
            </button>
          </form>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="font-mono text-[10px] uppercase tracking-widest mb-4" style={{ color: "var(--text)" }}>{group.title}</h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm transition-colors duration-200 hover:text-foreground" style={{ color: "var(--text-dim)" }}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Agency seats CTA */}
        <div className="text-center mb-10">
          <p className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
            {t('footer.agency_seats')}{" "}
            <a href="mailto:sales@vexloai.com" className="underline" style={{ color: "var(--accent)" }}>
              sales@vexloai.com
            </a>
          </p>
        </div>

        {/* Copyright + Language Switcher */}
        <div className="pt-8 flex items-center justify-between flex-wrap gap-4" style={{ borderTop: "1px solid var(--border)" }}>
          <LanguageSwitcher />
          <p className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
