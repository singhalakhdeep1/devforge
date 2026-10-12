'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { apiErrorMessage, authApi } from '../../../lib/api'
import { AuthShell, FormError } from '../../../components/auth-shell'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) return setError('Passwords do not match')
    setLoading(true)
    setError('')
    try {
      await authApi.resetPassword(token, password)
      setDone(true)
      setTimeout(() => router.replace('/login'), 2500)
    } catch (err) {
      setError(apiErrorMessage(err, 'This reset link is invalid or has expired'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Choose a new password" description="You'll be signed out of all devices">
      {done ? (
        <p className="text-center text-sm">Password updated. Redirecting you to sign in…</p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <FormError message={error} />
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
            <p className="text-xs text-muted-foreground">At least 8 characters, with a letter and a number.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input id="confirm" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Saving…' : 'Update password'}
          </Button>
          <p className="text-center text-sm">
            <Link href="/forgot-password" className="text-blue-600 hover:underline">
              Request a new link
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  )
}
