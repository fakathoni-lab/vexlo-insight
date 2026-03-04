import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Polar product IDs — replace with real IDs from Polar dashboard
export const POLAR_PRODUCT_STARTER = "48594d7c-4b3b-4d03-9db6-2bc2657b5d4f";
export const POLAR_PRODUCT_AGENCY_PRO = "c24835d7-bf2c-4aeb-9cc9-91836d0d1344";
export const POLAR_PRODUCT_AGENCY_ELITE = "455ba481-8440-48e2-aff9-508f4445dd01";

export function usePolarCheckout() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkout = useCallback(async (productId: string) => {
    setIsLoading(true);
    setLoadingProductId(productId);
    setError(null);

    try {
      const { data, error: fnErr } = await supabase.functions.invoke("polar-checkout", {
        body: {
          productId,
          successUrl: `${window.location.origin}/webhook-success`,
        },
      });

      if (fnErr) {
        setError(fnErr.message ?? "Checkout failed");
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        setError("No checkout URL returned");
      }
    } catch (e: any) {
      setError(e.message ?? "Unexpected error");
    } finally {
      setIsLoading(false);
      setLoadingProductId(null);
    }
  }, []);

  return { checkout, isLoading, loadingProductId, error };
}
