import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import * as adminService from '@/lib/services/admin.service'
import { updateProvinceSchema } from '@/lib/validators/admin.validators'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params
    const body = await request.json()

    const parsed = updateProvinceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const province = await adminService.updateProvince(id, parsed.data, auth.adminUserId)
    return NextResponse.json({ success: true, data: province })
  } catch (error) {
    console.error('[PATCH /api/admin/provinces/[id]]', error)
    const message = error instanceof Error ? error.message : 'Error actualizando provincia'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}