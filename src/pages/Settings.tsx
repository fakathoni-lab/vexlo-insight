import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Check, User, Lock, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SEO from "@/components/SEO";

/* ── Schemas ── */
const profileSchema = z.object({
  full_name: z.string().min(1, "Name is required").max(100),
  agency_name: z.string().max(100).optional().or(z.literal("")),
  brand_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color"),
});

const passwordSchema = z
  .object({
    password: z.string().min(8, "Minimum 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

interface Profile {
  full_name: string | null;
  agency_name: string | null;
  brand_color: string | null;
  avatar_url: string | null;
  plan: string | null;
  plan_status: string | null;
  proofs_used: number | null;
  proofs_limit: number | null;
  email: string | null;
}

/* ── Section wrapper ── */
const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <div
    className="rounded-[var(--radii-outer)] border border-[var(--border)] p-6 lg:p-8"
    style={{ backgroundColor: "var(--bg-card)" }}
  >
    <div className="flex items-center gap-3 mb-6">
      <Icon className="w-4 h-4" style={{ color: "var(--accent-purple)" }} />
      <h2
        className="font-mono text-[10px] uppercase tracking-widest"
        style={{ color: "var(--text-dim)" }}
      >
        {title}
      </h2>
    </div>
    {children}
  </div>
);

/* ── Main ── */
const Settings = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  /* Profile form */
  const {
    register: regProfile,
    handleSubmit: handleProfile,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
    reset: resetProfile,
  } = useForm<ProfileData>({ resolver: zodResolver(profileSchema) });

  /* Password form */
  const {
    register: regPassword,
    handleSubmit: handlePassword,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
    reset: resetPassword,
  } = useForm<PasswordData>({ resolver: zodResolver(passwordSchema) });

  /* Fetch profile */
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, agency_name, brand_color, avatar_url, plan, plan_status, proofs_used, proofs_limit, email")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          toast.error("Failed to load profile");
          setLoading(false);
          return;
        }
        const p = data as Profile | null;
        setProfile(p);
        resetProfile({
          full_name: p?.full_name ?? "",
          agency_name: p?.agency_name ?? "",
          brand_color: p?.brand_color ?? "#ff6308",
        });
        setLoading(false);
      });
  }, [user, resetProfile]);

  /* Save profile */
  const onSaveProfile = async (data: ProfileData) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: data.full_name,
        agency_name: data.agency_name || null,
        brand_color: data.brand_color,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setProfileSaved(true);
    toast.success("Profile updated");
    setTimeout(() => setProfileSaved(false), 2000);
  };

  /* Change password */
  const onChangePassword = async (data: PasswordData) => {
    const { error } = await supabase.auth.updateUser({ password: data.password });
    if (error) {
      toast.error(error.message);
      return;
    }
    setPasswordChanged(true);
    resetPassword();
    toast.success("Password updated");
    setTimeout(() => setPasswordChanged(false), 2000);
  };

  const inputClass =
    "h-10 bg-[var(--bg)] border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] font-body text-sm rounded-[4px] focus-visible:ring-[var(--accent-purple)] focus-visible:ring-1 focus-visible:ring-offset-0";

  const labelClass =
    "font-mono text-[10px] uppercase tracking-widest text-[var(--text-dim)]";

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <SEO title="Settings — VEXLO" description="Manage your VEXLO account settings." />
        <Skeleton className="h-8 w-48 rounded" />
        <Skeleton className="h-64 w-full rounded-[var(--radii-outer)]" />
        <Skeleton className="h-48 w-full rounded-[var(--radii-outer)]" />
        <Skeleton className="h-40 w-full rounded-[var(--radii-outer)]" />
      </div>
    );
  }

  const plan = profile?.plan ?? "free";
  const used = profile?.proofs_used ?? 0;
  const limit = profile?.proofs_limit ?? 5;
  const usagePct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <SEO title="Settings — VEXLO" description="Manage your VEXLO account settings." />

      {/* ── Profile Section ── */}
      <Section icon={User} title="Profile">
        <form onSubmit={handleProfile(onSaveProfile)} className="flex flex-col gap-5">
          {/* Email (read-only) */}
          <div className="flex flex-col gap-1.5">
            <Label className={labelClass}>Email</Label>
            <Input
              value={user?.email ?? ""}
              disabled
              className={`${inputClass} opacity-50 cursor-not-allowed`}
            />
            <p className="text-[11px] font-body" style={{ color: "var(--text-muted)" }}>
              Email cannot be changed here
            </p>
          </div>

          {/* Full name */}
          <div className="flex flex-col gap-1.5">
            <Label className={labelClass}>Full Name</Label>
            <Input
              placeholder="Your name"
              disabled={profileSubmitting}
              {...regProfile("full_name")}
              className={inputClass}
            />
            {profileErrors.full_name && (
              <p className="text-xs font-body" style={{ color: "var(--accent-danger)" }}>
                {profileErrors.full_name.message}
              </p>
            )}
          </div>

          {/* Agency name */}
          <div className="flex flex-col gap-1.5">
            <Label className={labelClass}>Agency Name</Label>
            <Input
              placeholder="Your agency (optional)"
              disabled={profileSubmitting}
              {...regProfile("agency_name")}
              className={inputClass}
            />
          </div>

          {/* Brand color */}
          <div className="flex flex-col gap-1.5">
            <Label className={labelClass}>Brand Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                {...regProfile("brand_color")}
                className="w-10 h-10 rounded-[var(--radii-inner)] border border-[var(--border)] cursor-pointer bg-transparent p-0.5"
              />
              <Input
                placeholder="#ff6308"
                disabled={profileSubmitting}
                {...regProfile("brand_color")}
                className={`${inputClass} max-w-[140px]`}
              />
            </div>
            {profileErrors.brand_color && (
              <p className="text-xs font-body" style={{ color: "var(--accent-danger)" }}>
                {profileErrors.brand_color.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={profileSubmitting}
            className="h-10 rounded-[100px] font-mono text-[10px] uppercase tracking-widest bg-[var(--text)] text-[var(--bg)] hover:brightness-95 active:scale-[0.98] transition-all duration-200 w-fit px-8 mt-2"
            style={{
              boxShadow: "var(--emboss-shadow), var(--inset-shadow)",
            }}
          >
            {profileSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : profileSaved ? (
              <span className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </Section>

      {/* ── Password Section ── */}
      <Section icon={Lock} title="Change Password">
        <form onSubmit={handlePassword(onChangePassword)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label className={labelClass}>New Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              disabled={passwordSubmitting}
              {...regPassword("password")}
              className={inputClass}
            />
            {passwordErrors.password && (
              <p className="text-xs font-body" style={{ color: "var(--accent-danger)" }}>
                {passwordErrors.password.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className={labelClass}>Confirm Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              disabled={passwordSubmitting}
              {...regPassword("confirmPassword")}
              className={inputClass}
            />
            {passwordErrors.confirmPassword && (
              <p className="text-xs font-body" style={{ color: "var(--accent-danger)" }}>
                {passwordErrors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={passwordSubmitting}
            className="h-10 rounded-[100px] font-mono text-[10px] uppercase tracking-widest bg-[var(--text)] text-[var(--bg)] hover:brightness-95 active:scale-[0.98] transition-all duration-200 w-fit px-8 mt-2"
            style={{
              boxShadow: "var(--emboss-shadow), var(--inset-shadow)",
            }}
          >
            {passwordSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : passwordChanged ? (
              <span className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5" /> Updated
              </span>
            ) : (
              "Update Password"
            )}
          </Button>
        </form>
      </Section>

      {/* ── Plan & Usage Section ── */}
      <Section icon={CreditCard} title="Plan & Usage">
        <div className="flex flex-col gap-5">
          {/* Current plan */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-body text-sm" style={{ color: "var(--text)" }}>
                Current Plan
              </p>
              <p className="font-body text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>
                {plan === "free"
                  ? "Free tier — 5 proofs included"
                  : `${plan.charAt(0).toUpperCase() + plan.slice(1)} plan`}
              </p>
            </div>
            <Badge
              variant="outline"
              className="font-mono uppercase tracking-widest rounded-[100px] border-[var(--accent-purple-border)]"
              style={{
                fontSize: 9,
                color: "var(--accent-purple)",
                padding: "3px 12px",
              }}
            >
              {plan}
            </Badge>
          </div>

          <Separator className="bg-[var(--border)]" />

          {/* Usage bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-body text-sm" style={{ color: "var(--text)" }}>
                Proofs Used
              </p>
              <p className="font-mono text-[11px]" style={{ color: "var(--text-dim)" }}>
                {used} / {limit}
              </p>
            </div>
            <div
              className="h-2 w-full rounded-full overflow-hidden"
              style={{ backgroundColor: "var(--bg)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${usagePct}%`,
                  backgroundColor:
                    usagePct >= 90
                      ? "var(--accent-danger)"
                      : usagePct >= 60
                        ? "var(--accent)"
                        : "var(--accent-success)",
                }}
              />
            </div>
            {usagePct >= 90 && (
              <p className="text-xs font-body mt-2" style={{ color: "var(--accent-danger)" }}>
                You're nearing your proof limit. Upgrade to continue generating proofs.
              </p>
            )}
          </div>

          <Separator className="bg-[var(--border)]" />

          {/* Upgrade CTA */}
          <div className="flex items-center justify-between">
            <p className="font-body text-xs" style={{ color: "var(--text-dim)" }}>
              Need more proofs or premium features?
            </p>
            <Button
              variant="outline"
              className="rounded-[100px] font-mono text-[9px] uppercase tracking-widest border-[var(--border-strong)] hover:border-[var(--accent-purple-border)] hover:text-[var(--accent-purple)] transition-all duration-200 h-8 px-5"
              style={{ color: "var(--text-dim)" }}
              onClick={() => window.open("/pricing", "_blank")}
            >
              View Plans
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default Settings;
