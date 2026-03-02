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
  error?: string;
}

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
        setError(res?.error ?? "Domain check failed");
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
