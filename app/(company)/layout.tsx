'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Search,
  Heart,
  Clock,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
  ChevronRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ------------------------------------------------------------
// Nav items
// ------------------------------------------------------------

const NAV_ITEMS = [
  {
    href: '/company/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/company/search',
    label: 'Buscar profesionales',
    icon: Search,
  },
  {
    href: '/company/favorites',
    label: 'Favoritos',
    icon: Heart,
  },
  {
    href: '/company/history',
    label: 'Historial',
    icon: Clock,
  },
  {
    href: '/company/settings',
    label: 'Mi empresa',
    icon: Settings,
  },
]

// ------------------------------------------------------------
// NavLink
// ------------------------------------------------------------

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string
  label: string
  icon: React.ElementType
  active: boolean
  onClick?: () => void
}) {
  return (
    <Link href={href} onClick={onClick}>
      <motion.div
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.97 }}
        className="relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group"
        style={{
          background: active
            ? 'rgba(99, 102, 241, 0.15)'
            : 'transparent',
          border: active
            ? '1px solid rgba(99, 102, 241, 0.3)'
            : '1px solid transparent',
        }}
      >
        {/* Indicador activo */}
        {active && (
          <motion.div
            layoutId="company-nav-indicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
            style={{ background: 'rgba(99, 102, 241, 0.9)' }}
          />
        )}

        <Icon
          size={18}
          style={{
            color: active
              ? 'rgba(165, 180, 252, 1)'
              : 'rgba(148, 163, 184, 0.7)',
          }}
        />
        <span
          className="text-sm font-medium"
          style={{
            color: active
              ? 'rgba(224, 231, 255, 1)'
              : 'rgba(148, 163, 184, 0.8)',
          }}
        >
          {label}
        </span>

        {active && (
          <ChevronRight
            size={14}
            className="ml-auto"
            style={{ color: 'rgba(99, 102, 241, 0.7)' }}
          />
        )}
      </motion.div>
    </Link>
  )
}

// ------------------------------------------------------------
// Sidebar content (reutilizado en desktop y drawer)
// ------------------------------------------------------------

function SidebarContent({
  pathname,
  onLinkClick,
}: {
  pathname: string
  onLinkClick?: () => void
}) {
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 mb-2">
        <Link href="/company/dashboard" onClick={onLinkClick}>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)' }}
            >
              <Building2 size={16} style={{ color: 'rgba(165, 180, 252, 1)' }} />
            </div>
            <span
              className="text-lg font-bold tracking-tight"
              style={{ color: 'rgba(224, 231, 255, 1)' }}
            >
              Work<span style={{ color: 'rgba(99, 102, 241, 1)' }}>Lin</span>
            </span>
          </div>
        </Link>
        <p
          className="text-xs mt-1 ml-10"
          style={{ color: 'rgba(100, 116, 139, 0.8)' }}
        >
          Panel empresa
        </p>
      </div>

      {/* Separador */}
      <div
        className="mx-6 mb-4"
        style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }}
      />

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={pathname === item.href || pathname.startsWith(item.href + '/')}
            onClick={onLinkClick}
          />
        ))}
      </nav>

      {/* Footer sidebar */}
      <div className="px-3 pb-6 mt-4">
        <div
          className="mx-1 mb-4"
          style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }}
        />
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group"
          style={{ border: '1px solid transparent' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'
            e.currentTarget.style.border = '1px solid rgba(239, 68, 68, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.border = '1px solid transparent'
          }}
        >
          <LogOut size={18} style={{ color: 'rgba(148, 163, 184, 0.5)' }} />
          <span
            className="text-sm font-medium"
            style={{ color: 'rgba(148, 163, 184, 0.6)' }}
          >
            Cerrar sesión
          </span>
        </button>
      </div>
    </div>
  )
}

// ------------------------------------------------------------
// Layout principal
// ------------------------------------------------------------

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Cerrar drawer al cambiar ruta
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  // Bloquear scroll del body cuando el drawer está abierto
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  return (
    <div
      className="min-h-screen flex"
      style={{ background: '#0a0a0f' }}
    >
      {/* ── SIDEBAR DESKTOP ── */}
      <aside
        className="hidden lg:flex flex-col w-64 min-h-screen fixed left-0 top-0 z-30"
        style={{
          background: 'rgba(15, 15, 25, 0.95)',
          borderRight: '1px solid rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <SidebarContent pathname={pathname} />
      </aside>

      {/* ── DRAWER MOBILE ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              onClick={() => setDrawerOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed left-0 top-0 h-full w-72 z-50 lg:hidden"
              style={{
                background: 'rgba(12, 12, 20, 0.98)',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(24px)',
              }}
            >
              {/* Botón cerrar */}
              <button
                onClick={() => setDrawerOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg transition-colors"
                style={{ color: 'rgba(148, 163, 184, 0.6)' }}
              >
                <X size={20} />
              </button>

              <SidebarContent
                pathname={pathname}
                onLinkClick={() => setDrawerOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Topbar mobile */}
        <header
          className="lg:hidden flex items-center justify-between px-4 py-4 sticky top-0 z-20"
          style={{
            background: 'rgba(10, 10, 15, 0.95)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-lg"
            style={{ color: 'rgba(148, 163, 184, 0.8)' }}
          >
            <Menu size={22} />
          </button>

          <span
            className="text-base font-bold"
            style={{ color: 'rgba(224, 231, 255, 1)' }}
          >
            Work<span style={{ color: 'rgba(99, 102, 241, 1)' }}>Lin</span>
          </span>

          <div className="w-10" /> {/* Spacer para centrar logo */}
        </header>

        {/* Página */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}