import { useLocation, Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import SEO from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: "#080808" }}
    >
      <SEO
        title="404 — Page Not Found | VEXLO"
        description="The page you're looking for doesn't exist."
      />
      
      <div className="text-center max-w-md">
        {/* 404 Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-[100px]"
          style={{
            backgroundColor: "rgba(255,99,8,0.12)",
            border: "1px solid rgba(255,99,8,0.25)",
          }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "#FF6308", fontFamily: "'Space Mono', monospace" }}
          >
            Error 404
          </span>
        </div>

        {/* Heading */}
        <h1
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ color: "#f0f0ee", fontFamily: "'Instrument Serif', serif" }}
        >
          Page not found
        </h1>

        {/* Description */}
        <p
          className="text-base mb-2"
          style={{ color: "rgba(240,240,238,0.45)", fontFamily: "'DM Sans', sans-serif" }}
        >
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        {/* Path display */}
        <p
          className="text-xs mb-8"
          style={{ color: "rgba(240,240,238,0.25)", fontFamily: "'Space Mono', monospace" }}
        >
          Path: {location.pathname}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-[100px] font-mono text-[10px] uppercase tracking-widest transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
            style={{
              backgroundColor: "#f0f0ee",
              color: "#080808",
              boxShadow: "0px 1.5px 2px -1px hsla(0,0%,100%,.2) inset, 0px 1.5px 1px 0px hsla(0,0%,100%,.06)",
            }}
          >
            <Home className="w-3.5 h-3.5" />
            Back to Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-[100px] font-mono text-[10px] uppercase tracking-widest transition-all duration-200"
            style={{
              backgroundColor: "transparent",
              color: "rgba(240,240,238,0.45)",
              border: "1px solid rgba(255,255,255,0.13)",
            }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
