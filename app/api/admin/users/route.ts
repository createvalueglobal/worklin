import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import * as adminService from '@/lib/services/admin.service'
import { adminUsersFiltersSchema } from '@/lib/validators/admin.validators'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = request.nextUrl
    const parsed = adminUsersFiltersSchema.safeParse({
      role: searchParams.get('role') ?? undefined,
      isActive: searchParams.get('isActive') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const result = await adminService.getUsers(parsed.data)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('[GET /api/admin/users]', error)
    return NextResponse.json(
      { success: false, error: 'Error obteniendo usuarios' },
      { status: 500 }
    )
  }
}