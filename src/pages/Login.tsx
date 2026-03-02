import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
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
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof schema>;

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn } = useAuth();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    const { error } = await signIn(data.email, data.password);
    if (error) {
      setServerError(error.message);
      return;
    }
    const next = searchParams.get("next") || "/dashboard";
    navigate(next);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ backgroundColor: "#080808" }}>
      <SEO title="Sign In — VEXLO" description="Sign in to your VEXLO account." canonical="https://vexloai.com/login" />
      <div
        className="w-full max-w-[400px] rounded-[12px] border border-[rgba(255,255,255,0.07)] p-8"
        style={{ backgroundColor: "#0d0d0d" }}
      >
        <a href="/" className="block font-mono text-[13px] uppercase tracking-widest text-center mb-8" style={{ color: "#f0f0ee" }}>
          Vexlo
        </a>
        <h1 className="font-headline text-2xl text-center mb-1" style={{ color: "#f0f0ee" }}>
          Welcome back
        </h1>
        <p className="text-center font-body text-sm mb-8" style={{ color: "rgba(240,240,238,0.45)" }}>
          Sign in to your account
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
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
          </Button>
        </form>

        <p className="text-center font-body text-xs mt-4" style={{ color: "rgba(240,240,238,0.35)" }}>
          <Link to="/forgot-password" className="transition-colors duration-200 hover:text-[#f0f0ee]" style={{ color: "rgba(240,240,238,0.45)" }}>
            Forgot your password?
          </Link>
        </p>

        <p className="text-center font-body text-sm mt-4" style={{ color: "rgba(240,240,238,0.45)" }}>
          Don't have an account?{" "}
          <Link to="/signup" className="transition-colors duration-200 hover:text-[#f0f0ee]" style={{ color: "hsl(263,84%,58%)" }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
