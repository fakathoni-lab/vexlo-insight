import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { ArrowLeft } from "lucide-react";

const sections = [
  {
    title: "1. Service Description",
    content: `VEXLO provides SEO data intelligence tools designed for sales professionals and agencies. Our platform generates proof reports that visualize search engine ranking data, helping users communicate SEO performance to prospects and clients.\n\nVEXLO is a data presentation tool — not an SEO agency or consulting service.`,
  },
  {
    title: "2. Account Responsibilities",
    content: `You are responsible for maintaining the security of your account credentials. Do not share your password or allow others to access your account.\n\nYou must provide accurate information during registration. Each account is intended for use by a single individual or business entity.`,
  },
  {
    title: "3. Subscription & Billing",
    content: `Paid plans are billed on a monthly subscription basis through our payment partner, Polar.sh.\n\n• You may cancel your subscription at any time from your account settings.\n• Cancellation takes effect at the end of the current billing period.\n• No refunds are issued for partial months or unused report credits.\n• We reserve the right to change pricing with 30 days' notice.`,
  },
  {
    title: "4. Acceptable Use",
    content: `When using VEXLO, you agree not to:\n\n• Scrape, crawl, or programmatically extract data from the platform outside of provided APIs.\n• Resell, redistribute, or sublicense VEXLO data or reports without authorization.\n• Create multiple accounts to circumvent usage limits.\n• Use the service for any unlawful purpose or to harass, defame, or harm others.`,
  },
  {
    title: "5. Data & Reports",
    content: `Proof reports generated through VEXLO are for your own business use, including sharing with prospects and clients via shareable links.\n\nYou retain ownership of any original content you input into the platform. VEXLO retains the right to use anonymized, aggregated data to improve the service.`,
  },
  {
    title: "6. Limitation of Liability",
    content: `SEO data presented in VEXLO reports is sourced from third-party providers including DataForSEO. While we strive for accuracy, VEXLO does not guarantee the completeness or accuracy of any data.\n\nVEXLO is provided "as is" without warranties of any kind. We are not liable for any decisions made based on data presented in proof reports.\n\nOur total liability is limited to the amount you paid for the service in the 12 months preceding any claim.`,
  },
  {
    title: "7. Termination",
    content: `We reserve the right to suspend or terminate accounts that violate these Terms of Service. In cases of serious violations, termination may be immediate and without prior notice.\n\nUpon termination, your access to the platform will be revoked and your data will be deleted within 30 days.`,
  },
  {
    title: "8. Contact",
    content: `For legal inquiries or questions about these terms, contact us at:\n\n**legal@vexloai.com**`,
  },
];

const TermsOfService = () => (
  <div className="min-h-screen" style={{ backgroundColor: "var(--bg-base, #070712)" }}>
    <SEO
      title="Terms of Service — VEXLO"
      description="Terms and conditions for using the VEXLO platform."
      canonical="https://vexloai.com/legal/terms"
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
        Terms of Service
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

export default TermsOfService;
