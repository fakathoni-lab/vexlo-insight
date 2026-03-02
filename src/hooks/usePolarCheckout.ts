import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Polar product ID for Premium $2/mo
const POLAR_PREMIUM_PRODUCT_ID = "a59f2d3a-790d-4e95-a875-5e5c35e2e7dd";

export function usePolarCheckout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkout = useCallback(async (productId?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnErr } = await supabase.functions.invoke("polar-checkout", {
        body: {
          productId: productId || POLAR_PREMIUM_PRODUCT_ID,
          successUrl: `${window.location.origin}/settings?checkout=success`,
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
    }
  }, []);

  return { checkout, isLoading, error };
}
