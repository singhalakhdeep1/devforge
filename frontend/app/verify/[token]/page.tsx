'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { CheckCircle2, XCircle } from 'lucide-react'
import { apiErrorMessage, authApi } from '../../../lib/api'
import { useAuthStore } from '../../../lib/store/authStore'
import { AuthShell } from '../../../components/auth-shell'
import { Loading } from '../../../components/state'
import { Button, ButtonLink } from '../../../components/ui/button'

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const started = useRef(false) // React strict mode runs effects twice in development

  useEffect(() => {
    if (started.current) return
    started.current = true
    authApi
      .verify(token)
      .then(() => {
        setState('ok')
        if (user) setUser({ ...user, isVerified: true })
      })
      .catch((err) => {
        setMessage(apiErrorMessage(err, 'Verification failed'))
        setState('error')
      })
  }, [token, user, setUser])

  return (
    <AuthShell title="Email verification" description="Confirming your email address">
      {state === 'loading' ? (
        <Loading label="Verifying…" />
      ) : state === 'ok' ? (
        <div className="space-y-4 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
          <p>Your email is verified.</p>
          <ButtonLink href="/dashboard">Continue</ButtonLink>
        </div>
      ) : (
        <div className="space-y-4 text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-600" />
          <p>{message}</p>
          <p className="text-sm text-muted-foreground">Sign in and request a new verification email from your profile.</p>
          <ButtonLink href="/login" variant="outline">Sign in</ButtonLink>
        </div>
      )}
    </AuthShell>
  )
}
