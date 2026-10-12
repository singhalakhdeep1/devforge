'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '../lib/store/authStore'
import type { Role } from '../lib/api/types'
import { Loading } from './state'

/**
 * Wraps a page that needs a signed-in user (optionally with one of the given roles).
 * Waits for the session restore to finish before deciding, so a reload never flashes the login page.
 */
export function RequireAuth({ roles, children }: { roles?: Role[]; children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const search = useSearchParams()
  const { user, initialized } = useAuthStore()

  useEffect(() => {
    if (initialized && !user) {
      const next = pathname + (search.toString() ? `?${search}` : '')
      router.replace(`/login?next=${encodeURIComponent(next)}`)
    }
  }, [initialized, user, router, pathname, search])

  if (!initialized || !user) return <Loading />

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Access restricted</h1>
        <p className="mt-2 text-muted-foreground">Your account does not have permission to view this page.</p>
      </div>
    )
  }

  return <>{children}</>
}
