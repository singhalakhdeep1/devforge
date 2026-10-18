'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ShieldCheck, ShieldOff } from 'lucide-react'
import { userApi } from '../../lib/api'
import { billingApi, securityApi } from '../../lib/api/platform'
import { useAuthStore } from '../../lib/store/authStore'
import { closeSocket } from '../../lib/socket'
import { timeAgo } from '../../lib/utils'
import { Field, PageHeader, Table, Tabs, formatDate, useAction, useHashTab } from '../../components/kit'
import { RequireAuth } from '../../components/require-auth'
import { ErrorBox, Loading } from '../../components/state'
import { useToast } from '../../components/toast'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'

const TABS = ['security', 'sessions', 'billing'] as const

export default function SettingsPage() {
  return (
    <RequireAuth>
      <Suspense fallback={<Loading />}>
        <Settings />
      </Suspense>
    </RequireAuth>
  )
}

function Settings() {
  const [tab, setTab] = useHashTab(TABS, 'security')
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <PageHeader title="Settings" description="Sign-in security, devices and billing." />
      <Tabs
        tabs={[
          { id: 'security', label: 'Security' },
          { id: 'sessions', label: 'Devices' },
          { id: 'billing', label: 'Billing' },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'security' && <Security />}
      {tab === 'sessions' && <Sessions />}
      {tab === 'billing' && <Billing />}
    </div>
  )
}

function BackupCodes({ codes }: { codes: string[] }) {
  return (
    <div className="space-y-2 rounded-md border border-amber-300 bg-amber-50 p-4 dark:bg-amber-950/30">
      <p className="text-sm font-medium">Save these backup codes somewhere safe. Each works once if you lose your phone; they will not be shown again.</p>
      <div className="grid grid-cols-2 gap-1 font-mono text-sm sm:grid-cols-5">
        {codes.map((c) => (
          <span key={c}>{c}</span>
        ))}
      </div>
      <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(codes.join('\n'))}>
        Copy codes
      </Button>
    </div>
  )
}

function Security() {
  const status = useQuery({ queryKey: ['2fa'], queryFn: securityApi.twoFactorStatus })
  const [setup, setSetup] = useState<{ secret: string; qrCode: string } | null>(null)
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [codes, setCodes] = useState<string[] | null>(null)
  const begin = useAction(securityApi.setup2fa, { onDone: (s) => setSetup(s) })
  const enable = useAction(() => securityApi.enable2fa(code), { success: 'Two-factor authentication is on', invalidate: [['2fa']], onDone: (r) => (setCodes(r.backupCodes), setSetup(null), setCode('')) })
  const disable = useAction(() => securityApi.disable2fa(code, password || undefined), { success: 'Two-factor authentication is off', invalidate: [['2fa']], onDone: () => (setCode(''), setPassword(''), setCodes(null)) })
  const regenerate = useAction(() => securityApi.regenerateBackupCodes(code), { invalidate: [['2fa']], onDone: (r) => (setCodes(r.backupCodes), setCode('')) })

  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const change = useAction(() => userApi.changePassword(current, next), { success: 'Password changed', onDone: () => (setCurrent(''), setNext('')) })

  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-6">
        <div className="flex items-center gap-2">
          {status.data?.enabled ? <ShieldCheck className="h-5 w-5 text-green-600" /> : <ShieldOff className="h-5 w-5 text-muted-foreground" />}
          <h2 className="font-semibold">Two-factor authentication</h2>
          {status.data && <Badge variant={status.data.enabled ? 'default' : 'outline'}>{status.data.enabled ? 'on' : 'off'}</Badge>}
        </div>
        {status.isLoading ? (
          <Loading />
        ) : status.data?.enabled ? (
          <>
            <p className="text-sm text-muted-foreground">Signing in asks for a code from your authenticator app. {status.data.backupCodesRemaining} backup codes left.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Current code from your app" htmlFor="tfa-code">
                <Input id="tfa-code" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value.trim())} maxLength={12} />
              </Field>
              <Field label="Password (to turn it off)" htmlFor="tfa-pw">
                <Input id="tfa-pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </Field>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled={code.length !== 6 || regenerate.isPending} onClick={() => regenerate.mutate(undefined)}>
                New backup codes
              </Button>
              <Button variant="destructive" disabled={code.length < 6 || disable.isPending} onClick={() => disable.mutate(undefined)}>
                Turn off
              </Button>
            </div>
          </>
        ) : setup ? (
          <div className="space-y-3">
            <p className="text-sm">Scan this with Google Authenticator, 1Password, Authy or similar, then enter the 6-digit code it shows.</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={setup.qrCode} alt="QR code for your authenticator app" className="h-44 w-44 rounded border bg-white p-2" />
            <p className="text-xs text-muted-foreground">
              Or enter this key by hand: <code className="font-mono">{setup.secret}</code>
            </p>
            <form className="flex gap-2" onSubmit={(e) => (e.preventDefault(), enable.mutate(undefined))}>
              <Input className="w-36" inputMode="numeric" placeholder="123456" value={code} onChange={(e) => setCode(e.target.value.trim())} maxLength={6} aria-label="Code" />
              <Button type="submit" disabled={code.length !== 6 || enable.isPending}>
                Turn on
              </Button>
            </form>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">Protect your account with a second step at sign-in.</p>
            <Button onClick={() => begin.mutate(undefined)} disabled={begin.isPending}>
              Set up
            </Button>
          </>
        )}
        {codes && <BackupCodes codes={codes} />}
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 font-semibold">Password</h2>
        <form className="grid max-w-md gap-3" onSubmit={(e) => (e.preventDefault(), change.mutate(undefined))}>
          <Field label="Current password" htmlFor="pw-current">
            <Input id="pw-current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
          </Field>
          <Field label="New password" htmlFor="pw-new" hint="At least 8 characters">
            <Input id="pw-new" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={8} />
          </Field>
          <Button type="submit" className="w-fit" disabled={change.isPending}>
            Change password
          </Button>
        </form>
      </Card>
    </div>
  )
}

