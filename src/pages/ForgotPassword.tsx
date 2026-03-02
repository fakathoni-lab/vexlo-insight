import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormData = z.infer<typeof schema>;

const ForgotPassword = () => {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setServerError(error.message);
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ backgroundColor: "#080808" }}>
      <SEO title="Forgot Password — VEXLO" description="Reset your VEXLO account password." canonical="https://vexloai.com/forgot-password" />
      <div
        className="w-full max-w-[400px] rounded-[12px] border border-[rgba(255,255,255,0.07)] p-8"
        style={{ backgroundColor: "#0d0d0d" }}
      >
        <a href="/" className="block font-mono text-[13px] uppercase tracking-widest text-center mb-8" style={{ color: "#f0f0ee" }}>
          Vexlo
        </a>

        {sent ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle size={32} style={{ color: "var(--accent-success, #22c55e)" }} />
            <h1 className="font-headline text-2xl" style={{ color: "#f0f0ee" }}>Check your email</h1>
            <p className="font-body text-sm" style={{ color: "rgba(240,240,238,0.45)" }}>
              We sent a password reset link to your email. Click the link to set a new password.
            </p>
            <Link to="/login" className="font-mono text-[10px] uppercase tracking-widest mt-4 transition-colors hover:text-[#f0f0ee]" style={{ color: "rgba(240,240,238,0.45)" }}>
              ← Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-headline text-2xl text-center mb-1" style={{ color: "#f0f0ee" }}>
              Reset password
            </h1>
            <p className="text-center font-body text-sm mb-8" style={{ color: "rgba(240,240,238,0.45)" }}>
              Enter your email and we'll send a reset link
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "rgba(240,240,238,0.45)" }}>
                  Email
                </Label>
                <Input
                  type="email"
                  placeholder="you@agency.com"
                  disabled={isSubmitting}
                  {...register("email")}
                  className="h-10 bg-[#080808] border-[rgba(255,255,255,0.07)] text-[#f0f0ee] placeholder:text-[rgba(240,240,238,0.25)] font-body text-sm rounded-[4px] focus-visible:ring-[hsl(263,84%,58%)] focus-visible:ring-1 focus-visible:ring-offset-0"
                />
                {errors.email && (
                  <p className="text-xs font-body" style={{ color: "hsl(0,80%,60%)" }}>{errors.email.message}</p>
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
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
              </Button>
            </form>

            <p className="text-center font-body text-sm mt-6" style={{ color: "rgba(240,240,238,0.45)" }}>
              <Link to="/login" className="inline-flex items-center gap-1 transition-colors duration-200 hover:text-[#f0f0ee]" style={{ color: "rgba(240,240,238,0.45)" }}>
                <ArrowLeft size={12} /> Back to Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
