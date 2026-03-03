import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const WebhookSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/dashboard"), 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0A0A1A" }}>
      <div className="text-center max-w-md px-6">
        <CheckCircle className="w-16 h-16 mx-auto mb-6" style={{ color: "#FF6308" }} />
        <h1 className="font-heading text-2xl mb-3" style={{ color: "#F0F0EE" }}>
          Payment Successful
        </h1>
        <p className="font-body text-sm mb-6" style={{ color: "var(--text-dim)" }}>
          Your plan has been upgraded. Redirecting to dashboard…
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="font-mono uppercase tracking-[0.1em] text-[11px] px-6 py-3 rounded-[100px] transition-colors"
          style={{ backgroundColor: "#FF6308", color: "#fff" }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default WebhookSuccess;
