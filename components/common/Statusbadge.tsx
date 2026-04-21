'use client'

interface StatusBadgeProps {
  active: boolean
  labelActive?: string
  labelInactive?: string
  size?: 'sm' | 'md'
}

export function StatusBadge({
  active,
  labelActive = 'Activo',
  labelInactive = 'Inactivo',
  size = 'md',
}: StatusBadgeProps) {
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${padding}`}
      style={{
        background: active ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
        color: active ? '#4ade80' : '#f87171',
        border: `1px solid ${active ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: active ? '#4ade80' : '#f87171' }}
      />
      {active ? labelActive : labelInactive}
    </span>
  )
}