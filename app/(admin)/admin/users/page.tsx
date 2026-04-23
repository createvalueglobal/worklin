import { Suspense } from 'react'
import { AdminHeader } from '@/components/features/admin/layout/AdminHeader'
import { UsersFilters } from '@/components/features/admin/users/UsersFilters'
import { UsersTable } from '@/components/features/admin/users/UsersTable'
import { getUsers } from '@/lib/services/admin.service'
import { adminUsersFiltersSchema } from '@/lib/validators/admin.validators'

// ============================================================
// ADMIN USERS PAGE
// Server component — reads URL params, fetches data, passes
// to client table for optimistic updates.
// ============================================================

interface AdminUsersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const params = await searchParams

  const parsed = adminUsersFiltersSchema.safeParse({
    role: params.role,
    isActive: params.isActive,
    search: params.search,
    page: params.page,
    limit: params.limit,
  })

  const filters = parsed.success
    ? parsed.data
    : { role: 'all' as const, isActive: 'all' as const, page: 1, limit: 20 }

  let data
  try {
    data = await getUsers(filters)
  } catch {
    data = { data: [], total: 0, page: 1, limit: 20 }
  }

  return (
    <div className="space-y-5">
      <AdminHeader
        title="Usuarios"
        description={`${data.total} usuario${data.total !== 1 ? 's' : ''} registrado${data.total !== 1 ? 's' : ''}`}
      />

      <Suspense>
        <UsersFilters />
      </Suspense>

      <UsersTable initialData={data} currentPage={filters.page} />
    </div>
  )
}