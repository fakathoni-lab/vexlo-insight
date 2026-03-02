import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DomainPricing {
  registration: number;
  renewal: number;
}

interface DomainCheckResult {
  success: boolean;
  domain: string;
  available: boolean;
  premium: boolean;
  pricing: Record<string, DomainPricing>;
  currency: string;
  checked_at: string;
  source: "cache" | "live";
  ttl: number;
}

interface DomainCheckError {
  success: false;
  error: string;
  message: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_DOMAIN: "Invalid domain format. Try something like example.com",
  RATE_LIMITED: "Too many requests. Please wait a minute and try again.",
  SERVICE_UNAVAILABLE: "Domain lookup service is temporarily unavailable. Try again shortly.",
  INTERNAL_ERROR: "Something went wrong. Please try again.",
  UNAUTHORIZED: "Please log in to check domains.",
};

export function useDomainCheck() {
  const [data, setData] = useState<DomainCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkDomain = useCallback(async (domain: string) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const { data: res, error: fnErr } = await supabase.functions.invoke(
        "domain-check",
        { body: { domain } }
      );

      if (fnErr) {
        setError(fnErr.message ?? "Domain check failed");
        return null;
      }

      if (!res?.success) {
        const errRes = res as DomainCheckError;
        const msg = ERROR_MESSAGES[errRes.error] ?? errRes.message ?? "Domain check failed";
        setError(msg);
        return null;
      }

      setData(res as DomainCheckResult);
      return res as DomainCheckResult;
    } catch (e: any) {
      setError(e.message ?? "Unexpected error");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, checkDomain };
}
