'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  UserCircle,
  Heart,
  LogOut,
  Menu,
  X,
  Eye,
  ChevronRight,
} from 'lucide-react'
import { Avatar } from '@/components/common/Avatar'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface NavItem {
  href: string
  icon: typeof LayoutDashboard
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/professional/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/professional/profile/edit', icon: UserCircle, label: 'Mi Perfil' },
  { href: '/professional/favorites', icon: Heart, label: 'Favoritos' },
]

interface ProfessionalSidebarProps {
  photoUrl?: string | null
  fullName: string
  mainProfession: string
}

export function ProfessionalSidebar({
  photoUrl,
  fullName,
  mainProfession,
}: ProfessionalSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const NavLinks = () => (
    <nav className="flex-1 flex flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group"
            style={{
              background: isActive ? 'rgba(99,102,241,0.18)' : 'transparent',
              color: isActive ? '#818cf8' : 'rgba(255,255,255,0.55)',
              border: isActive ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
            }}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{item.label}</span>
            {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
          </Link>
        )
      })}
    </nav>
  )

  const UserInfo = () => (
    <div
      className="flex items-center gap-3 px-4 py-4 mx-3 rounded-xl"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <Avatar src={photoUrl} alt={fullName} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{fullName}</p>
        <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {mainProfession}
        </p>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden lg:flex flex-col w-64 min-h-screen py-6 gap-6 fixed top-0 left-0 z-20"
        style={{
          background: 'rgba(10,10,15,0.95)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Logo */}
        <div className="px-6">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' }}
            >
              <Eye className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-base font-bold text-white">WorkLin</span>
          </Link>
        </div>

        {/* User info */}
        <UserInfo />

        {/* Nav */}
        <NavLinks />

        {/* Sign out */}
        <div className="px-3 mt-auto">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-red-500/10"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-14"
        style={{
          background: 'rgba(10,10,15,0.95)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.2)' }}
          >
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <span className="text-sm font-bold text-white">WorkLin</span>
        </Link>

        <button
          onClick={() => setMobileOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <Menu className="w-4.5 h-4.5 text-white" />
        </button>
      </header>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col py-6 gap-6"
              style={{
                background: 'rgba(10,10,15,0.98)',
                borderRight: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {/* Close */}
              <div className="px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(99,102,241,0.2)' }}
                  >
                    <Eye className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="text-base font-bold text-white">WorkLin</span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              <UserInfo />
              <NavLinks />

              <div className="px-3 mt-auto">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}