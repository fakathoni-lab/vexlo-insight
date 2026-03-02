import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";

const schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

const ResetPassword = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash.includes("type=recovery") || hash.includes("access_token")) {
      setValidToken(true);
    } else {
      // Also check if user has an active session from recovery flow
      supabase.auth.getSession().then(({ data: { session } }) => {
        setValidToken(!!session);
      });
    }
  }, []);

  const onSubmit = async (data: FormData) => {
    setServerError("");
    const { error } = await supabase.auth.updateUser({ password: data.password });
    if (error) {
      setServerError(error.message);
      return;
    }
    setSuccess(true);
    setTimeout(() => navigate("/dashboard"), 2000);
  };

  if (validToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#080808" }}>
        <Loader2 size={28} className="animate-spin" style={{ color: "var(--accent)" }} />
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5" style={{ backgroundColor: "#080808" }}>
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle size={32} style={{ color: "var(--accent-danger, #ef4444)" }} />
          <h1 className="font-headline text-2xl" style={{ color: "#f0f0ee" }}>Invalid or expired link</h1>
          <p className="font-body text-sm" style={{ color: "rgba(240,240,238,0.45)" }}>
            Please request a new password reset link.
          </p>
          <a href="/forgot-password">
            <Button variant="outline" className="rounded-full mt-2">Request New Link</Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ backgroundColor: "#080808" }}>
      <SEO title="Set New Password — VEXLO" description="Set a new password for your VEXLO account." />
      <div
        className="w-full max-w-[400px] rounded-[12px] border border-[rgba(255,255,255,0.07)] p-8"
        style={{ backgroundColor: "#0d0d0d" }}
      >
        <a href="/" className="block font-mono text-[13px] uppercase tracking-widest text-center mb-8" style={{ color: "#f0f0ee" }}>
          Vexlo
        </a>

        {success ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle size={32} style={{ color: "var(--accent-success, #22c55e)" }} />
            <h1 className="font-headline text-2xl" style={{ color: "#f0f0ee" }}>Password updated</h1>
            <p className="font-body text-sm" style={{ color: "rgba(240,240,238,0.45)" }}>
              Redirecting to dashboard…
            </p>
          </div>
        ) : (
          <>
            <h1 className="font-headline text-2xl text-center mb-1" style={{ color: "#f0f0ee" }}>
              Set new password
            </h1>
            <p className="text-center font-body text-sm mb-8" style={{ color: "rgba(240,240,238,0.45)" }}>
              Enter your new password below
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "rgba(240,240,238,0.45)" }}>
                  New Password
                </Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  {...register("password")}
                  className="h-10 bg-[#080808] border-[rgba(255,255,255,0.07)] text-[#f0f0ee] placeholder:text-[rgba(240,240,238,0.25)] font-body text-sm rounded-[4px] focus-visible:ring-[hsl(263,84%,58%)] focus-visible:ring-1 focus-visible:ring-offset-0"
                />
                {errors.password && (
                  <p className="text-xs font-body" style={{ color: "hsl(0,80%,60%)" }}>{errors.password.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "rgba(240,240,238,0.45)" }}>
                  Confirm Password
                </Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  {...register("confirmPassword")}
                  className="h-10 bg-[#080808] border-[rgba(255,255,255,0.07)] text-[#f0f0ee] placeholder:text-[rgba(240,240,238,0.25)] font-body text-sm rounded-[4px] focus-visible:ring-[hsl(263,84%,58%)] focus-visible:ring-1 focus-visible:ring-offset-0"
                />
                {errors.confirmPassword && (
                  <p className="text-xs font-body" style={{ color: "hsl(0,80%,60%)" }}>{errors.confirmPassword.message}</p>
                )}
              </div>

              {serverError && (
                <p className="text-xs font-body text-center" style={{ color: "hsl(0,80%,60%)" }}>{serverError}</p>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 rounded-[100px] font-mono text-[10px] uppercase tracking-widest bg-[#f0f0ee] text-[#080808] hover:brightness-110 active:scale-[0.98] transition-all duration-200 mt-2"
                style={{
                  boxShadow: "0px 1.5px 2px -1px hsla(0,0%,100%,.2) inset, 0px 1.5px 1px 0px hsla(0,0%,100%,.06)",
                }}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
