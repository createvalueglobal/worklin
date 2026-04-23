import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import * as adminService from '@/lib/services/admin.service'
import { toggleUserActiveSchema } from '@/lib/validators/admin.validators'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params
    const body = await request.json()

    const parsed = toggleUserActiveSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Prevent admin from deactivating themselves
    if (id === auth.adminUserId) {
      return NextResponse.json(
        { success: false, error: 'No puedes desactivar tu propia cuenta' },
        { status: 400 }
      )
    }

    await adminService.toggleUserActive(
      id,
      parsed.data.isActive,
      auth.adminUserId,
      parsed.data.notes
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[POST /api/admin/users/[id]/toggle-active]', error)
    const message = error instanceof Error ? error.message : 'Error actualizando usuario'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}