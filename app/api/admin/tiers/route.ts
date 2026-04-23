import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import * as adminService from '@/lib/services/admin.service'
import { createTierSchema } from '@/lib/validators/admin.validators'

export async function GET() {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const tiers = await adminService.getTiers()
    return NextResponse.json({ success: true, data: tiers })
  } catch (error) {
    console.error('[GET /api/admin/tiers]', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo tiers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const parsed = createTierSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const tier = await adminService.createTier(parsed.data, auth.adminUserId)
    return NextResponse.json({ success: true, data: tier }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/admin/tiers]', error)
    const message = error instanceof Error ? error.message : 'Error creando tier'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}