function Sessions() {
  const router = useRouter()
  const clear = useAuthStore((s) => s.clear)
  const q = useQuery({ queryKey: ['sessions'], queryFn: securityApi.sessions })
  const revoke = useAction(securityApi.revokeSession, { success: 'Signed out that device', invalidate: [['sessions']] })
  const all = useAction(securityApi.logoutAll, {
    success: 'Signed out everywhere',
    onDone: () => {
      closeSocket()
      clear()
      router.push('/login')
    },
  })
  if (q.isLoading) return <Loading />
  if (q.error) return <ErrorBox error={q.error} onRetry={() => q.refetch()} />
  return (
    <div className="space-y-4">
      <Table head={['Device', 'IP', 'Signed in', 'Last active', '']} empty={(q.data ?? []).length === 0}>
        {(q.data ?? []).map((s) => (
          <tr key={s.id}>
            <td className="max-w-xs truncate px-3 py-2" title={s.userAgent ?? ''}>
              {s.userAgent ?? 'Unknown device'} {s.current && <Badge className="ml-1">this device</Badge>}
            </td>
            <td className="px-3 py-2 text-muted-foreground">{s.ip ?? '—'}</td>
            <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{formatDate(s.createdAt)}</td>
            <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{s.lastUsedAt ? timeAgo(s.lastUsedAt) : '—'}</td>
            <td className="px-3 py-2 text-right">
              {!s.current && (
                <Button variant="ghost" size="sm" onClick={() => revoke.mutate(s.id)}>
                  Sign out
                </Button>
              )}
            </td>
          </tr>
        ))}
      </Table>
      <Button variant="outline" onClick={() => confirm('Sign out of every device, including this one?') && all.mutate(undefined)}>
        Sign out everywhere
      </Button>
    </div>
  )
}

const money = (amount: number, currency = 'usd') => new Intl.NumberFormat(undefined, { style: 'currency', currency: currency.toUpperCase() }).format(amount)

