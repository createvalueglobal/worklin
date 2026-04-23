import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import * as adminService from '@/lib/services/admin.service'
import { adminLogsFiltersSchema } from '@/lib/validators/admin.validators'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = request.nextUrl
    const parsed = adminLogsFiltersSchema.safeParse({
      action: searchParams.get('action') ?? undefined,
      adminUserId: searchParams.get('adminUserId') ?? undefined,
      dateFrom: searchParams.get('dateFrom') ?? undefined,
      dateTo: searchParams.get('dateTo') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const [result, adminUsers] = await Promise.all([
      adminService.getLogs(parsed.data),
      adminService.getAdminUsersForFilter(),
    ])

    return NextResponse.json({
      success: true,
      data: result,
      adminUsers, // for filter dropdown in UI
    })
  } catch (error) {
    console.error('[GET /api/admin/logs]', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo logs' },
      { status: 500 }
    )
  }
}