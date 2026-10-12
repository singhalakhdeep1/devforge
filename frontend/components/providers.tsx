'use client'

import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { refreshSession } from '../lib/api/client'
import { closeSocket } from '../lib/socket'
import { sessionHint, useAuthStore } from '../lib/store/authStore'
import { ToastProvider } from './toast'

/** Restores the signed-in session from the httpOnly refresh cookie on first load. */
function SessionRestore({ children }: { children: React.ReactNode }) {
  const setInitialized = useAuthStore((s) => s.setInitialized)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!sessionHint.get()) {
      setInitialized() // never signed in on this browser: nothing to restore
      return
    }
    refreshSession()
      .catch(() => sessionHint.set(false)) // cookie expired or revoked: simply signed out
      .finally(setInitialized)
  }, [setInitialized])

  useEffect(() => {
    if (!user) closeSocket()
  }, [user])

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 } },
      })
  )

  return (
    <QueryClientProvider client={client}>
      <ToastProvider>
        <SessionRestore>{children}</SessionRestore>
      </ToastProvider>
    </QueryClientProvider>
  )
}
