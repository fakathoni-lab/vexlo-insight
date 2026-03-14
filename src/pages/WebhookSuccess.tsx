import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

const WebhookSuccess = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { refreshProfile } = useAuth();

  useEffect(() => {
    // Invalidate all user-related queries to refresh subscription state
    queryClient.invalidateQueries({ queryKey: ["user"] });
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    queryClient.invalidateQueries({ queryKey: ["subscription"] });
    
    // Also refresh the auth profile
    refreshProfile();

    const timer = setTimeout(() => navigate("/dashboard"), 5000);
    return () => clearTimeout(timer);
  }, [navigate, queryClient, refreshProfile]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#080808" }}>
      <div className="text-center max-w-md px-6">
        <CheckCircle className="w-16 h-16 mx-auto mb-6" style={{ color: "#FF6308" }} />
        <h1 className="font-headline text-2xl mb-3" style={{ color: "#F0F0EE" }}>
          Payment Successful
        </h1>
        <p className="font-body text-sm mb-2" style={{ color: "var(--text-dim)" }}>
          Your plan has been upgraded. Refreshing your account...
        </p>
        <div className="flex items-center justify-center gap-2 mb-6">
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--text-muted)" }} />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Syncing subscription...
          </span>
        </div>
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
