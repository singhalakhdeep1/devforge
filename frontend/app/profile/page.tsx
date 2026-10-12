'use client'

import { useRef, useState } from 'react'
import { Camera, CheckCircle2, MailWarning } from 'lucide-react'
import { apiErrorMessage, authApi, userApi } from '../../lib/api'
import { useAuthStore } from '../../lib/store/authStore'
import { RequireAuth } from '../../components/require-auth'
import { useToast } from '../../components/toast'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { UserAvatar } from '../../components/user-avatar'

function ProfileForm() {
  const toast = useToast()
  const user = useAuthStore((s) => s.user)!
  const setUser = useAuthStore((s) => s.setUser)
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    name: user.name,
    bio: user.bio ?? '',
    location: user.location ?? '',
    skills: user.skills.join(', '),
    githubUrl: user.githubUrl ?? '',
    linkedinUrl: user.linkedinUrl ?? '',
    portfolioUrl: user.portfolioUrl ?? '',
  })
  const [saving, setSaving] = useState(false)
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await userApi.update({
        ...form,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      })
      setUser(updated)
      toast.success('Profile saved')
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not save your profile'))
    } finally {
      setSaving(false)
    }
  }

  const upload = async (file: File | undefined) => {
    if (!file) return
    try {
      const { avatar } = await userApi.uploadAvatar(file)
      setUser({ ...user, avatar })
      toast.success('Photo updated')
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Upload failed. Use a PNG, JPEG or WebP image up to 2 MB.'))
    }
  }

  const resend = async () => {
    try {
      await authApi.resendVerification()
      toast.success('Verification email sent')
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>This is shown next to your questions, answers and certificates.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex items-center gap-4">
          <div className="relative">
            <UserAvatar name={user.name} src={user.avatar} className="h-20 w-20 text-2xl" />
            <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 rounded-full border bg-background p-1.5 shadow" aria-label="Change photo">
              <Camera className="h-4 w-4" />
            </button>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
          </div>
          <div>
            <p className="font-semibold">{user.email}</p>
            {user.isVerified ? (
              <p className="flex items-center gap-1 text-sm text-green-600"><CheckCircle2 className="h-4 w-4" />Email verified</p>
            ) : (
              <p className="flex items-center gap-2 text-sm text-yellow-700">
                <MailWarning className="h-4 w-4" />Email not verified
                <button onClick={resend} className="underline">Resend link</button>
              </p>
            )}
            <p className="text-xs capitalize text-muted-foreground">{user.role.toLowerCase()}</p>
          </div>
        </div>

        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={set('name')} required maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={form.location} onChange={set('location')} maxLength={100} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={form.bio} onChange={set('bio')} maxLength={500} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skills">Skills</Label>
            <Input id="skills" value={form.skills} onChange={set('skills')} placeholder="React, Node.js, SQL" />
            <p className="text-xs text-muted-foreground">Separate with commas (up to 20).</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {([['githubUrl', 'GitHub'], ['linkedinUrl', 'LinkedIn'], ['portfolioUrl', 'Website']] as const).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <Input id={key} type="url" value={form[key]} onChange={set(key)} placeholder="https://" />
              </div>
            ))}
          </div>
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
        </form>
      </CardContent>
    </Card>
  )
}

function PasswordForm() {
  const toast = useToast()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await userApi.changePassword(current, next)
      setCurrent('')
      setNext('')
      toast.success('Password changed. Other devices were signed out.')
    } catch (err) {
      toast.error(apiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>Changing it signs you out everywhere else.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4 sm:max-w-md">
          <div className="space-y-2">
            <Label htmlFor="current">Current password</Label>
            <Input id="current" type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new">New password</Label>
            <Input id="new" type="password" autoComplete="new-password" required minLength={8} value={next} onChange={(e) => setNext(e.target.value)} />
          </div>
          <Button type="submit" className="w-fit" disabled={saving}>{saving ? 'Saving…' : 'Change password'}</Button>
        </form>
      </CardContent>
    </Card>
  )
}

function DangerZone() {
  const toast = useToast()
  const clear = useAuthStore((s) => s.clear)
  const [password, setPassword] = useState('')
  const [open, setOpen] = useState(false)

  const remove = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await userApi.deleteAccount(password)
      clear()
      window.location.assign('/')
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  return (
    <Card className="border-red-200 dark:border-red-900">
      <CardHeader>
        <CardTitle className="text-red-600">Delete account</CardTitle>
        <CardDescription>Permanently removes your account, progress, certificates and posts. This cannot be undone.</CardDescription>
      </CardHeader>
      <CardContent>
        {open ? (
          <form onSubmit={remove} className="flex flex-col gap-3 sm:max-w-md">
            <Label htmlFor="del-pass">Confirm with your password</Label>
            <Input id="del-pass" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="flex gap-2">
              <Button type="submit" variant="destructive">Delete my account</Button>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </form>
        ) : (
          <Button variant="outline" onClick={() => setOpen(true)}>Delete account…</Button>
        )}
      </CardContent>
    </Card>
  )
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <h1 className="text-3xl font-bold">Your account</h1>
        <ProfileForm />
        <PasswordForm />
        <DangerZone />
      </div>
    </RequireAuth>
  )
}
