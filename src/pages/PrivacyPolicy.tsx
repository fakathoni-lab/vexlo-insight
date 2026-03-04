import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { ArrowLeft } from "lucide-react";

const sections = [
  {
    title: "1. Information We Collect",
    content: `When you use VEXLO, we collect the following information:\n\n• **Account information** — your email address and name provided during registration.\n• **Usage data** — pages visited, features used, and interaction patterns within the platform.\n• **Domain queries** — the domains and keywords you enter to generate proof reports.\n\nWe do not collect information beyond what is necessary to provide and improve our service.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use your information to:\n\n• Generate SEO proof reports based on the domains and keywords you provide.\n• Process billing and subscriptions through our payment partner, Polar.sh.\n• Improve product functionality, fix bugs, and develop new features.\n• Communicate important service updates and account-related notifications.\n\nWe never sell your personal data to third parties.`,
  },
  {
    title: "3. Data Storage",
    content: `Your data is stored in a Supabase PostgreSQL database hosted on US-based servers. All data is encrypted at rest and in transit using industry-standard TLS encryption.\n\nWe retain your data for as long as your account is active. Upon account deletion, your data is permanently removed within 30 days.`,
  },
  {
    title: "4. Third-Party Services",
    content: `VEXLO integrates with the following third-party services:\n\n• **DataForSEO** — to retrieve SEO ranking and SERP data for proof report generation.\n• **Polar.sh** — to process subscription payments and manage billing.\n• **Upstash Redis** — for caching domain availability lookups.\n\nEach third-party service operates under its own privacy policy. We only share the minimum data necessary for each service to function.`,
  },
  {
    title: "5. Cookies",
    content: `VEXLO uses session cookies strictly for authentication purposes. These cookies keep you logged in and maintain your session state.\n\nWe do not use tracking cookies, advertising cookies, or any third-party analytics cookies.`,
  },
  {
    title: "6. GDPR / Your Rights",
    content: `Regardless of your location, you have the right to:\n\n• **Access** — request a copy of all personal data we hold about you.\n• **Delete** — request permanent deletion of your account and all associated data.\n• **Export** — receive your data in a portable, machine-readable format.\n• **Rectify** — correct any inaccurate personal information.\n\nTo exercise any of these rights, contact us at privacy@vexloai.com. We respond to all requests within 30 days.`,
  },
  {
    title: "7. Contact",
    content: `For any privacy-related questions or concerns, reach out to us at:\n\n**privacy@vexloai.com**`,
  },
];

const PrivacyPolicy = () => (
  <div className="min-h-screen" style={{ backgroundColor: "var(--bg-base, #070712)" }}>
    <SEO
      title="Privacy Policy — VEXLO"
      description="How VEXLO collects, uses, and protects your data."
      canonical="https://vexloai.com/legal/privacy"
    />
    <div className="max-w-[720px] mx-auto px-6 py-16 md:py-24">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest mb-10 transition-colors duration-200 hover:text-[var(--accent)]"
        style={{ color: "var(--text-dim)" }}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Home
      </Link>

      <h1 className="font-headline text-3xl md:text-4xl font-bold mb-2" style={{ color: "var(--text)" }}>
        Privacy Policy
      </h1>
      <p className="font-mono text-[11px] uppercase tracking-widest mb-12" style={{ color: "var(--text-muted)" }}>
        Last updated: March 4, 2026
      </p>

      <div className="space-y-10">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="font-headline text-lg font-semibold mb-3" style={{ color: "var(--text)" }}>
              {s.title}
            </h2>
            <div
              className="font-body text-sm leading-relaxed whitespace-pre-line"
              style={{ color: "var(--text-dim)", letterSpacing: "0.25px" }}
              dangerouslySetInnerHTML={{
                __html: s.content
                  .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text)">$1</strong>')
                  .replace(/\n/g, "<br />"),
              }}
            />
          </section>
        ))}
      </div>
    </div>
  </div>
);

export default PrivacyPolicy;
