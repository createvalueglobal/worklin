import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfessionalByUserId } from '@/lib/repositories/professional.repository'
import { ProfessionalSidebar } from '@/components/features/professional/ProfessionalSidebar'

export default async function ProfessionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const professional = await getProfessionalByUserId(user.id)

  if (!professional) redirect('/onboarding/role')

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f' }}>
      {/* Sidebar */}
      <ProfessionalSidebar
        photoUrl={professional.photo_url}
        fullName={`${professional.first_name} ${professional.last_name}`}
        mainProfession={professional.main_profession}
      />

      {/* Main content — offset for sidebar on desktop, top bar on mobile */}
      <main className="lg:pl-64 pt-14 lg:pt-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}