"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, X, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

interface LogoUploaderProps {
  currentLogoUrl?: string | null;
  companyId: string;
  onSuccess?: (newUrl: string) => void;
}

const MAX_SIZE_MB = 2;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const BUCKET = "company-logos";

export function LogoUploader({
  currentLogoUrl,
  companyId,
  onSuccess,
}: LogoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentLogoUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(false);

    // Validaciones
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Formato no admitido. Usa JPG, PNG o WebP.");
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`El archivo no puede superar ${MAX_SIZE_MB}MB.`);
      return;
    }

    // Preview local inmediato
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    setUploading(true);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `${companyId}/logo.${ext}`;

      // Upload a Supabase Storage (upsert para reemplazar logo anterior)
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(path);

      // Actualizar logo_url en la empresa via API
      const res = await fetch("/api/company/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logo_url: publicUrl }),
      });

      if (!res.ok) throw new Error("Error al guardar el logo");

      setSuccess(true);
      onSuccess?.(publicUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al subir el logo");
      setPreview(currentLogoUrl ?? null);
    } finally {
      setUploading(false);
      // Reset input para permitir subir el mismo archivo de nuevo
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setSuccess(false);
    setError(null);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
      {/* Preview */}
      <div
        className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "2px dashed rgba(255,255,255,0.15)",
        }}
      >
        {preview ? (
          <>
            <Image
              src={preview}
              alt="Logo empresa"
              fill
              className="object-cover"
            />
            {/* Botón eliminar preview */}
            <button
              onClick={handleRemove}
              className="absolute top-1 right-1 p-0.5 rounded-full text-white/70 hover:text-white transition-colors"
              style={{ background: "rgba(0,0,0,0.6)" }}
              title="Quitar logo"
            >
              <X size={12} />
            </button>
          </>
        ) : (
          <Building2 size={28} className="text-white/20" />
        )}

        {uploading && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.6)" }}
          >
            <svg
              className="animate-spin h-6 w-6 text-violet-400"
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
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="flex-1">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={handleFileChange}
          id="logo-upload"
        />
        <label
          htmlFor="logo-upload"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <Upload size={15} />
          {preview ? "Cambiar logo" : "Subir logo"}
        </label>

        <p className="text-white/35 text-xs mt-2">
          JPG, PNG o WebP · Máximo {MAX_SIZE_MB}MB · Recomendado 200×200px
        </p>

        {success && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-emerald-400 text-xs mt-1.5"
          >
            ✓ Logo actualizado correctamente
          </motion.p>
        )}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-xs mt-1.5"
          >
            {error}
          </motion.p>
        )}
      </div>
    </div>
  );
}