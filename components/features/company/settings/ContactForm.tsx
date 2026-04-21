"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import {
  ContactSchema,
  ContactValues,
} from "@/lib/validators/company-settings.validator";

interface ContactFormProps {
  initialData: Partial<ContactValues>;
  onSuccess?: () => void;
}

export function ContactForm({ initialData, onSuccess }: ContactFormProps) {
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ContactValues>({
    resolver: zodResolver(ContactSchema),
    defaultValues: {
      contact_name: initialData.contact_name ?? "",
      contact_phone: initialData.contact_phone ?? "",
      contact_email: initialData.contact_email ?? "",
    },
  });

  const onSubmit = async (values: ContactValues) => {
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/company/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: values }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Error al guardar");
      }

      setSuccessMsg("Datos de contacto actualizados");
      onSuccess?.();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-violet-500/50 transition-all";
  const inputStyle = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Nombre responsable */}
      <div>
        <label className="block text-xs text-white/50 mb-1.5 font-medium uppercase tracking-wide">
          Nombre del responsable *
        </label>
        <input
          {...register("contact_name")}
          className={inputClass}
          style={inputStyle}
          placeholder="Ana García"
        />
        {errors.contact_name && (
          <p className="text-red-400 text-xs mt-1">
            {errors.contact_name.message}
          </p>
        )}
      </div>

      {/* Teléfono */}
      <div>
        <label className="block text-xs text-white/50 mb-1.5 font-medium uppercase tracking-wide">
          Teléfono de contacto
        </label>
        <input
          {...register("contact_phone")}
          className={inputClass}
          style={inputStyle}
          placeholder="+34 600 000 000"
          type="tel"
        />
        {errors.contact_phone && (
          <p className="text-red-400 text-xs mt-1">
            {errors.contact_phone.message}
          </p>
        )}
      </div>

      {/* Email de contacto */}
      <div>
        <label className="block text-xs text-white/50 mb-1.5 font-medium uppercase tracking-wide">
          Email de contacto
        </label>
        <input
          {...register("contact_email")}
          className={inputClass}
          style={inputStyle}
          placeholder="rrhh@miempresa.com"
          type="email"
        />
        {errors.contact_email && (
          <p className="text-red-400 text-xs mt-1">
            {errors.contact_email.message}
          </p>
        )}
      </div>

      {/* Feedback */}
      {successMsg && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-emerald-400 text-sm"
        >
          ✓ {successMsg}
        </motion.p>
      )}
      {errorMsg && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm"
        >
          {errorMsg}
        </motion.p>
      )}

      <button
        type="submit"
        disabled={saving || !isDirty}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background:
            "linear-gradient(135deg, rgba(139,92,246,0.9), rgba(109,40,217,0.9))",
        }}
      >
        <Save size={15} />
        {saving ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}