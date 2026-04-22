"use client";

import { motion } from "framer-motion";
import { Check, Minus, Zap } from "lucide-react";

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  profile_limit: number;
  allows_advanced_filters: boolean;
  allows_favorites: boolean;
  allows_history: boolean;
  is_active: boolean;
}

interface PricingCardProps {
  tier: PricingTier;
  index: number;
  isPopular?: boolean;
  currentTierName?: string | null; // nombre del tier activo de la empresa
  canSubscribe?: boolean; // false si tiene suscripción activa con cupo disponible
  isAuthenticated?: boolean;
  onCheckout?: (tierId: string) => void;
  isLoading?: boolean;
}

const TIER_DESCRIPTIONS: Record<string, string> = {
  Free: "Explora la plataforma sin compromiso",
  Básico: "Perfecto para empezar a contratar",
  Pro: "Para equipos con necesidades continuas",
  Business: "Máxima capacidad para grandes empresas",
};

const FEATURE_LABELS = [
  { key: "profile_limit", label: "Perfiles desbloqueables" },
  { key: "allows_advanced_filters", label: "Filtros avanzados" },
  { key: "allows_favorites", label: "Lista de favoritos" },
  { key: "allows_history", label: "Historial de consultas" },
];

function FeatureValue({
  tierKey,
  tier,
}: {
  tierKey: string;
  tier: PricingTier;
}) {
  if (tierKey === "profile_limit") {
    const val = tier.profile_limit;
    if (val === 0) return <span className="text-white/30 text-sm">—</span>;
    return (
      <span className="text-white font-semibold text-sm">
        {val} {val === 1 ? "perfil" : "perfiles"}
      </span>
    );
  }

  const val = tier[tierKey as keyof PricingTier] as boolean;
  return val ? (
    <Check size={16} className="text-emerald-400 mx-auto" />
  ) : (
    <Minus size={16} className="text-white/20 mx-auto" />
  );
}

export function PricingCard({
  tier,
  index,
  isPopular = false,
  currentTierName,
  canSubscribe = true,
  isAuthenticated = false,
  onCheckout,
  isLoading = false,
}: PricingCardProps) {
  const isCurrent = currentTierName === tier.name;
  const isFree = tier.price === 0;

  const getButtonState = () => {
    if (isFree) return { label: "Plan actual", disabled: true };
    if (isCurrent && canSubscribe === false)
      return { label: "Plan activo", disabled: true };
    if (isCurrent) return { label: "Plan activo", disabled: true };
    if (!isAuthenticated)
      return { label: "Empezar ahora", disabled: false, isLogin: true };
    if (!canSubscribe && !isCurrent)
      return { label: "Contratar", disabled: false };
    return { label: "Contratar", disabled: false };
  };

  const btnState = getButtonState();

  const handleClick = () => {
    if (btnState.disabled || isLoading) return;
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    onCheckout?.(tier.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: "easeOut" }}
      className={`relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 ${
        isPopular
          ? "ring-2 ring-violet-500/70 shadow-[0_0_40px_rgba(139,92,246,0.2)]"
          : "ring-1 ring-white/8"
      } ${isCurrent ? "ring-2 ring-emerald-500/60" : ""}`}
      style={{
        background: isPopular
          ? "rgba(139,92,246,0.08)"
          : "rgba(255,255,255,0.04)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Badge popular */}
      {isPopular && (
        <div className="absolute top-0 inset-x-0 flex justify-center">
          <div
            className="flex items-center gap-1.5 px-4 py-1 text-xs font-semibold text-white rounded-b-xl"
            style={{ background: "rgba(139,92,246,0.9)" }}
          >
            <Zap size={11} />
            Más popular
          </div>
        </div>
      )}

      {/* Badge plan actual */}
      {isCurrent && !isPopular && (
        <div className="absolute top-0 inset-x-0 flex justify-center">
          <div
            className="flex items-center gap-1.5 px-4 py-1 text-xs font-semibold text-emerald-300 rounded-b-xl"
            style={{ background: "rgba(16,185,129,0.15)" }}
          >
            Plan actual
          </div>
        </div>
      )}

      <div className={`flex flex-col flex-1 p-6 ${isPopular || isCurrent ? "pt-9" : "pt-6"}`}>
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-1">
            {tier.name}
          </p>
          <div className="flex items-end gap-1 mb-2">
            {isFree ? (
              <span className="text-4xl font-bold text-white">Gratis</span>
            ) : (
              <>
                <span className="text-4xl font-bold text-white">
                  {tier.price}€
                </span>
                <span className="text-white/40 text-sm mb-1">/mes</span>
              </>
            )}
          </div>
          <p className="text-white/50 text-sm leading-relaxed">
            {TIER_DESCRIPTIONS[tier.name] ?? ""}
          </p>
        </div>

        {/* Features */}
        <div className="flex-1 space-y-3 mb-6">
          {FEATURE_LABELS.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <span className="text-white/60 text-sm">{label}</span>
              <FeatureValue tierKey={key} tier={tier} />
            </div>
          ))}
          {/* Filtros básicos siempre incluidos */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-white/60 text-sm">Filtros básicos</span>
            <Check size={16} className="text-emerald-400" />
          </div>
        </div>

        {/* Divider */}
        <div
          className="h-px w-full mb-5"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />

        {/* CTA */}
        <button
          onClick={handleClick}
          disabled={btnState.disabled || isLoading}
          className={`w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
            btnState.disabled
              ? "cursor-not-allowed opacity-40 text-white/60"
              : isPopular
              ? "text-white shadow-lg hover:shadow-violet-500/25 hover:scale-[1.02] active:scale-[0.98]"
              : "text-white hover:scale-[1.02] active:scale-[0.98]"
          }`}
          style={
            btnState.disabled
              ? { background: "rgba(255,255,255,0.06)" }
              : isPopular
              ? {
                  background:
                    "linear-gradient(135deg, rgba(139,92,246,0.9), rgba(109,40,217,0.9))",
                }
              : {
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }
          }
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Procesando…
            </span>
          ) : (
            btnState.label
          )}
        </button>
      </div>
    </motion.div>
  );
}