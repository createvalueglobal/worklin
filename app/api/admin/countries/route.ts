import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import * as adminService from '@/lib/services/admin.service'
import { createCountrySchema } from '@/lib/validators/admin.validators'

export async function GET() {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const countries = await adminService.getCountries()
    return NextResponse.json({ success: true, data: countries })
  } catch (error) {
    console.error('[GET /api/admin/countries]', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo países' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const parsed = createCountrySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const country = await adminService.createCountry(parsed.data, auth.adminUserId)
    return NextResponse.json({ success: true, data: country }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/countries]', error)
    const message = error instanceof Error ? error.message : 'Error creando país'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}