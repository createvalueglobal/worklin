"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Zap,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ActiveSubscription {
  snapshot_tier_name: string;
  snapshot_price: number;
  snapshot_currency: string;
  profiles_used: number;
  snapshot_profile_limit: number;
  started_at: string;
  expires_at: string;
  status: string;
  stripe_customer_id?: string | null; // ← puede ser null en test/desarrollo
}

interface SubscriptionSectionProps {
  subscription: ActiveSubscription | null;
  canSubscribe: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ProgressBar({ used, total }: { used: number; total: number }) {
  const pct = total === 0 ? 100 : Math.min((used / total) * 100, 100);
  const isWarning = pct >= 80;
  const isFull = pct >= 100;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-white/50">
        <span>Perfiles desbloqueados</span>
        <span
          className={
            isFull
              ? "text-red-400"
              : isWarning
              ? "text-amber-400"
              : "text-white/70"
          }
        >
          {used} / {total}
        </span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{
            background: isFull
              ? "rgba(239,68,68,0.8)"
              : isWarning
              ? "rgba(245,158,11,0.8)"
              : "linear-gradient(90deg, rgba(139,92,246,0.8), rgba(99,102,241,0.8))",
          }}
        />
      </div>
    </div>
  );
}

export function SubscriptionSection({
  subscription,
  canSubscribe,
}: SubscriptionSectionProps) {
  const router = useRouter();
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  const handlePortal = async () => {
    setPortalLoading(true);
    setPortalError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Error desconocido");
      window.location.href = body.url;
    } catch (err: unknown) {
      setPortalError(
        err instanceof Error ? err.message : "No se pudo acceder al portal"
      );
    } finally {
      setPortalLoading(false);
    }
  };

  // Sin suscripción activa
  if (!subscription) {
    return (
      <div className="space-y-4">
        <div
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <AlertCircle
            size={18}
            className="text-white/40 mt-0.5 flex-shrink-0"
          />
          <div>
            <p className="text-white/70 text-sm font-medium">Sin plan activo</p>
            <p className="text-white/40 text-xs mt-0.5">
              Actualmente estás en el plan gratuito. Contrata un plan para
              desbloquear perfiles de profesionales.
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push("/pricing")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background:
              "linear-gradient(135deg, rgba(139,92,246,0.9), rgba(109,40,217,0.9))",
          }}
        >
          <Zap size={15} />
          Ver planes disponibles
          <ChevronRight size={14} />
        </button>
      </div>
    );
  }

  const cupoAgotado =
    subscription.profiles_used >= subscription.snapshot_profile_limit;

  // Solo mostramos el botón del portal si existe stripe_customer_id
  // (se rellena tras el primer pago real — no disponible en desarrollo sin pago)
  const hasStripeCustomer = Boolean(subscription.stripe_customer_id);

  return (
    <div className="space-y-5">
      {/* Card info suscripción */}
      <div
        className="rounded-xl p-5 space-y-4"
        style={{
          background: "rgba(139,92,246,0.06)",
          border: "1px solid rgba(139,92,246,0.2)",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span className="text-white font-semibold text-sm">
                Plan {subscription.snapshot_tier_name}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: "rgba(16,185,129,0.15)",
                  color: "rgb(52,211,153)",
                }}
              >
                Activo
              </span>
            </div>
            <p className="text-white/40 text-xs mt-1">
              Válido hasta {formatDate(subscription.expires_at)}
            </p>
          </div>
          <span className="text-white font-bold text-lg">
            {subscription.snapshot_price}€
            <span className="text-white/40 text-xs font-normal">/mes</span>
          </span>
        </div>

        <ProgressBar
          used={subscription.profiles_used}
          total={subscription.snapshot_profile_limit}
        />

        {cupoAgotado && (
          <div
            className="flex items-center gap-2 p-3 rounded-lg text-xs text-amber-300"
            style={{ background: "rgba(245,158,11,0.1)" }}
          >
            <AlertCircle size={13} className="flex-shrink-0" />
            Has agotado el cupo de perfiles de este plan. Puedes contratar uno
            nuevo.
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex flex-wrap gap-3">
        {/* Portal Stripe — solo si hay stripe_customer_id */}
        {hasStripeCustomer && (
          <div className="flex flex-col gap-1">
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <CreditCard size={15} />
              {portalLoading ? "Cargando…" : "Gestionar pagos"}
              <ExternalLink size={12} className="text-white/40" />
            </button>
            {portalError && (
              <p className="text-red-400 text-xs px-1">{portalError}</p>
            )}
          </div>
        )}

        {/* Contratar nuevo plan — solo si puede */}
        {canSubscribe && (
          <button
            onClick={() => router.push("/pricing")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background:
                "linear-gradient(135deg, rgba(139,92,246,0.9), rgba(109,40,217,0.9))",
            }}
          >
            <Zap size={15} />
            Contratar nuevo plan
          </button>
        )}
      </div>
    </div>
  );
}