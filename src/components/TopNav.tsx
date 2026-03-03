import { useState, useRef, useEffect } from "react";
import { Menu, Search, Bell, ChevronDown, User, CreditCard, Key, LogOut } from "lucide-react";

interface TopNavProps {
  onSidebarToggle: () => void;
  onToast: (msg: string, type: string) => void;
}

const dropdownItems = [
  { label: "Profile", icon: User },
  { label: "Billing", icon: CreditCard },
  { label: "API Keys", icon: Key },
  { label: "Sign Out", icon: LogOut },
];

const TopNav = ({ onSidebarToggle, onToast }: TopNavProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header
      className="sticky top-0 z-40 h-16 flex items-center gap-4 px-8 border-b shrink-0"
      style={{
        background: "rgba(7,7,18,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      {/* Sidebar toggle */}
      <button
        onClick={onSidebarToggle}
        className="p-[7px] rounded-lg transition-colors duration-200 hover:bg-white/10"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Menu className="w-4 h-4" style={{ color: "#f0f0ee" }} />
      </button>

      {/* Search */}
      <div
        className="relative flex-1 max-w-[360px] transition-colors duration-200 rounded-lg"
        style={{
          border: `1px solid ${searchFocused ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`,
          background: "rgba(255,255,255,0.04)",
        }}
      >
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: "rgba(240,240,238,0.3)" }}
        />
        <input
          type="text"
          placeholder="Search domains, proofs, clients…"
          className="w-full bg-transparent pl-9 pr-12 py-2 text-sm font-sans outline-none"
          style={{ color: "#f0f0ee" }}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] px-1.5 py-0.5 rounded"
          style={{
            color: "rgba(240,240,238,0.4)",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          ⌘K
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bell */}
      <button
        onClick={() => onToast("3 proof links viewed by prospects today", "info")}
        className="relative p-[7px] rounded-lg transition-colors duration-200 hover:bg-white/10"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Bell className="w-4 h-4" style={{ color: "#f0f0ee" }} />
        <span
          className="absolute top-[5px] right-[5px] w-[7px] h-[7px] rounded-full animate-pulse"
          style={{
            background: "#6366f1",
            boxShadow: "0 0 6px #6366f1",
          }}
        />
      </button>

      {/* Profile dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-500"
          >
            <span className="font-sans text-xs font-bold text-white">AX</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5" style={{ color: "rgba(240,240,238,0.45)" }} />
        </button>

        {dropdownOpen && (
          <div
            className="absolute right-0 top-[calc(100%+8px)] z-[100] min-w-[180px] p-2 rounded-xl animate-dropdown-in"
            style={{
              background: "rgba(7,7,18,0.95)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
              transformOrigin: "top right",
            }}
          >
            {dropdownItems.map((item) => (
              <button
                key={item.label}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left font-sans text-sm transition-colors duration-150 hover:bg-[rgba(99,102,241,0.15)]"
                style={{ color: "rgba(240,240,238,0.7)" }}
                onClick={() => setDropdownOpen(false)}
              >
                <item.icon className="w-4 h-4" style={{ color: "rgba(240,240,238,0.35)" }} />
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default TopNav;
