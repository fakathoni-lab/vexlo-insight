import { ChevronDown, ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-atmosphere" />
      <div className="light-streaks" />
      <div className="hero-vignette" />
      <div className="hero-wordmark">
        <span className="hero-wordmark-text">VEXLO</span>
      </div>

      <div className="hero-content">
        <div className="hero-eyebrow">Sales Proof Intelligence</div>
        <p className="hero-tagline">
          Generate visual SEO proof for any prospect in 30 seconds.
          No access required. No awkward asks. Just close.
        </p>
      </div>

      <div className="hero-search-outer">
        <div className="search-box">
          <textarea
            placeholder="e.g. example.com — best plumber london"
            rows={3}
          />
          <div className="search-actions">
            <button className="search-submit" aria-label="Generate proof">
              <ArrowRight />
            </button>
          </div>
        </div>
      </div>

      <div className="hero-bottom">
        <div className="scroll-indicator">
          <ChevronDown />
        </div>

        <div className="announcement">
          <div>
            <p className="ann-label">
              <strong>VEXLO Early Access</strong> — Founding Members Open:
            </p>
            <p className="ann-sub">
              17 of 50 founding member slots claimed. Lifetime deal at $149 — locked in forever.
            </p>
          </div>
          <button
            className="ann-btn"
            onClick={() => {
              const el = document.querySelector("#waitlist");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Claim Your Slot
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
