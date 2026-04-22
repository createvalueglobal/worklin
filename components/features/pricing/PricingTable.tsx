"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PricingCard, PricingTier } from "./PricingCard";

interface PricingTableProps {
  /** Si se pasa, se resalta el tier indicado como "plan actual" */
  currentTierName?: string | null;
  /**
   * false = la empresa tiene suscripción activa con cupo disponible
   * (se ocultan los botones de contratar para todos los tiers)
   */
  canSubscribe?: boolean;
  isAuthenticated?: boolean;
}

const POPULAR_TIER = "Pro";

export function PricingTable({
  currentTierName = null,
  canSubscribe = true,
  isAuthenticated = false,
}: PricingTableProps) {
  const router = useRouter();
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("subscription_tiers")
      .select("*")
      .eq("is_active", true)
      .order("price", { ascending: true })
      .then(({ data, error }) => {
        if (error) setError("No se pudieron cargar los planes.");
        else setTiers(data ?? []);
        setLoading(false);
      });
  }, []);

  const handleCheckout = useCallback(
    async (tierId: string) => {
      setCheckoutLoading(tierId);
      try {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier_id: tierId }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          // Si ya tiene suscripción activa con cupo → redirigir al dashboard
          if (res.status === 409) {
            router.push("/company/dashboard");
            return;
          }
          throw new Error(body.error ?? "Error al iniciar el pago");
        }

        const { url } = await res.json();
        if (url) window.location.href = url;
      } catch (err) {
        console.error(err);
        // Toast de error — usa el sistema que tengas (sonner, react-hot-toast…)
        alert("No se pudo iniciar el proceso de pago. Inténtalo de nuevo.");
      } finally {
        setCheckoutLoading(null);
      }
    },
    [router]
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-96 rounded-2xl animate-pulse"
            style={{ background: "rgba(255,255,255,0.04)" }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="text-center py-12 rounded-2xl"
        style={{ background: "rgba(239,68,68,0.08)" }}
      >
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
      {tiers.map((tier, index) => (
        <PricingCard
          key={tier.id}
          tier={tier}
          index={index}
          isPopular={tier.name === POPULAR_TIER}
          currentTierName={currentTierName}
          canSubscribe={canSubscribe}
          isAuthenticated={isAuthenticated}
          onCheckout={handleCheckout}
          isLoading={checkoutLoading === tier.id}
        />
      ))}
    </div>
  );
}