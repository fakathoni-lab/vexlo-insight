import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  email: z.string().email("Please enter a valid email address").max(255),
});

type FormData = z.infer<typeof schema>;

interface WaitlistFormProps {
  source?: "hero_cta" | "footer_cta" | "pricing_cta" | "landing_page";
  placeholder?: string;
}

const WaitlistForm = ({
  source = "hero_cta",
  placeholder,
}: WaitlistFormProps) => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    const { error } = await supabase
      .from("waitlist")
      .insert({ email: data.email, source });

    if (error) {
      if (error.code === "23505") {
        toast(t('waitlist.toast_duplicate'), { description: t('waitlist.toast_duplicate_desc') });
      } else {
        toast.error(t('waitlist.toast_error'), { description: t('waitlist.toast_error_desc') });
      }
      return;
    }

    toast(t('waitlist.toast_success'), { description: t('waitlist.toast_success_desc') });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 font-mono uppercase tracking-widest" style={{ fontSize: 10, color: "hsl(263,84%,58%)" }}>
        <CheckCircle className="w-4 h-4" />
        {t('waitlist.success')}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-2.5 w-full max-w-[480px]">
      <Input
        type="email"
        placeholder={placeholder || t('waitlist.placeholder')}
        disabled={isSubmitting}
        {...register("email")}
        className="flex-1 h-10 bg-[#0d0d0d] border-[rgba(255,255,255,0.07)] text-[#f0f0ee] placeholder:text-[var(--text-muted)] font-body text-sm rounded-[4px] focus-visible:ring-[hsl(263,84%,58%)] focus-visible:ring-1 focus-visible:ring-offset-0"
      />
      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-10 px-6 rounded-[100px] font-mono text-[10px] uppercase tracking-widest bg-[#f0f0ee] text-[#080808] hover:brightness-110 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
        style={{
          boxShadow: "0px 1.5px 2px -1px hsla(0,0%,100%,.2) inset, 0px 1.5px 1px 0px hsla(0,0%,100%,.06)",
        }}
      >
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('waitlist.cta')}
      </Button>
      {errors.email && (
        <p className="text-xs font-body sm:absolute sm:bottom-[-20px]" style={{ color: "hsl(0,80%,60%)" }}>
          {errors.email.message}
        </p>
      )}
    </form>
  );
};

export default WaitlistForm;
