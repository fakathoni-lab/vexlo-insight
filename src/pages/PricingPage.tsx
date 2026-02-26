import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/Footer";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import SEO from "@/components/SEO";

const PricingPage = () => {
  return (
    <>
      <SEO
        title="Pricing — VEXLO | Sales Proof Intelligence"
        description="Simple, transparent pricing for SEO agencies. Generate proof reports from $39/mo. No credit card required to start."
        canonical="https://vexloai.com/pricing"
      />
      <Navbar />
      <main className="pt-20" style={{ backgroundColor: "var(--bg)" }}>
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
};

export default PricingPage;
