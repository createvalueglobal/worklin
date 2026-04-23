import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import * as adminService from '@/lib/services/admin.service'

export async function GET() {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const stats = await adminService.getStats()
    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error('[GET /api/admin/stats]', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo métricas' },
      { status: 500 }
    )
  }
}