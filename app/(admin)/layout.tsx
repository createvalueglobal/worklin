import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { AdminSidebar } from '@/components/features/admin/layout/AdminSidebar'

// ============================================================
// ADMIN LAYOUT
// Server component — verifies admin role and passes email
// to the client sidebar.
// ============================================================

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component context — safe to ignore
          }
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('role, is_active')
    .eq('id', user.id)
    .single()

  if (!userData || userData.role !== 'admin' || !userData.is_active) {
    redirect('/login')
  }

  return (
    <div
      className="flex min-h-screen"
      style={{ background: '#07070d' }}
    >
      {/* Sidebar — handles both desktop sticky + mobile drawer */}
      <AdminSidebar adminEmail={user.email ?? ''} />

      {/* Main content area */}
      <main className="flex-1 min-w-0">
        {/* Mobile top-bar spacer */}
        <div className="lg:hidden h-14" />

        <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}