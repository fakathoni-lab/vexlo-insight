import { ChevronDown } from "lucide-react";
import { useStarfield } from "@/hooks/useStarfield";

const Hero = () => {
  const canvasRef = useStarfield();

  return (
    <section className="hero">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div className="hero-atmosphere" />
      <div className="light-streaks" />
      <div className="hero-vignette" />
      <div className="hero-wordmark">
        <span className="hero-wordmark-text">VEXLO</span>
      </div>

      <div className="hero-content">
        <h1
          className="font-sans font-bold tracking-tight"
          style={{
            fontSize: "clamp(52px, 8vw, 108px)",
            color: "#FFFFFF",
            lineHeight: 1.1,
            marginBottom: "16px",
          }}
        >
          The First 60 Seconds<br />Decide the Deal.
        </h1>
        <p
          className="font-sans"
          style={{
            fontSize: "clamp(16px, 1.6vw, 20px)",
            fontWeight: 400,
            color: "#E5E7EB",
            lineHeight: 1.6,
            maxWidth: "520px",
            marginBottom: "32px",
          }}
        >
          Generate branded, prospect-specific SEO proof in under 60 seconds.
          No access. No waiting. No skill gap in the room.
        </p>
      </div>

      <div className="hero-search-outer">
        <div className="search-box">
          <label
            className="font-sans block mb-2"
            style={{ fontSize: "14px", fontWeight: 500, color: "#E5E7EB" }}
          >
            Enter your prospect's domain:
          </label>
          <textarea
            placeholder="e.g. example.com — best plumber london"
            rows={3}
          />
          <div className="search-actions">
            <div />
            <button
              className="hero-cta-btn"
              aria-label="Generate proof"
            >
              Generate Proof →
            </button>
          </div>
          <p
            className="font-sans mt-2 text-center"
            style={{ fontSize: "13px", color: "#9CA3AF" }}
          >
            Free. No login. ~30 seconds.
          </p>
        </div>
      </div>

      <div className="hero-bottom">
        <div className="scroll-indicator">
          <ChevronDown />
        </div>

        <div className="announcement">
          <div>
            <p className="ann-label">
              <strong>Founding Membership</strong> — Seleksi Terbatas
            </p>
          </div>
          <button
            className="ann-btn"
            onClick={() => {
              const el = document.querySelector("#waitlist");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Claim Founding Member Access
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
