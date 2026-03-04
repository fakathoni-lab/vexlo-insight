import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import ToastContainer from "@/components/Toast";
import { ToastProvider, useToastContext } from "@/contexts/ToastContext";
import { Menu } from "lucide-react";

const DashboardInner = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("dashboard");
  const { addToast } = useToastContext();
  const location = useLocation();

  const sidebarWidth = sidebarOpen ? 220 : 60;

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        activeItem={activeItem}
        onNavClick={setActiveItem}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div
        className="flex flex-col min-h-screen transition-all duration-300"
        style={{
          transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Mobile hamburger */}
        <button
          className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-lg border"
          style={{
            background: "rgba(7,7,18,0.9)",
            borderColor: "rgba(255,255,255,0.08)",
          }}
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" style={{ color: "rgba(240,240,238,0.7)" }} />
        </button>

        {/* Desktop margin, no margin on mobile */}
        <div
          className="hidden md:block"
          style={{ marginLeft: sidebarWidth }}
        >
          <TopNav
            onSidebarToggle={() => setSidebarOpen((prev) => !prev)}
            onToast={(msg, type) => addToast(msg, type as any)}
          />
        </div>
        <div className="md:hidden">
          <TopNav
            onSidebarToggle={() => setMobileMenuOpen(true)}
            onToast={(msg, type) => addToast(msg, type as any)}
          />
        </div>

        <main
          className="flex-1 overflow-y-auto p-4 md:p-8 pt-16 md:pt-8"
          style={{
            marginLeft: 0,
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(99,102,241,0.19) transparent",
          }}
        >
          <div className="hidden md:block" style={{ marginLeft: sidebarWidth }}>
            <Outlet />
          </div>
          <div className="md:hidden">
            <Outlet />
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

const DashboardLayout = () => (
  <ToastProvider>
    <DashboardInner />
  </ToastProvider>
);

export default DashboardLayout;
