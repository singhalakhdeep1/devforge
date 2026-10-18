'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../../lib/api/platform'
import { useAuthStore } from '../../../lib/store/authStore'
import { timeAgo } from '../../../lib/utils'
import { PageHeader, Table, useAction } from '../../../components/kit'
import { ErrorBox, Loading } from '../../../components/state'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Select } from '../../../components/ui/select'

const ROLES = ['STUDENT', 'INSTRUCTOR', 'MODERATOR', 'ADMIN']

export default function AdminUsers() {
  const me = useAuthStore((s) => s.user)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [page, setPage] = useState(1)
  const q = useQuery({ queryKey: ['admin-users', search, role, page], queryFn: () => adminApi.users({ search: search || undefined, role: role || undefined, page, limit: 25 }) })
  const setUserRole = useAction(({ id, r }: { id: string; r: string }) => adminApi.setRole(id, r), { success: 'Role changed', invalidate: [['admin-users']] })
  const setActive = useAction(({ id, active }: { id: string; active: boolean }) => adminApi.setActive(id, active), { success: (_r) => 'Account updated', invalidate: [['admin-users']] })

  return (
    <div>
      <PageHeader title="Users" description={q.data ? `${q.data.total} accounts` : undefined} />
      <div className="mb-4 flex flex-wrap gap-2">
        <Input className="max-w-xs" placeholder="Search name or email…" value={search} onChange={(e) => (setSearch(e.target.value), setPage(1))} aria-label="Search users" />
        <Select className="w-40" value={role} onChange={(e) => (setRole(e.target.value), setPage(1))} aria-label="Role filter">
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r.toLowerCase()}
            </option>
          ))}
        </Select>
      </div>
      {q.isLoading ? (
        <Loading />
      ) : q.error ? (
        <ErrorBox error={q.error} onRetry={() => q.refetch()} />
      ) : (
        <>
          <Table head={['Name', 'Email', 'Role', 'Status', 'Last sign-in', '']} empty={(q.data?.data ?? []).length === 0}>
            {(q.data?.data ?? []).map((u) => (
              <tr key={u.id}>
                <td className="px-3 py-2 font-medium">{u.name}</td>
                <td className="px-3 py-2 text-muted-foreground">{u.email}</td>
                <td className="px-3 py-2">
                  <Select className="h-8 w-32" value={u.role} disabled={u.id === me?.id} onChange={(e) => confirm(`Make ${u.name} ${e.target.value.toLowerCase()}?`) && setUserRole.mutate({ id: u.id, r: e.target.value })} aria-label={`Role of ${u.name}`}>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r.toLowerCase()}
                      </option>
                    ))}
                  </Select>
                </td>
                <td className="px-3 py-2">{u.isActive ? <Badge variant="outline">active</Badge> : <Badge variant="destructive">suspended</Badge>}</td>
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{u.lastLoginAt ? timeAgo(u.lastLoginAt) : 'never'}</td>
                <td className="px-3 py-2 text-right">
                  {u.id !== me?.id && (
                    <Button variant="ghost" size="sm" onClick={() => confirm(u.isActive ? `Suspend ${u.name}? They are signed out everywhere.` : `Reactivate ${u.name}?`) && setActive.mutate({ id: u.id, active: !u.isActive })}>
                      {u.isActive ? 'Suspend' : 'Reactivate'}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </Table>
          {(q.data?.totalPages ?? 1) > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3 text-sm">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              Page {page} of {q.data!.totalPages}
              <Button variant="outline" size="sm" disabled={page >= (q.data!.totalPages ?? 1)} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
