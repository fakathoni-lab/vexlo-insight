import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import SEO from "@/components/SEO";

const schema = z.object({
  fullName: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof schema>;

const Signup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  // Read prefill from sessionStorage (set by Hero preview)
  const prefillRaw = sessionStorage.getItem('vexlo_prefill');
  const prefill = prefillRaw ? JSON.parse(prefillRaw) as { domain: string; keyword: string } : null;

  const onSubmit = async (data: FormData) => {
    setServerError("");
    const { error } = await signUp(data.email, data.password, data.fullName);
    if (error) {
      setServerError(error.message);
      return;
    }
    // If prefill exists, redirect to proof generation with domain/keyword
    if (prefill?.domain) {
      sessionStorage.removeItem('vexlo_prefill');
      navigate(`/dashboard/new?domain=${encodeURIComponent(prefill.domain)}&keyword=${encodeURIComponent(prefill.keyword ?? '')}`);
    } else {
      navigate("/onboarding");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ backgroundColor: "#080808" }}>
      <SEO title="Sign Up — VEXLO" description="Create your VEXLO account and start generating SEO proof reports." canonical="https://vexloai.com/signup" />
      <div
        className="w-full max-w-[400px] rounded-[12px] border border-[rgba(255,255,255,0.07)] p-8"
        style={{ backgroundColor: "#0d0d0d" }}
      >
        <a href="/" className="block font-mono text-[13px] uppercase tracking-widest text-center mb-8" style={{ color: "#f0f0ee" }}>
          Vexlo
        </a>
        <h1 className="font-headline text-2xl text-center mb-1" style={{ color: "#f0f0ee" }}>
          Create your account
        </h1>
        <p className="text-center font-body text-sm mb-6" style={{ color: "rgba(240,240,238,0.45)" }}>
          Start generating proof reports today
        </p>

        {prefillDomain && (
          <div
            className="rounded-[8px] px-4 py-3 mb-6 text-center"
            style={{
              background: "rgba(255,99,8,0.08)",
              border: "1px solid rgba(255,99,8,0.2)",
            }}
          >
            <p className="font-sans text-sm" style={{ color: "var(--accent)" }}>
              Generate proof for <strong>{prefillDomain}</strong> after signing up
            </p>
            {prefillKeyword && (
              <p className="font-sans text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>
                Keyword: {prefillKeyword}
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "rgba(240,240,238,0.45)" }}>
              Full Name
            </Label>
            <Input
              type="text"
              placeholder="Jane Smith"
              disabled={isSubmitting}
              {...register("fullName")}
              className="h-10 bg-[#080808] border-[rgba(255,255,255,0.07)] text-[#f0f0ee] placeholder:text-[rgba(240,240,238,0.25)] font-body text-sm rounded-[4px] focus-visible:ring-[hsl(263,84%,58%)] focus-visible:ring-1 focus-visible:ring-offset-0"
            />
            {errors.fullName && (
              <p className="text-xs font-body" style={{ color: "hsl(0,80%,60%)" }}>{errors.fullName.message}</p>
            )}
          </div>

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

          <div className="flex flex-col gap-1.5">
            <Label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "rgba(240,240,238,0.45)" }}>
              Password
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
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
          </Button>
        </form>

        <p className="text-center font-body text-xs mt-4" style={{ color: "rgba(240,240,238,0.35)" }}>
          By creating an account, you agree to our{" "}
          <Link to="/legal/terms" className="underline transition-colors duration-200 hover:text-[#f0f0ee]" style={{ color: "rgba(240,240,238,0.55)" }}>
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/legal/privacy" className="underline transition-colors duration-200 hover:text-[#f0f0ee]" style={{ color: "rgba(240,240,238,0.55)" }}>
            Privacy Policy
          </Link>
        </p>

        <p className="text-center font-body text-sm mt-4" style={{ color: "rgba(240,240,238,0.45)" }}>
          Already have an account?{" "}
          <Link to="/login" className="transition-colors duration-200 hover:text-[#f0f0ee]" style={{ color: "hsl(263,84%,58%)" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
