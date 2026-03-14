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
    <div className="min-h-screen bg-gradient-to-br from-bg via-bg to-bg-raised flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-orb-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-orb-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-md mx-auto">
        {/* 404 Number */}
        <div className="mb-8">
          <span className="text-9xl font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
            404
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-bold text-text mb-3">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg text-text-muted mb-8 leading-relaxed">
          We couldn't find the page you're looking for. It might have been moved or deleted.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-bg-card border border-border-strong text-text rounded-button font-medium transition-all duration-200 hover:border-border-strong hover:bg-bg-raised active:scale-95"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>

          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent text-white rounded-button font-medium transition-all duration-200 hover:opacity-90 active:scale-95"
          >
            Return Home
          </a>
        </div>

        {/* Help text */}
        <p className="mt-12 text-sm text-text-muted">
          Need help?{" "}
          <a
            href="/legal/privacy"
            className="text-accent hover:underline transition-colors"
          >
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
