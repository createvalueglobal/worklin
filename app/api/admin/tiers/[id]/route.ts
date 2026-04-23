import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import * as adminService from '@/lib/services/admin.service'
import { updateTierSchema } from '@/lib/validators/admin.validators'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params
    const body = await request.json()

    const parsed = updateTierSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const tier = await adminService.updateTier(id, parsed.data, auth.adminUserId)
    return NextResponse.json({ success: true, data: tier })
  } catch (error) {
    console.error('[PATCH /api/admin/tiers/[id]]', error)
    const message = error instanceof Error ? error.message : 'Error actualizando tier'
    // Surface business rule errors (active subscriptions) as 409
    const status = message.includes('suscripciones activas') ? 409 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}