import { LayoutGrid, Zap, Archive, Users, Globe, Link2, Settings, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface NavItem {
  id: string;
  label: string;
  Icon: typeof LayoutGrid;
  path: string;
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutGrid, path: "/dashboard" },
  { id: "proofs", label: "Proof Engine", Icon: Zap, path: "/dashboard/new" },
  { id: "archive", label: "Pitch Archive", Icon: Archive, path: "/dashboard/history" },
  { id: "clients", label: "Clients", Icon: Users, path: "/dashboard" },
  { id: "domains", label: "Domains", Icon: Globe, path: "/dashboard/domains" },
  { id: "links", label: "Proof Links", Icon: Link2, path: "/dashboard/history" },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeItem: string;
  onNavClick: (id: string) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const LightningIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 1L3 12H10L9 19L17 8H10L11 1Z" fill="#6366f1" stroke="#818cf8" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
);

function pathToId(pathname: string): string {
  if (pathname === "/dashboard") return "dashboard";
  if (pathname === "/dashboard/new") return "proofs";
  if (pathname === "/dashboard/history") return "archive";
  if (pathname === "/dashboard/domains") return "domains";
  if (pathname === "/settings") return "settings";
  return "dashboard";
}

const Sidebar = ({ isOpen, onToggle, activeItem: _activeItem, onNavClick, mobileOpen = false, onMobileClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeItem = pathToId(location.pathname);

  const handleNav = (item: NavItem) => {
    onNavClick(item.id);
    navigate(item.path);
    onMobileClose?.();
  };

  const handleSettings = () => {
    onNavClick("settings");
    navigate("/settings");
    onMobileClose?.();
  };

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden border-r transition-all duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      style={{
        width: isOpen ? 220 : 60,
        background: "rgba(7,7,18,0.97)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderColor: "rgba(255,255,255,0.07)",
        transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {/* Mobile close button */}
      {onMobileClose && (
        <button
          className="md:hidden absolute top-4 right-3 z-10 p-1 rounded-md"
          onClick={onMobileClose}
          style={{ color: "rgba(240,240,238,0.5)" }}
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {/* Logo */}
      <div
        className="flex items-center gap-3 h-16 shrink-0 border-b px-3"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ border: "1px solid rgba(99,102,241,0.3)" }}
        >
          <LightningIcon />
        </div>
        {isOpen && (
          <div className="flex flex-col overflow-hidden animate-sidebar-label-in">
            <span className="font-sans text-base font-extrabold tracking-tight" style={{ color: "#f0f0ee" }}>
              VEXLO
            </span>
            <span
              className="font-mono text-[10px] font-medium uppercase"
              style={{ letterSpacing: "0.15em", color: "rgba(99,102,241,0.8)" }}
            >
              SALES PROOF
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 py-3 overflow-y-auto">
        {navItems.map((item) => {
          const active = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item)}
              className="relative flex items-center gap-3 rounded-[10px] transition-colors duration-200 group"
              style={{
                padding: isOpen ? "10px 12px" : "10px",
                justifyContent: isOpen ? "flex-start" : "center",
                background: active ? "rgba(99,102,241,0.18)" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = "rgba(99,102,241,0.12)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-sm animate-sidebar-glow"
                  style={{
                    height: "60%",
                    background: "#6366f1",
                    boxShadow: "0 0 8px #6366f1",
                  }}
                />
              )}
              <item.Icon
                className="w-[18px] h-[18px] shrink-0"
                style={{ color: active ? "#818cf8" : "rgba(240,240,238,0.45)" }}
              />
              {isOpen && (
                <span
                  className="font-sans text-[13px] font-medium truncate"
                  style={{ color: active ? "#ffffff" : "rgba(240,240,238,0.45)" }}
                >
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Settings pinned bottom */}
      <div className="px-2 pb-3">
        <button
          onClick={handleSettings}
          className="relative flex items-center gap-3 rounded-[10px] w-full transition-colors duration-200"
          style={{
            padding: isOpen ? "10px 12px" : "10px",
            justifyContent: isOpen ? "flex-start" : "center",
            background: activeItem === "settings" ? "rgba(99,102,241,0.18)" : "transparent",
          }}
          onMouseEnter={(e) => {
            if (activeItem !== "settings") e.currentTarget.style.background = "rgba(99,102,241,0.12)";
          }}
          onMouseLeave={(e) => {
            if (activeItem !== "settings") e.currentTarget.style.background = "transparent";
          }}
        >
          {activeItem === "settings" && (
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-sm animate-sidebar-glow"
              style={{ height: "60%", background: "#6366f1", boxShadow: "0 0 8px #6366f1" }}
            />
          )}
          <Settings
            className="w-[18px] h-[18px] shrink-0"
            style={{ color: activeItem === "settings" ? "#818cf8" : "rgba(240,240,238,0.35)" }}
          />
          {isOpen && (
            <span
              className="font-sans text-[13px] font-medium"
              style={{ color: activeItem === "settings" ? "#ffffff" : "rgba(240,240,238,0.35)" }}
            >
              Settings
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
