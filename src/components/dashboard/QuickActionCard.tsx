import { useNavigate } from "react-router-dom";

const QuickActionCard = () => {
  const navigate = useNavigate();

  return (
    <div className="rounded-outer border border-border bg-bg-card p-8">
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
