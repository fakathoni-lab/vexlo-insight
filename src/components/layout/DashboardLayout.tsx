import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { LayoutDashboard, Plus, History, Settings, LogOut, Menu, X } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const DashboardLayout = () => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { title: t('dashboard.nav_dashboard'), url: "/dashboard", icon: LayoutDashboard, accent: false },
    { title: t('dashboard.nav_new_proof'), url: "/dashboard/new", icon: Plus, accent: true },
    { title: t('dashboard.nav_history'), url: "/dashboard/history", icon: History, accent: false },
    { title: t('dashboard.nav_settings'), url: "/settings", icon: Settings, accent: false },
  ];

  const pageTitles: Record<string, string> = {
    "/dashboard": t('dashboard.nav_dashboard'),
    "/dashboard/new": t('dashboard.nav_new_proof'),
    "/dashboard/history": t('dashboard.nav_history'),
    "/settings": t('dashboard.nav_settings'),
  };

  const pageTitle = pageTitles[location.pathname] ?? t('dashboard.nav_dashboard');
  const initials = (user?.user_metadata?.full_name as string)
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? user?.email?.slice(0, 2).toUpperCase() ?? "U";

  const plan = "free";

  const sidebarContent = (
    <>
      <div className="h-16 flex items-center px-5">
        <Link to="/dashboard" className="font-mono uppercase tracking-widest" style={{ fontSize: 12, color: "#f0f0ee" }}>Vexlo</Link>
      </div>
      <nav className="flex-1 px-3 mt-2 flex flex-col gap-0.5">
        {navItems.map((item) => (
          <NavLink key={item.url} to={item.url} end className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] font-mono uppercase tracking-wide transition-colors duration-200 hover:bg-[rgba(255,255,255,0.03)]" activeClassName="bg-[rgba(124,58,237,0.08)] border-l-2 border-[var(--accent)]" style={{ fontSize: 9, color: item.accent ? "var(--accent)" : "var(--text-dim)" }} onClick={() => setMobileOpen(false)}>
            <item.icon className="w-4 h-4" />
            {item.title}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-[rgba(255,255,255,0.07)]">
        <p className="font-body text-xs truncate mb-2" style={{ color: "var(--text-dim)" }}>{user?.email}</p>
        <button onClick={signOut} className="flex items-center gap-2 font-mono uppercase tracking-wide transition-colors duration-200 hover:text-[#f0f0ee]" style={{ fontSize: 9, color: "var(--text-dim)" }}>
          <LogOut className="w-3.5 h-3.5" />
          {t('dashboard.sign_out')}
        </button>
      </div>
    </>
  );

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: "#080808" }}>
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-[rgba(255,255,255,0.07)]" style={{ backgroundColor: "#0f0f0f" }}>{sidebarContent}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-60 h-full flex flex-col border-r border-[rgba(255,255,255,0.07)]" style={{ backgroundColor: "#0f0f0f" }}>
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-1" style={{ color: "var(--text-dim)" }}><X className="w-5 h-5" /></button>
            {sidebarContent}
          </aside>
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 flex items-center justify-between px-5 border-b border-[rgba(255,255,255,0.07)]" style={{ backgroundColor: "#080808" }}>
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1.5 rounded hover:bg-[rgba(255,255,255,0.05)] transition-colors duration-200" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" style={{ color: "#f0f0ee" }} />
            </button>
            <span className="font-body font-normal" style={{ fontSize: 14, color: "#f0f0ee" }}>{pageTitle}</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="font-mono uppercase tracking-widest rounded-[100px] border-[rgba(255,255,255,0.13)]" style={{ fontSize: 8, color: "var(--text-dim)", padding: "2px 8px" }}>{plan}</Badge>
            <Avatar className="w-7 h-7">
              <AvatarFallback className="font-mono text-[9px] uppercase" style={{ backgroundColor: "rgba(124,58,237,0.12)", color: "var(--accent)" }}>{initials}</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-5 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
};

export default DashboardLayout;
