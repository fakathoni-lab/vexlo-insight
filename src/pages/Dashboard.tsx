import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen px-5 pt-24" style={{ backgroundColor: "#080808" }}>
      <div className="max-w-[1280px] mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <a href="/" className="font-mono text-[13px] uppercase tracking-widest mb-4 block" style={{ color: "#f0f0ee" }}>
              Vexlo
            </a>
            <h1 className="font-headline text-3xl" style={{ color: "#f0f0ee" }}>Dashboard</h1>
            <p className="font-body text-sm mt-1" style={{ color: "rgba(240,240,238,0.45)" }}>
              {user?.email}
            </p>
          </div>
          <button
            onClick={signOut}
            className="h-10 px-6 rounded-[100px] font-mono text-[10px] uppercase tracking-widest border transition-all duration-200 hover:bg-[rgba(255,255,255,0.05)]"
            style={{ borderColor: "rgba(255,255,255,0.13)", color: "rgba(240,240,238,0.45)" }}
          >
            Sign Out
          </button>
        </div>
        <div
          className="rounded-[12px] border border-[rgba(255,255,255,0.07)] p-12 text-center"
          style={{ backgroundColor: "#0d0d0d" }}
        >
          <p className="font-body" style={{ color: "rgba(240,240,238,0.45)" }}>
            Proof reports will appear here. This is a placeholder.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
