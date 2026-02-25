import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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
  placeholder = "you@agency.com",
}: WaitlistFormProps) => {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

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
        toast({
          title: "Already registered",
          description: "This email is already registered!",
        });
      } else {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
      return;
    }

    toast({
      title: "You're on the list!",
      description: "Watch your inbox.",
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 font-mono uppercase tracking-widest" style={{ fontSize: 10, color: "hsl(22,100%,52%)" }}>
        <CheckCircle className="w-4 h-4" />
        You're on the list
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col sm:flex-row gap-2.5 w-full max-w-[480px]"
    >
      <Input
        type="email"
        placeholder={placeholder}
        disabled={isSubmitting}
        {...register("email")}
        className="flex-1 h-10 bg-[#0d0d0d] border-[rgba(255,255,255,0.07)] text-[#f0f0ee] placeholder:text-[rgba(240,240,238,0.25)] font-body text-sm rounded-[4px] focus-visible:ring-[hsl(22,100%,52%)] focus-visible:ring-1 focus-visible:ring-offset-0"
      />
      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-10 px-6 rounded-[100px] font-mono text-[10px] uppercase tracking-widest bg-[#f0f0ee] text-[#080808] hover:brightness-110 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
        style={{
          boxShadow:
            "0px 1.5px 2px -1px hsla(0,0%,100%,.2) inset, 0px 1.5px 1px 0px hsla(0,0%,100%,.06)",
        }}
      >
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join Waitlist"}
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
