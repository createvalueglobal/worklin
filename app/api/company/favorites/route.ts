import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getCompanyProfile,
  getFavorites,
  addFavorite,
  removeFavorite,
} from '@/lib/services/company.service'
import { getActiveSubscription } from '@/lib/repositories/company.repository'
import {
  addFavoriteSchema,
  removeFavoriteSchema,
} from '@/lib/validators/company.validator'

// GET — listar favoritos
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const company = await getCompanyProfile(supabase, user.id)
    if (!company) {
      return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 })
    }

    const subscription = await getActiveSubscription(supabase, company.id)
    const result = await getFavorites(supabase, company.id, subscription)

    if (!result.allowed) {
      return NextResponse.json(
        {
          error: 'FAVORITES_NOT_ALLOWED',
          message: 'Los favoritos requieren un plan Básico o superior.',
          favorites: [],
          allowed: false,
        },
        { status: 403 }
      )
    }

    return NextResponse.json({ favorites: result.favorites, allowed: true })
  } catch (err) {
    console.error('[GET /api/company/favorites]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST — añadir favorito
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const company = await getCompanyProfile(supabase, user.id)
    if (!company) {
      return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = addFavoriteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const subscription = await getActiveSubscription(supabase, company.id)
    const result = await addFavorite(
      supabase,
      company.id,
      parsed.data.professional_id,
      subscription
    )

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          message: 'Los favoritos requieren un plan Básico o superior.',
        },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[POST /api/company/favorites]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE — quitar favorito
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const company = await getCompanyProfile(supabase, user.id)
    if (!company) {
      return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = removeFavoriteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const result = await removeFavorite(supabase, company.id, parsed.data.professional_id)

    if (!result.success) {
      return NextResponse.json(
        { error: 'No se pudo eliminar el favorito.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/company/favorites]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}