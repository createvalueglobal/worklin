"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Save, Building2 } from "lucide-react";
import {
  CompanyInfoSchema,
  CompanyInfoValues,
} from "@/lib/validators/company-settings.validator";
import { createClient } from "@/lib/supabase/client";

interface Province {
  id: string;
  name: string;
}

interface CompanyInfoFormProps {
  initialData: Partial<CompanyInfoValues> & { province_id?: string };
  onSuccess?: () => void;
}

export function CompanyInfoForm({ initialData, onSuccess }: CompanyInfoFormProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<CompanyInfoValues>({
    resolver: zodResolver(CompanyInfoSchema),
    defaultValues: {
      company_name: initialData.company_name ?? "",
      sector: initialData.sector ?? "",
      province_id: initialData.province_id ?? "",
      address: initialData.address ?? "",
      website: initialData.website ?? "",
    },
  });

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("provinces")
      .select("id, name")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => setProvinces(data ?? []));
  }, []);

  const onSubmit = async (values: CompanyInfoValues) => {
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/company/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_info: values }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Error al guardar");
      }

      setSuccessMsg("Datos guardados correctamente");
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
      {/* Nombre empresa */}
      <div>
        <label className="block text-xs text-white/50 mb-1.5 font-medium uppercase tracking-wide">
          Nombre comercial *
        </label>
        <input
          {...register("company_name")}
          className={inputClass}
          style={inputStyle}
          placeholder="Mi Empresa S.L."
        />
        {errors.company_name && (
          <p className="text-red-400 text-xs mt-1">{errors.company_name.message}</p>
        )}
      </div>

      {/* Sector */}
      <div>
        <label className="block text-xs text-white/50 mb-1.5 font-medium uppercase tracking-wide">
          Sector *
        </label>
        <input
          {...register("sector")}
          className={inputClass}
          style={inputStyle}
          placeholder="Hostelería, Construcción, Salud…"
        />
        {errors.sector && (
          <p className="text-red-400 text-xs mt-1">{errors.sector.message}</p>
        )}
      </div>

      {/* Provincia */}
      <div>
        <label className="block text-xs text-white/50 mb-1.5 font-medium uppercase tracking-wide">
          Provincia *
        </label>
        <select
          {...register("province_id")}
          className={inputClass}
          style={inputStyle}
        >
          <option value="" style={{ background: "#1a1a2e" }}>
            Selecciona provincia
          </option>
          {provinces.map((p) => (
            <option key={p.id} value={p.id} style={{ background: "#1a1a2e" }}>
              {p.name}
            </option>
          ))}
        </select>
        {errors.province_id && (
          <p className="text-red-400 text-xs mt-1">{errors.province_id.message}</p>
        )}
      </div>

      {/* Dirección */}
      <div>
        <label className="block text-xs text-white/50 mb-1.5 font-medium uppercase tracking-wide">
          Dirección
        </label>
        <input
          {...register("address")}
          className={inputClass}
          style={inputStyle}
          placeholder="Calle Mayor 1, 28001 Madrid"
        />
      </div>

      {/* Web */}
      <div>
        <label className="block text-xs text-white/50 mb-1.5 font-medium uppercase tracking-wide">
          Sitio web
        </label>
        <input
          {...register("website")}
          className={inputClass}
          style={inputStyle}
          placeholder="https://miempresa.com"
          type="url"
        />
        {errors.website && (
          <p className="text-red-400 text-xs mt-1">{errors.website.message}</p>
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
          background: "linear-gradient(135deg, rgba(139,92,246,0.9), rgba(109,40,217,0.9))",
        }}
      >
        <Save size={15} />
        {saving ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}