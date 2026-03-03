import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Signup from "./pages/Signup";
import PricingPage from "./pages/PricingPage";
import Dashboard from "./pages/Dashboard";
import NewProof from "./pages/NewProof";
import DomainSearch from "./pages/DomainSearch";
import ProofReport from "./pages/ProofReport";
import ProofResult from "./pages/ProofResult";
import PublicProof from "./pages/PublicProof";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import WebhookSuccess from "./pages/WebhookSuccess";
import WebhookCancel from "./pages/WebhookCancel";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayoutLegacy from "@/components/layout/DashboardLayout";
import DashboardLayoutNew from "@/layouts/DashboardLayout";
// ...existing routes kept
const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/proof/:id" element={<ProofReport />} />
        <Route path="/p/:slug" element={<PublicProof />} />
        <Route path="/check" element={<DomainSearch />} />
        <Route path="/webhook-success" element={<WebhookSuccess />} />
        <Route path="/webhook-cancel" element={<WebhookCancel />} />
        <Route element={<ProtectedRoute><DashboardLayoutNew /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/new" element={<NewProof />} />
          <Route path="/dashboard/domains" element={<DomainSearch />} />
          <Route path="/dashboard/proof/:id" element={<ProofResult />} />
          <Route path="/dashboard/history" element={<div className="font-sans" style={{ color: "var(--text-dim)" }}>Proof History coming soon</div>} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
