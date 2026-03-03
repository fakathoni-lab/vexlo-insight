import { useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";

const WebhookCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0A0A1A" }}>
      <div className="text-center max-w-md px-6">
        <XCircle className="w-16 h-16 mx-auto mb-6" style={{ color: "var(--text-dim)" }} />
        <h1 className="font-heading text-2xl mb-3" style={{ color: "#F0F0EE" }}>
          Payment Cancelled
        </h1>
        <p className="font-body text-sm mb-6" style={{ color: "var(--text-dim)" }}>
          No charges were made. You can try again anytime.
        </p>
        <button
          onClick={() => navigate("/pricing")}
          className="font-mono uppercase tracking-[0.1em] text-[11px] px-6 py-3 rounded-[100px] transition-colors"
          style={{ backgroundColor: "#FF6308", color: "#fff" }}
        >
          Back to Pricing
        </button>
      </div>
    </div>
  );
};

export default WebhookCancel;
