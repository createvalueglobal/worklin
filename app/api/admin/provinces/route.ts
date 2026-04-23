import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import * as adminService from '@/lib/services/admin.service'
import { createProvinceSchema } from '@/lib/validators/admin.validators'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = request.nextUrl
    const countryId = searchParams.get('countryId') ?? undefined

    const provinces = await adminService.getProvinces(countryId)
    return NextResponse.json({ success: true, data: provinces })
  } catch (error) {
    console.error('[GET /api/admin/provinces]', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo provincias' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const parsed = createProvinceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const province = await adminService.createProvince(parsed.data, auth.adminUserId)
    return NextResponse.json({ success: true, data: province }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/provinces]', error)
    const message = error instanceof Error ? error.message : 'Error creando provincia'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}