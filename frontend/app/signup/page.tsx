'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiErrorMessage, authApi } from '../../lib/api'
import { useAuthStore } from '../../lib/store/authStore'
import { cn } from '../../lib/utils'
import { AuthShell, FormError } from '../../components/auth-shell'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'

export default function SignupPage() {
  const router = useRouter()
  const { user, initialized, setAuth } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [role, setRole] = useState<'STUDENT' | 'INSTRUCTOR'>('STUDENT')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const submitted = useRef(false) // the submit handler picks the destination itself

  useEffect(() => {
    if (initialized && user && !submitted.current) router.replace('/dashboard')
  }, [initialized, user, router])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { user, accessToken } = await authApi.register({ ...form, role })
      submitted.current = true
      setAuth(user, accessToken)
      router.replace(role === 'INSTRUCTOR' ? '/instructor' : '/courses')
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not create your account'))
      setLoading(false)
    }
  }

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value })),
  })

  return (
    <AuthShell title="Create your account" description="Learn new skills or teach what you know">
      <form onSubmit={submit} className="space-y-4">
        <FormError message={error} />

        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Account type">
          {(
            [
              ['STUDENT', 'I want to learn'],
              ['INSTRUCTOR', 'I want to teach'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={role === value}
              onClick={() => setRole(value)}
              className={cn('rounded-md border px-3 py-2 text-sm font-medium transition-colors', role === value ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : 'hover:bg-accent')}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" autoComplete="name" required maxLength={100} {...field('name')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" required {...field('email')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" required minLength={8} {...field('password')} />
          <p className="text-xs text-muted-foreground">At least 8 characters, with a letter and a number.</p>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
