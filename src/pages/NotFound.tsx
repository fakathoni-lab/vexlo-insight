import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import "./NotFound.css";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // 404 logging removed for production security
  }, [location.pathname]);

  return (
    <div className="not-found-container">
      {/* Background decorative elements */}
      <div className="not-found-bg-decorations">
        <div className="not-found-orb not-found-orb-1"></div>
        <div className="not-found-orb not-found-orb-2"></div>
      </div>

      {/* Content */}
      <div className="not-found-content">
        {/* 404 Number */}
        <div className="not-found-number">404</div>

        {/* Heading */}
        <h1 className="not-found-heading">Page Not Found</h1>

        {/* Description */}
        <p className="not-found-description">
          We couldn't find the page you're looking for. It might have been moved or deleted.
        </p>

        {/* Action Buttons */}
        <div className="not-found-buttons">
          <button
            onClick={() => navigate(-1)}
            className="not-found-btn not-found-btn-secondary"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>

          <a href="/" className="not-found-btn not-found-btn-primary">
            Return Home
          </a>
        </div>

        {/* Help text */}
        <p className="not-found-help">
          Need help?{" "}
          <a href="/support" className="not-found-help-link">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
