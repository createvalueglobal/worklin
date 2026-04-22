'use client'

import { motion } from 'framer-motion'
import { MapPin, Briefcase, Clock, Monitor, Heart, LockKeyhole, CheckCircle, Star } from 'lucide-react'
import { Avatar } from '@/components/common/Avatar'
import { useFavorite } from '@/hooks/useFavorite'
import type { ProfessionalCardData } from '@/types/company'

// ------------------------------------------------------------
// Helpers de visualización
// ------------------------------------------------------------

const AVAILABILITY_LABELS: Record<string, { label: string; color: string }> = {
  immediate: { label: 'Disponible', color: 'rgba(16, 185, 129, 0.9)' },
  in_days: { label: 'En pocos días', color: 'rgba(245, 158, 11, 0.9)' },
  not_available: { label: 'No disponible', color: 'rgba(100, 116, 139, 0.7)' },
}

const WORK_MODE_LABELS: Record<string, string> = {
  presential: 'Presencial',
  hybrid: 'Híbrido',
  remote: 'Remoto',
}

function Badge({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: color ?? 'rgba(148, 163, 184, 0.8)',
      }}
    >
      {children}
    </span>
  )
}

function SkillTag({ name, level }: { name: string; level: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs"
      style={{
        background: 'rgba(99, 102, 241, 0.08)',
        border: '1px solid rgba(99, 102, 241, 0.15)',
        color: 'rgba(165, 180, 252, 0.8)',
      }}
    >
      {name}
      <span style={{ color: 'rgba(99, 102, 241, 0.6)' }}>
        {'·'.repeat(Math.min(level, 5))}
      </span>
    </span>
  )
}

// Datos de contacto difuminados
function BlurredContact() {
  return (
    <div className="space-y-1">
      {['+34 6XX XXX XXX', 'nombre@email.com'].map((placeholder, i) => (
        <div
          key={i}
          className="text-xs px-2 py-1 rounded-md select-none"
          style={{
            background: 'rgba(255,255,255,0.03)',
            color: 'rgba(148, 163, 184, 0.3)',
            filter: 'blur(4px)',
            userSelect: 'none',
            fontFamily: 'monospace',
          }}
        >
          {placeholder}
        </div>
      ))}
    </div>
  )
}

// Datos de contacto visibles
function ContactData({ phone, email }: { phone: string | null; email: string | null }) {
  return (
    <div className="space-y-1">
      {phone && (
        <a
          href={`tel:${phone}`}
          className="block text-xs px-2 py-1 rounded-md transition-colors"
          style={{
            background: 'rgba(16, 185, 129, 0.06)',
            color: 'rgba(110, 231, 183, 0.8)',
            border: '1px solid rgba(16, 185, 129, 0.12)',
          }}
        >
          📞 {phone}
        </a>
      )}
      {email && (
        <a
          href={`mailto:${email}`}
          className="block text-xs px-2 py-1 rounded-md transition-colors truncate"
          style={{
            background: 'rgba(16, 185, 129, 0.06)',
            color: 'rgba(110, 231, 183, 0.8)',
            border: '1px solid rgba(16, 185, 129, 0.12)',
          }}
        >
          ✉️ {email}
        </a>
      )}
    </div>
  )
}

// ------------------------------------------------------------
// Componente principal
// ------------------------------------------------------------

interface ProfessionalCardProps {
  professional: ProfessionalCardData
  index?: number
  allowsFavorites: boolean
  onUnlock: (professionalId: string, professionalName: string) => void
  onFavoriteError?: (message: string) => void
}

