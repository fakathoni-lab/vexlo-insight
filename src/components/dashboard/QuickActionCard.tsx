import { useNavigate } from "react-router-dom";

const QuickActionCard = () => {
  const navigate = useNavigate();

  return (
    <div className="rounded-outer border border-border bg-bg-card p-8 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(99,102,241,0.15)]">
      <p className="text-[15px] text-text mb-1" style={{ fontFamily: "var(--font-body)" }}>
        Generate New Proof
      </p>
      <p className="text-[13px] text-text-dim font-light mb-5" style={{ fontFamily: "var(--font-body)" }}>
        Enter any domain + keyword. Get proof in 30 seconds.
      </p>
      <button
        onClick={() => navigate("/dashboard/new")}
        className="btn-primary"
      >
        Start New Proof
      </button>
    </div>
  );
};

export default QuickActionCard;
