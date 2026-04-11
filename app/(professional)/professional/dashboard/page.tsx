import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const metadata: Metadata = {
  title: 'Mi panel — WorkLin',
}

export default async function ProfessionalDashboardPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          ),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: professional } = await supabase
    .from('professionals')
    .select('first_name, is_visible')
    .eq('user_id', user.id)
    .single()

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0f',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        gap: '24px',
      }}
    >
      {/* Logo */}
      <span style={{ fontSize: '22px', fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>
        Work<span style={{ color: '#818cf8' }}>Lin</span>
      </span>

      {/* Mensaje de bienvenida */}
      <div
        style={{
          backgroundColor: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '40px 48px',
          textAlign: 'center',
          maxWidth: '480px',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
          ¡Bienvenido{professional?.first_name ? `, ${professional.first_name}` : ''}!
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: '24px' }}>
          Tu perfil profesional ha sido creado correctamente.
          {!professional?.is_visible && (
            <> Actualmente está <strong style={{ color: '#fbbf24' }}>oculto</strong> — las empresas no pueden encontrarte hasta que lo actives.</>
          )}
        </p>

        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '10px',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          🚧 El dashboard completo está en construcción. ¡Vuelve pronto!
        </div>
      </div>
    </div>
  )
}