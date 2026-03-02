import { useState } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { LayoutDashboard, Plus, History, Settings, LogOut, Menu, X, Globe } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, accent: false },
  { title: "New Proof", url: "/dashboard/new", icon: Plus, accent: true },
  { title: "Domain Search", url: "/dashboard/domains", icon: Globe, accent: false },
  { title: "Proof History", url: "/dashboard/history", icon: History, accent: false },
  { title: "Settings", url: "/settings", icon: Settings, accent: false },
];

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/new": "New Proof",
  "/dashboard/domains": "Domain Search",
  "/dashboard/history": "Proof History",
  "/settings": "Settings",
};

const DashboardLayout = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageTitle = pageTitles[location.pathname] ?? "Dashboard";
  const initials = (user?.user_metadata?.full_name as string)
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? user?.email?.slice(0, 2).toUpperCase() ?? "U";

  const plan = "free"; // will be pulled from profiles later

  const sidebarContent = (
    <>
      {/* Wordmark */}
      <div className="h-16 flex items-center px-5">
        <Link
          to="/dashboard"
          className="font-mono uppercase tracking-widest"
          style={{ fontSize: 12, color: "#f0f0ee" }}
        >
          Vexlo
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 mt-2 flex flex-col gap-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end
            className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] font-mono uppercase tracking-wide transition-colors duration-200 hover:bg-[rgba(255,255,255,0.03)]"
            activeClassName="bg-[rgba(124,58,237,0.08)] border-l-2 border-[var(--accent-purple)]"
            style={{
              fontSize: 9,
              color: item.accent ? "var(--accent)" : "var(--text-dim)",
            }}
            onClick={() => setMobileOpen(false)}
          >
            <item.icon className="w-4 h-4" />
            {item.title}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: user + sign out */}
      <div className="px-4 py-4 border-t border-[rgba(255,255,255,0.07)]">
        <p
          className="font-body text-xs truncate mb-2"
          style={{ color: "var(--text-dim)" }}
        >
          {user?.email}
        </p>
        <button
          onClick={signOut}
          className="flex items-center gap-2 font-mono uppercase tracking-wide transition-colors duration-200 hover:text-[#f0f0ee]"
          style={{ fontSize: 9, color: "var(--text-dim)" }}
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: "#080808" }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-60 shrink-0 border-r border-[rgba(255,255,255,0.07)]"
        style={{ backgroundColor: "#0f0f0f" }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="relative w-60 h-full flex flex-col border-r border-[rgba(255,255,255,0.07)]"
            style={{ backgroundColor: "#0f0f0f" }}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1"
              style={{ color: "var(--text-dim)" }}
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="h-16 shrink-0 flex items-center justify-between px-5 border-b border-[rgba(255,255,255,0.07)]"
          style={{ backgroundColor: "#080808" }}
        >
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-1.5 rounded hover:bg-[rgba(255,255,255,0.05)] transition-colors duration-200"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" style={{ color: "#f0f0ee" }} />
            </button>
            <span
              className="font-body font-normal"
              style={{ fontSize: 14, color: "#f0f0ee" }}
            >
              {pageTitle}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="font-mono uppercase tracking-widest rounded-[100px] border-[rgba(255,255,255,0.13)]"
              style={{ fontSize: 8, color: "var(--text-dim)", padding: "2px 8px" }}
            >
              {plan}
            </Badge>
            <Avatar className="w-7 h-7">
              <AvatarFallback
                className="font-mono text-[9px] uppercase"
                style={{ backgroundColor: "var(--accent-purple-dim)", color: "var(--accent-purple)" }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
