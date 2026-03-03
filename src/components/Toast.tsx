import { useEffect, useRef } from "react";
import { CheckCircle2, Info, AlertCircle, X } from "lucide-react";
import { useToastContext, type ToastType } from "@/contexts/ToastContext";

const iconMap: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  info: Info,
  error: AlertCircle,
};

const colorMap: Record<ToastType, string> = {
  success: "#22c55e",
  info: "#6366f1",
  error: "#ef4444",
};

const ToastContainer = () => {
  const { toasts, removeToast } = useToastContext();

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        const color = colorMap[toast.type];
        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 min-w-[260px] max-w-[320px] rounded-xl animate-toast-in"
            style={{
              background: "rgba(7,7,18,0.92)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderLeft: `3px solid ${color}`,
            }}
          >
            <Icon className="w-4 h-4 shrink-0" style={{ color }} />
            <span className="flex-1 font-sans text-sm" style={{ color: "#f0f0ee" }}>
              {toast.message}
            </span>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-0.5 rounded hover:bg-white/5 transition-colors"
            >
              <X className="w-3.5 h-3.5" style={{ color: "rgba(240,240,238,0.35)" }} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
