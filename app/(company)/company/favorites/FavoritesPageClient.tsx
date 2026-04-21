'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MapPin, Briefcase, Clock, Sparkles, ArrowRight, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Avatar } from '@/components/common/Avatar'
import type { FavoriteProfessional } from '@/types/company'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

const AVAILABILITY_LABELS: Record<string, { label: string; color: string }> = {
  immediate: { label: 'Disponible', color: 'rgba(16, 185, 129, 0.9)' },
  in_days:   { label: 'En pocos días', color: 'rgba(245, 158, 11, 0.9)' },
  not_available: { label: 'No disponible', color: 'rgba(100, 116, 139, 0.7)' },
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// ------------------------------------------------------------
// Estado vacío
// ------------------------------------------------------------

function EmptyFavorites() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.15)' }}
      >
        <Heart size={24} style={{ color: 'rgba(236, 72, 153, 0.5)' }} />
      </div>
      <p className="text-base font-medium mb-1" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
        Todavía no tienes favoritos
      </p>
      <p className="text-sm mb-6" style={{ color: 'rgba(100, 116, 139, 0.5)' }}>
        Marca el corazón en cualquier perfil del buscador para guardarlo aquí
      </p>
      <Link href="/company/search">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            color: 'rgba(165, 180, 252, 0.9)',
          }}
        >
          Buscar profesionales
          <ArrowRight size={14} />
        </motion.button>
      </Link>
    </motion.div>
  )
}

// ------------------------------------------------------------
// Banner sin acceso
// ------------------------------------------------------------

function UpgradeBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6 flex items-start gap-4"
      style={{
        background: 'rgba(99, 102, 241, 0.06)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.25)' }}
      >
        <Sparkles size={18} style={{ color: 'rgba(165, 180, 252, 0.9)' }} />
      </div>
      <div>
        <h3 className="text-base font-semibold mb-1" style={{ color: 'rgba(224, 231, 255, 0.95)' }}>
          Los favoritos requieren plan Básico o superior
        </h3>
        <p className="text-sm mb-4" style={{ color: 'rgba(148, 163, 184, 0.7)' }}>
          Guarda los perfiles que más te interesan y accede a ellos rápidamente. Disponible desde 19€/mes.
        </p>
        <Link href="/pricing">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{
              background: 'rgba(99, 102, 241, 0.85)',
              border: '1px solid rgba(99, 102, 241, 0.5)',
              color: 'rgba(255,255,255,0.95)',
            }}
          >
            <Sparkles size={14} />
            Ver planes
            <ArrowRight size={14} />
          </motion.button>
        </Link>
      </div>
    </motion.div>
  )
}

// ------------------------------------------------------------
// Tarjeta de favorito
// ------------------------------------------------------------

function FavoriteCard({
  professional,
  onRemove,
}: {
  professional: FavoriteProfessional
  onRemove: (id: string) => void
}) {
  const [removing, setRemoving] = useState(false)
  const fullName = `${professional.first_name} ${professional.last_name}`
  const availMeta = AVAILABILITY_LABELS[professional.availability ?? ''] ?? null

  const handleRemove = async () => {
    setRemoving(true)
    try {
      const res = await fetch('/api/company/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professional_id: professional.id }),
      })
      if (res.ok) onRemove(professional.id)
    } finally {
      setRemoving(false)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      className="rounded-2xl p-5"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-start gap-3">
        <Avatar src={professional.photo_url} alt={fullName} size="md" />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate" style={{ color: 'rgba(224, 231, 255, 0.95)' }}>
                {fullName}
              </h3>
              {professional.main_profession && (
                <p className="text-xs mt-0.5" style={{ color: 'rgba(99, 102, 241, 0.8)' }}>
                  {professional.main_profession}
                </p>
              )}
            </div>

            {/* Botón quitar */}
            <button
              onClick={handleRemove}
              disabled={removing}
              className="p-1.5 rounded-lg flex-shrink-0 transition-all"
              style={{
                background: 'rgba(239, 68, 68, 0.06)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                color: 'rgba(239, 68, 68, 0.6)',
                opacity: removing ? 0.5 : 1,
                cursor: removing ? 'not-allowed' : 'pointer',
              }}
              title="Quitar de favoritos"
            >
              <Trash2 size={13} />
            </button>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {professional.province_name && (
              <div className="flex items-center gap-1">
                <MapPin size={10} style={{ color: 'rgba(100, 116, 139, 0.6)' }} />
                <span className="text-xs" style={{ color: 'rgba(100, 116, 139, 0.7)' }}>
                  {professional.province_name}
                </span>
              </div>
            )}
            {professional.years_experience != null && (
              <div className="flex items-center gap-1">
                <Briefcase size={10} style={{ color: 'rgba(100, 116, 139, 0.6)' }} />
                <span className="text-xs" style={{ color: 'rgba(100, 116, 139, 0.7)' }}>
                  {professional.years_experience} {professional.years_experience === 1 ? 'año' : 'años'}
                </span>
              </div>
            )}
            {availMeta && (
              <div className="flex items-center gap-1">
                <Clock size={10} style={{ color: availMeta.color }} />
                <span className="text-xs" style={{ color: availMeta.color }}>
                  {availMeta.label}
                </span>
              </div>
            )}
          </div>

          {/* Contacto si desbloqueado */}
          {professional.is_unlocked && professional.contact && (
            <div className="flex flex-wrap gap-2 mt-2">
              {professional.contact.phone && (
                <a
                  href={`tel:${professional.contact.phone}`}
                  className="text-xs px-2 py-0.5 rounded-md"
                  style={{
                    background: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.12)',
                    color: 'rgba(110, 231, 183, 0.8)',
                  }}
                >
                  📞 {professional.contact.phone}
                </a>
              )}
              {professional.contact.contact_email && (
                <a
                  href={`mailto:${professional.contact.contact_email}`}
                  className="text-xs px-2 py-0.5 rounded-md truncate max-w-[180px]"
                  style={{
                    background: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.12)',
                    color: 'rgba(110, 231, 183, 0.8)',
                  }}
                >
                  ✉️ {professional.contact.contact_email}
                </a>
              )}
            </div>
          )}

          {/* Fecha */}
          <p className="text-xs mt-2" style={{ color: 'rgba(100, 116, 139, 0.5)' }}>
            Guardado el {formatDate(professional.favorited_at)}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ------------------------------------------------------------
// Página principal
// ------------------------------------------------------------

interface FavoritesPageClientProps {
  allowed: boolean
  initialFavorites: FavoriteProfessional[]
}

export default function FavoritesPageClient({ allowed, initialFavorites }: FavoritesPageClientProps) {
  const [favorites, setFavorites] = useState(initialFavorites)

  const handleRemove = (professionalId: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== professionalId))
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'rgba(224, 231, 255, 0.97)' }}>
          Favoritos
        </h1>
        {allowed && favorites.length > 0 && (
          <p className="text-sm mt-0.5" style={{ color: 'rgba(100, 116, 139, 0.7)' }}>
            {favorites.length} perfil{favorites.length !== 1 ? 'es' : ''} guardado{favorites.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Contenido */}
      {!allowed ? (
        <UpgradeBanner />
      ) : favorites.length === 0 ? (
        <EmptyFavorites />
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {favorites.map((fav) => (
              <FavoriteCard key={fav.id} professional={fav} onRemove={handleRemove} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}