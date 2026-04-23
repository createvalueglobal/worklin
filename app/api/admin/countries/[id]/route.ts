import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import * as adminService from '@/lib/services/admin.service'
import { updateCountrySchema } from '@/lib/validators/admin.validators'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params
    const body = await request.json()

    const parsed = updateCountrySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const country = await adminService.updateCountry(id, parsed.data, auth.adminUserId)
    return NextResponse.json({ success: true, data: country })
  } catch (error) {
    console.error('[PATCH /api/admin/countries/[id]]', error)
    const message = error instanceof Error ? error.message : 'Error actualizando país'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}