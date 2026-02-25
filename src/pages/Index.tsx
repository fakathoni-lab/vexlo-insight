import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import UseCases from "@/components/UseCases";
import Comparison from "@/components/Comparison";
import Demo from "@/components/Demo";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <div id="hero">
          <Hero />
        </div>
        <div id="problem">
          <Problem />
        </div>
        <div id="how">
          <HowItWorks />
        </div>
        <div id="features">
          <Features />
        </div>
        <div id="usecases">
          <UseCases />
        </div>
        <div id="compare">
          <Comparison />
        </div>
        <div id="demo">
          <Demo />
        </div>
        <div id="pricing">
          <Pricing />
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
