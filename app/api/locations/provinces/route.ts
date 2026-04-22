import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/locations/provinces?country_id=<uuid>
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const countryId = searchParams.get('country_id')

  if (!countryId) {
    return NextResponse.json({ provinces: [] })
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('provinces')
      .select('id, name, code')
      .eq('country_id', countryId)
      .eq('is_active', true)
      .order('name')

    if (error) {
      return NextResponse.json({ error: 'Error al obtener provincias' }, { status: 500 })
    }

    return NextResponse.json({ provinces: data ?? [] })
  } catch (error) {
    console.error('[GET /api/locations/provinces]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}