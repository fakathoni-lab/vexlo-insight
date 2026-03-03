import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Polar product IDs — replace with real IDs from Polar dashboard
export const POLAR_PRODUCT_STARTER = "PLACEHOLDER_STARTER_PRODUCT_ID"; // [PLACEHOLDER] Replace with Polar Starter product ID
export const POLAR_PRODUCT_AGENCY_PRO = "PLACEHOLDER_AGENCY_PRO_PRODUCT_ID"; // [PLACEHOLDER] Replace with Polar Agency Pro product ID
export const POLAR_PRODUCT_AGENCY_ELITE = "PLACEHOLDER_AGENCY_ELITE_PRODUCT_ID"; // [PLACEHOLDER] Replace with Polar Agency Elite product ID

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
