import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// ── Schema ──
const schema = z.object({
  domain: z
    .string()
    .min(3, "Enter domain without https:// (e.g. example.com)")
    .max(253)
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/,
      "Enter domain without https:// (e.g. example.com)"
    ),
  keyword: z.string().trim().min(2, "Keyword must be at least 2 characters").max(100),
});
type FormData = z.infer<typeof schema>;

const NewProof = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillDomain = searchParams.get('domain') ?? '';
  const prefillKeyword = searchParams.get('keyword') ?? '';
  const submitRef = useRef<HTMLButtonElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [credits, setCredits] = useState<{ used: number; limit: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("proofs_used, proofs_limit")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setCredits({ used: data.proofs_used ?? 0, limit: data.proofs_limit ?? 5 });
      });
  }, [user]);

  const remaining = credits ? Math.max(0, credits.limit - credits.used) : null;
  const isExhausted = remaining !== null && remaining <= 0;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    setSubmitting(true);

    // Insert pending proof row
    const { data: proofRow, error: insertError } = await (supabase
      .from("proofs")
      .insert({
        user_id: user.id,
        domain: data.domain,
        keyword: data.keyword,
        score: 0,
        status: "pending",
      } as any)
      .select("id")
      .single() as any);

    if (insertError || !proofRow) {
      setSubmitting(false);
      toast.error("Failed to create proof", { description: insertError?.message });
      return;
    }

    // Redirect immediately — ProofResult will detect pending and invoke edge function
    navigate(`/dashboard/proof/${proofRow.id}`);
  };

  return (
    <div className="flex items-start justify-center pt-8">
      <div
        className="w-full max-w-[560px] rounded-[var(--radii-outer)]"
        style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", padding: 40 }}
      >
        <h2 className="font-headline mb-1" style={{ fontSize: 28, color: "var(--text)" }}>
          Generate Proof Report
        </h2>
        <p className="font-body font-light mb-8" style={{ fontSize: 13, color: "var(--text-dim)" }}>
          Enter any prospect domain and target keyword below.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>
              Domain
            </Label>
            <Input
              placeholder="example.com — no https://"
              {...register("domain")}
              className="h-10 rounded-[var(--radii-inner)] font-body text-sm"
              style={{
                backgroundColor: "var(--bg)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />
            {errors.domain && (
              <p className="text-xs font-body" style={{ color: "hsl(0,80%,60%)" }}>{errors.domain.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>
              Keyword
            </Label>
            <Input
              placeholder="best plumber london"
              {...register("keyword")}
              className="h-10 rounded-[var(--radii-inner)] font-body text-sm"
              style={{
                backgroundColor: "var(--bg)",
                borderColor: "var(--border)",
                color: "var(--text)",
              }}
            />
            {errors.keyword && (
              <p className="text-xs font-body" style={{ color: "hsl(0,80%,60%)" }}>{errors.keyword.message}</p>
            )}
          </div>

          {/* Credits indicator */}
          <div className="flex items-center justify-between px-1">
            {credits === null ? (
              <Skeleton className="h-3 w-28 bg-white/[0.08]" />
            ) : (
              <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: isExhausted ? "var(--accent-danger, #ef4444)" : "var(--text-muted)" }}>
                {remaining} / {credits.limit} credits remaining
              </span>
            )}
          </div>

          <Button
            type="submit"
            disabled={submitting || isExhausted}
            className="w-full h-10 rounded-full font-mono text-[10px] uppercase tracking-widest transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
            style={{
              backgroundColor: isExhausted ? "var(--text-muted)" : "var(--text)",
              color: "var(--bg)",
              boxShadow: isExhausted ? "none" : "var(--emboss-shadow), var(--inset-shadow)",
              cursor: isExhausted ? "not-allowed" : undefined,
            }}
          >
            {submitting ? "Creating…" : isExhausted ? "No Credits Remaining" : "Generate Proof Report"}
          </Button>
        </form>

        <p className="mt-5 font-mono text-center" style={{ fontSize: 9, color: "var(--text-muted)" }}>
          * Estimated public data — for sales context only
        </p>
      </div>
    </div>
  );
};

export default NewProof;
