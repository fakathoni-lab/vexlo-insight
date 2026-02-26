import { createRoot } from "react-dom/client";
import { Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./i18n";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#080808' }}>
          <div className="animate-pulse font-mono text-sm uppercase tracking-widest" style={{ color: 'hsl(263, 84%, 58%)' }}>
            Loading VEXLO...
          </div>
        </div>
      }
    >
      <App />
    </Suspense>
  </HelmetProvider>
);