function Billing() {
  const toast = useToast()
  const params = useSearchParams()
  const config = useQuery({ queryKey: ['payments-config'], queryFn: billingApi.config })
  const sub = useQuery({ queryKey: ['subscription'], queryFn: billingApi.subscription })
  const orders = useQuery({ queryKey: ['orders'], queryFn: billingApi.orders })
  const invoices = useQuery({ queryKey: ['invoices'], queryFn: billingApi.invoices, enabled: Boolean(config.data?.enabled) })
  const subscribe = useAction(billingApi.subscribe, { onDone: (r) => (window.location.href = r.url) })
  const portal = useAction(billingApi.portal, { onDone: (r) => (window.location.href = r.url) })
  const cancel = useAction(billingApi.cancel, { success: 'Your plan ends at the close of this billing period', invalidate: [['subscription']] })
  const resume = useAction(billingApi.resume, { success: 'Subscription resumed', invalidate: [['subscription']] })
  const refund = useAction((id: string) => billingApi.refund(id), { success: 'Refund requested', invalidate: [['orders']] })

  useEffect(() => {
    if (params.get('subscribed')) toast.success('Thanks! Your subscription is active.')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (config.isLoading || sub.isLoading) return <Loading />
  const c = config.data
  const s = sub.data?.subscription
  const refundable = (o: { status: string; paidAt?: string | null }) => o.status === 'PAID' && o.paidAt && (Date.now() - new Date(o.paidAt).getTime()) / 86_400_000 <= (c?.refundWindowDays ?? 0)

  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-6">
        <h2 className="font-semibold">Subscription</h2>
        {!c?.enabled && <p className="text-sm text-muted-foreground">Payments are not configured on this server.</p>}
        {sub.data?.active && s ? (
          <div className="space-y-3 text-sm">
            <p>
              You are on the <strong>{s.plan}</strong> plan <Badge variant="outline">{s.status}</Badge>
            </p>
            {s.currentPeriodEnd && <p className="text-muted-foreground">{s.cancelAtPeriodEnd ? 'Ends' : 'Renews'} on {new Date(s.currentPeriodEnd).toLocaleDateString()}</p>}
            <div className="flex flex-wrap gap-2">
              {s.cancelAtPeriodEnd ? (
                <Button onClick={() => resume.mutate(undefined)} disabled={resume.isPending}>
                  Resume
                </Button>
              ) : (
                <Button variant="outline" onClick={() => confirm('Cancel at the end of this period?') && cancel.mutate(undefined)} disabled={cancel.isPending}>
                  Cancel plan
                </Button>
              )}
              <Button variant="outline" onClick={() => portal.mutate(undefined)} disabled={portal.isPending}>
                Payment methods &amp; invoices
              </Button>
            </div>
          </div>
        ) : (
          c?.enabled && (
            <div className="grid gap-3 sm:grid-cols-2">
              {c.plans.map((p) => (
                <div key={p.id} className="rounded-lg border p-4">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-2xl font-bold">
                    {money(p.amountCents / 100, c.currency)}
                    <span className="text-sm font-normal text-muted-foreground"> / {p.interval}</span>
                  </p>
                  <p className="mb-3 text-xs text-muted-foreground">Every paid course included while subscribed.</p>
                  <Button onClick={() => subscribe.mutate(p.id)} disabled={subscribe.isPending}>
                    Subscribe
                  </Button>
                </div>
              ))}
            </div>
          )
        )}
      </Card>

      <div>
        <h2 className="mb-2 font-semibold">Course purchases</h2>
        <Table head={['Course', 'Amount', 'Status', 'Date', '']} empty={(orders.data ?? []).length === 0}>
          {(orders.data ?? []).map((o) => (
            <tr key={o.id}>
              <td className="px-3 py-2">{o.course?.title ?? o.courseTitle}</td>
              <td className="px-3 py-2">
                {money(o.amount, o.currency)}
                {o.refunded > 0 && <span className="text-xs text-muted-foreground"> ({money(o.refunded, o.currency)} refunded)</span>}
              </td>
              <td className="px-3 py-2">
                <Badge variant="outline">{o.status.toLowerCase()}</Badge>
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{formatDate(o.paidAt ?? o.createdAt)}</td>
              <td className="px-3 py-2 text-right">
                {refundable(o) && (
                  <Button variant="ghost" size="sm" onClick={() => confirm(`Refund ${o.course?.title ?? o.courseTitle}? You will lose access to the course.`) && refund.mutate(o.id)}>
                    Refund
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </Table>
        {c?.refundWindowDays ? <p className="mt-1 text-xs text-muted-foreground">Purchases can be refunded within {c.refundWindowDays} days.</p> : null}
      </div>

      {c?.enabled && (
        <div>
          <h2 className="mb-2 font-semibold">Invoices</h2>
          <Table head={['Number', 'Amount', 'Status', 'Date', '']} empty={(invoices.data ?? []).length === 0}>
            {(invoices.data ?? []).map((i) => (
              <tr key={i.id}>
                <td className="px-3 py-2 font-mono text-xs">{i.number ?? i.id}</td>
                <td className="px-3 py-2">{money(i.amount, i.currency)}</td>
                <td className="px-3 py-2">{i.status}</td>
                <td className="px-3 py-2 text-muted-foreground">{new Date(i.created).toLocaleDateString()}</td>
                <td className="space-x-2 px-3 py-2 text-right">
                  {i.url && (
                    <a className="text-blue-600 hover:underline" href={i.url} target="_blank" rel="noreferrer">
                      View
                    </a>
                  )}
                  {i.pdf && (
                    <a className="text-blue-600 hover:underline" href={i.pdf} target="_blank" rel="noreferrer">
                      PDF
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}
    </div>
  )
}
