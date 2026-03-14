import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // 404 logging removed for production security
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden" style={{ background: "var(--bg)" }}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-orb-pulse" 
          style={{ background: "var(--accent)" }}
        ></div>
        <div 
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-orb-pulse" 
          style={{ 
            background: "var(--accent)",
            animationDelay: "2s"
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-md mx-auto">
        {/* 404 Number */}
        <div className="mb-8">
          <span 
            className="block text-8xl sm:text-9xl font-bold"
            style={{
              background: "linear-gradient(to right, var(--accent), var(--accent-light))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}
          >
            404
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: "var(--text)" }}>
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg mb-8 leading-relaxed" style={{ color: "var(--text-muted)" }}>
          We couldn't find the page you're looking for. It might have been moved or deleted.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-2.5 font-medium transition-all duration-200 active:scale-95 rounded-full"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-strong)",
              color: "var(--text)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-raised)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--bg-card)";
            }}
          >
            <ArrowLeft size={18} />
            Go Back
          </button>

          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 font-medium transition-all duration-200 active:scale-95 rounded-full"
            style={{ 
              background: "var(--accent)",
              color: "#ffffff"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            Return Home
          </a>
        </div>

        {/* Help text */}
        <p className="mt-12 text-sm" style={{ color: "var(--text-muted)" }}>
          Need help?{" "}
          <a
            href="/support"
            className="transition-colors hover:underline"
            style={{ color: "var(--accent)" }}
          >
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
