import SEO from "@/components/SEO";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import PainAmplification from "@/components/sections/PainAmplification";
import Understand from "@/components/sections/Understand";
import ProductDemo from "@/components/sections/ProductDemo";
import SocialProof from "@/components/sections/SocialProof";
import FeatureMatrix from "@/components/sections/FeatureMatrix";
import SegmentSelector from "@/components/sections/SegmentSelector";
import AIOverview from "@/components/sections/AIOverview";
import InfrastructureMoat from "@/components/sections/InfrastructureMoat";
import Pricing from "@/components/Pricing";
import CategoryOwnership from "@/components/sections/CategoryOwnership";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO />
      <Navbar />
      <main>
        <div id="hero">
          <Hero />
        </div>
        <div id="pain">
          <PainAmplification />
        </div>
        <div id="understand">
          <Understand />
        </div>
        <div id="product-demo">
          <ProductDemo />
        </div>
        <div id="social-proof">
          <SocialProof />
        </div>
        <div id="features">
          <FeatureMatrix />
        </div>
        <div id="segments">
          <SegmentSelector />
        </div>
        <div id="ai-overview">
          <AIOverview />
        </div>
        <div id="infrastructure">
          <InfrastructureMoat />
        </div>
        <div id="pricing">
          <Pricing />
        </div>
        <div id="certified">
          <CategoryOwnership />
        </div>
        <div id="faq">
          <FAQ />
        </div>
        <div id="cta">
          <CTA />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
