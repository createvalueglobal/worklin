'use client'

import Image from 'next/image'
import { User } from 'lucide-react'

interface AvatarProps {
  src?: string | null
  alt?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZE_MAP = {
  sm: { px: 32, className: 'w-8 h-8', iconSize: 14 },
  md: { px: 48, className: 'w-12 h-12', iconSize: 20 },
  lg: { px: 64, className: 'w-16 h-16', iconSize: 26 },
  xl: { px: 96, className: 'w-24 h-24', iconSize: 36 },
}

export function Avatar({ src, alt = 'Avatar', size = 'md', className = '' }: AvatarProps) {
  const config = SIZE_MAP[size]

  return (
    <div
      className={`${config.className} rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center ${className}`}
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '2px solid rgba(255,255,255,0.1)',
      }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={config.px}
          height={config.px}
          className="w-full h-full object-cover"
        />
      ) : (
        <User
          style={{ width: config.iconSize, height: config.iconSize, color: 'rgba(255,255,255,0.3)' }}
        />
      )}
    </div>
  )
}