'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import {
  LayoutDashboard,
  Users,
  MapPin,
  CreditCard,
  ScrollText,
  Menu,
  X,
  LogOut,
  Shield,
} from 'lucide-react'

// ============================================================
// TYPES
// ============================================================

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

interface AdminSidebarProps {
  adminEmail: string
}

// ============================================================
// CONSTANTS
// ============================================================

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: 'Usuarios',
    href: '/admin/users',
    icon: <Users size={18} />,
  },
  {
    label: 'Ubicaciones',
    href: '/admin/locations',
    icon: <MapPin size={18} />,
  },
  {
    label: 'Tiers',
    href: '/admin/tiers',
    icon: <CreditCard size={18} />,
  },
  {
    label: 'Logs',
    href: '/admin/logs',
    icon: <ScrollText size={18} />,
  },
]

// ============================================================
// NAV LINK
// ============================================================

function NavLink({
  item,
  isActive,
  onClick,
}: {
  item: NavItem
  isActive: boolean
  onClick?: () => void
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group"
      style={{
        background: isActive ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
        color: isActive ? '#a78bfa' : 'rgba(255,255,255,0.6)',
      }}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="admin-nav-active"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full"
          style={{ background: '#8b5cf6' }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}

      <span
        className="transition-colors duration-200"
        style={{ color: isActive ? '#a78bfa' : 'rgba(255,255,255,0.5)' }}
      >
        {item.icon}
      </span>
      <span className="text-sm font-medium">{item.label}</span>

      {/* Hover glow */}
      {!isActive && (
        <span
          className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        />
      )}
    </Link>
  )
}

// ============================================================
// SIDEBAR CONTENT (shared between desktop + drawer)
// ============================================================

function SidebarContent({
  pathname,
  adminEmail,
  onNavClick,
  onSignOut,
}: {
  pathname: string
  adminEmail: string
  onNavClick?: () => void
  onSignOut: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo / Brand */}
      <div className="px-4 py-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(139, 92, 246, 0.2)', border: '1px solid rgba(139,92,246,0.3)' }}
          >
            <Shield size={16} style={{ color: '#a78bfa' }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-none">Admin Panel</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>WorkLin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={pathname.startsWith(item.href)}
            onClick={onNavClick}
          />
        ))}
      </nav>

      {/* Admin profile + sign out */}
      <div
        className="px-3 py-4 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
            style={{
              background: 'rgba(139,92,246,0.25)',
              color: '#c4b5fd',
              border: '1px solid rgba(139,92,246,0.3)',
            }}
          >
            {adminEmail.charAt(0).toUpperCase()}
          </div>
          <span
            className="text-xs truncate flex-1"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            {adminEmail}
          </span>
        </div>

        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-200 group"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          <LogOut size={16} className="group-hover:text-red-400 transition-colors duration-200" />
          <span className="group-hover:text-red-400 transition-colors duration-200">
            Cerrar sesión
          </span>
        </button>
      </div>
    </div>
  )
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function AdminSidebar({ adminEmail }: AdminSidebarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className="hidden lg:flex flex-col w-56 h-screen sticky top-0 flex-shrink-0"
        style={{
          background: 'rgba(10, 8, 20, 0.95)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <SidebarContent
          pathname={pathname}
          adminEmail={adminEmail}
          onSignOut={handleSignOut}
        />
      </aside>

      {/* ── MOBILE: Top bar with hamburger ── */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14"
        style={{
          background: 'rgba(10, 8, 20, 0.95)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}
          >
            <Shield size={14} style={{ color: '#a78bfa' }} />
          </div>
          <span className="text-sm font-semibold text-white">Admin Panel</span>
        </div>

        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 rounded-lg transition-colors duration-200"
          style={{ color: 'rgba(255,255,255,0.6)' }}
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* ── MOBILE: Drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              onClick={() => setDrawerOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64"
              style={{
                background: 'rgba(10, 8, 20, 0.98)',
                borderRight: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setDrawerOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors duration-200"
                style={{ color: 'rgba(255,255,255,0.4)' }}
                aria-label="Cerrar menú"
              >
                <X size={18} />
              </button>

              <SidebarContent
                pathname={pathname}
                adminEmail={adminEmail}
                onNavClick={() => setDrawerOpen(false)}
                onSignOut={handleSignOut}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}