export default function ProfessionalCard({
  professional: pro,
  index = 0,
  allowsFavorites,
  onUnlock,
  onFavoriteError,
}: ProfessionalCardProps) {
  const fullName = `${pro.first_name} ${pro.last_name}`
  const availabilityMeta = AVAILABILITY_LABELS[pro.availability ?? ''] ?? null
  const workModeLabel = WORK_MODE_LABELS[pro.work_mode ?? ''] ?? null
  const visibleSkills = pro.skills.slice(0, 3)
  const extraSkills = pro.skills.length - 3

  const { isFavorite, isLoading: favLoading, toggle: toggleFavorite } = useFavorite({
    initialIsFavorite: pro.is_favorite,
    professionalId: pro.id,
    onError: onFavoriteError,
  })

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="relative rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
      }}
      whileHover={{
        borderColor: 'rgba(99, 102, 241, 0.2)',
        backgroundColor: 'rgba(99, 102, 241, 0.03)',
      }}
    >
      {/* Botón favorito */}
      {allowsFavorites && (
        <button
          onClick={toggleFavorite}
          disabled={favLoading}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-all"
          style={{
            background: isFavorite ? 'rgba(236, 72, 153, 0.12)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${isFavorite ? 'rgba(236, 72, 153, 0.3)' : 'rgba(255,255,255,0.08)'}`,
          }}
          title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <Heart
            size={14}
            style={{
              color: isFavorite ? 'rgba(236, 72, 153, 0.9)' : 'rgba(100, 116, 139, 0.5)',
              fill: isFavorite ? 'rgba(236, 72, 153, 0.9)' : 'none',
              transition: 'all 0.2s',
            }}
          />
        </button>
      )}

      {/* Header: avatar + nombre + ubicación */}
      <div className="flex items-start gap-3 pr-8">
        <Avatar src={pro.photo_url} alt={fullName} size="md" />
        <div className="min-w-0 flex-1">
          <h3
            className="text-sm font-semibold leading-tight truncate"
            style={{ color: 'rgba(224, 231, 255, 0.95)' }}
          >
            {fullName}
          </h3>
          {pro.main_profession && (
            <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(99, 102, 241, 0.8)' }}>
              {pro.main_profession}
            </p>
          )}
          {pro.province_name && (
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={10} style={{ color: 'rgba(100, 116, 139, 0.6)' }} />
              <span className="text-xs" style={{ color: 'rgba(100, 116, 139, 0.7)' }}>
                {pro.province_name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Badges: experiencia, disponibilidad, modalidad */}
      <div className="flex flex-wrap gap-1.5">
        {pro.years_experience != null && (
          <Badge>
            <Briefcase size={10} />
            {pro.years_experience} {pro.years_experience === 1 ? 'año' : 'años'}
          </Badge>
        )}
        {availabilityMeta && (
          <Badge color={availabilityMeta.color}>
            <Clock size={10} />
            {availabilityMeta.label}
          </Badge>
        )}
        {workModeLabel && (
          <Badge>
            <Monitor size={10} />
            {workModeLabel}
          </Badge>
        )}
      </div>

      {/* Skills */}
      {visibleSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {visibleSkills.map((skill) => (
            <SkillTag key={skill.id} name={skill.skill_name} level={skill.level} />
          ))}
          {extraSkills > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-md"
              style={{ color: 'rgba(100, 116, 139, 0.6)', background: 'rgba(255,255,255,0.03)' }}
            >
              +{extraSkills} más
            </span>
          )}
        </div>
      )}

      {/* Separador */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

      {/* Contacto: desbloqueado o difuminado */}
      {pro.is_unlocked ? (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle size={12} style={{ color: 'rgba(16, 185, 129, 0.8)' }} />
            <span className="text-xs font-medium" style={{ color: 'rgba(110, 231, 183, 0.7)' }}>
              Perfil desbloqueado
            </span>
          </div>
          <ContactData
            phone={pro.contact?.phone ?? null}
            email={pro.contact?.contact_email ?? null}
          />
        </div>
      ) : (
        <div>
          <BlurredContact />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onUnlock(pro.id, fullName)}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: 'rgba(165, 180, 252, 0.9)',
            }}
          >
            <LockKeyhole size={13} />
            Desbloquear perfil
          </motion.button>
        </div>
      )}
    </motion.article>
  )
}