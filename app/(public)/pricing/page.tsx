import { createClient } from "@/lib/supabase/server";
import { PricingTable } from "@/components/features/pricing/PricingTable";
import { Sparkles } from "lucide-react";

/**
 * /pricing — página pública
 * Server Component: detecta si el usuario está autenticado y si es empresa
 * con suscripción activa para pasarle los props correctos a PricingTable.
 */
export const metadata = {
  title: "Planes y precios | WorkLin",
  description:
    "Elige el plan que mejor se adapta a tus necesidades de contratación.",
};

async function getSubscriptionContext() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { isAuthenticated: false, currentTierName: null, canSubscribe: true };

  // Obtener rol del usuario
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "company") {
    return { isAuthenticated: true, currentTierName: null, canSubscribe: true };
  }

  // Obtener empresa + suscripción activa
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!company) {
    return { isAuthenticated: true, currentTierName: null, canSubscribe: true };
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("snapshot_tier_name, profiles_used, snapshot_profile_limit")
    .eq("company_id", company.id)
    .eq("status", "active")
    .single();

  if (!subscription) {
    return { isAuthenticated: true, currentTierName: "Free", canSubscribe: true };
  }

  const cupoAgotado =
    subscription.profiles_used >= subscription.snapshot_profile_limit;

  return {
    isAuthenticated: true,
    currentTierName: subscription.snapshot_tier_name,
    // Solo puede contratar si el cupo está agotado o no tiene suscripción activa
    canSubscribe: cupoAgotado,
  };
}

export default async function PricingPage() {
  const { isAuthenticated, currentTierName, canSubscribe } =
    await getSubscriptionContext();

  return (
    <main className="min-h-screen" style={{ background: "#0a0a0f" }}>
      {/* Fondo decorativo */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139,92,246,0.12) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 sm:py-28">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium text-violet-300 mb-6"
            style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <Sparkles size={12} />
            Sin permanencia. Cancela cuando quieras.
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            Planes para cada{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #a78bfa, #818cf8)",
              }}
            >
              necesidad
            </span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Accede a perfiles verificados del sector servicios. Paga solo
            cuando necesites contratar.
          </p>
        </div>

        {/* Tabla de precios */}
        <PricingTable
          currentTierName={currentTierName}
          canSubscribe={canSubscribe}
          isAuthenticated={isAuthenticated}
        />

        {/* Nota legal */}
        <p className="text-center text-white/25 text-xs mt-10">
          Precios en euros, IVA no incluido. Suscripciones mensuales sin
          renovación automática.
        </p>
      </div>
    </main>
  );
}