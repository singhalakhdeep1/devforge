'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiErrorMessage, authApi } from '../../lib/api'
import { useAuthStore } from '../../lib/store/authStore'
import { safeNext } from '../../lib/utils'
import { AuthShell, FormError } from '../../components/auth-shell'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const next = safeNext(useSearchParams().get('next'))
  const { user, initialized, setAuth } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialized && user) router.replace(next)
  }, [initialized, user, next, router])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { user, accessToken } = await authApi.login({ email, password })
      setAuth(user, accessToken)
      router.replace(next)
    } catch (err) {
      setError(apiErrorMessage(err, 'Sign in failed'))
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Welcome back" description="Sign in to continue learning">
      <form onSubmit={submit} className="space-y-4">
        <FormError message={error} />
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          New to DevForge?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
