import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import * as adminService from '@/lib/services/admin.service'
import { cancelSubscriptionSchema } from '@/lib/validators/admin.validators'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params
    const body = await request.json()

    const parsed = cancelSubscriptionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    await adminService.cancelSubscription(
      { subscriptionId: id, adminNotes: parsed.data.adminNotes },
      auth.adminUserId
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[POST /api/admin/subscriptions/[id]/cancel]', error)
    const message = error instanceof Error ? error.message : 'Error cancelando suscripción'
    const status =
      message === 'Suscripción no encontrada'
        ? 404
        : message === 'Solo se pueden cancelar suscripciones activas'
          ? 409
          : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}