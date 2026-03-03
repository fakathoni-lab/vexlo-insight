import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import ToastContainer from "@/components/Toast";
import { ToastProvider, useToastContext } from "@/contexts/ToastContext";

const DashboardInner = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState("dashboard");
  const { addToast } = useToastContext();

  const sidebarWidth = sidebarOpen ? 220 : 60;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
        activeItem={activeItem}
        onNavClick={setActiveItem}
      />

      <div
        className="flex flex-col min-h-screen transition-all duration-300"
        style={{
          marginLeft: sidebarWidth,
          transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <TopNav
          onSidebarToggle={() => setSidebarOpen((prev) => !prev)}
          onToast={(msg, type) => addToast(msg, type as any)}
        />

        <main
          className="flex-1 overflow-y-auto p-8"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(99,102,241,0.19) transparent",
          }}
        >
          <Outlet />
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
