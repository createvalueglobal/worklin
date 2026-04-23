import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import * as adminService from '@/lib/services/admin.service'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const { id } = await params
    const user = await adminService.getUserDetail(id)
    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('[GET /api/admin/users/[id]]', error)
    const message = error instanceof Error ? error.message : 'Error obteniendo usuario'
    const status = message === 'Usuario no encontrado' ? 404 : 500
    return NextResponse.json({ success: false, error: message }, { status })
  }
}