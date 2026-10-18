'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, GraduationCap, Menu, Moon, Sun, X } from 'lucide-react'
import { authApi, notificationApi } from '../lib/api'
import { getSocket } from '../lib/socket'
import { useAuthStore } from '../lib/store/authStore'
import { cn } from '../lib/utils'
import { useToast } from './toast'
import { Button, ButtonLink } from './ui/button'
import { UserAvatar } from './user-avatar'

function useOutsideClick(onOutside: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onOutside])
  return ref
}

function ThemeToggle() {
  const [dark, setDark] = useState(false)
  useEffect(() => setDark(document.documentElement.classList.contains('dark')), [])

  const toggle = () => {
    const next = !dark
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {
      /* storage unavailable: the choice just won't persist */
    }
    setDark(next)
  }
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle dark mode">
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}

function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useOutsideClick(() => setOpen(false))
  const router = useRouter()
  const qc = useQueryClient()
  const toast = useToast()
  const accessToken = useAuthStore((s) => s.accessToken)

  const { data } = useQuery({ queryKey: ['notifications'], queryFn: notificationApi.list, enabled: Boolean(accessToken) })

  // New notifications arrive over the socket
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    const onNotification = (n: { title: string }) => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      toast.info(n.title)
    }
    socket.on('notification', onNotification)
    return () => {
      socket.off('notification', onNotification)
    }
  }, [accessToken, qc, toast])

  const unread = data?.unread ?? 0
  const recent = data?.items.slice(0, 6) ?? []

  const openItem = async (id: number, link: string | null) => {
    setOpen(false)
    await notificationApi.read(id).catch(() => undefined)
    qc.invalidateQueries({ queryKey: ['notifications'] })
    if (link) router.push(link)
  }

  return (
    <div className="relative" ref={ref}>
      <Button variant="ghost" size="icon" onClick={() => setOpen((o) => !o)} aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`} className="relative">
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{unread > 9 ? '9+' : unread}</span>
        )}
      </Button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border bg-background shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <span className="text-sm font-semibold">Notifications</span>
            <Link href="/notifications" onClick={() => setOpen(false)} className="text-xs text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">You&apos;re all caught up.</p>
          ) : (
            <ul className="max-h-80 divide-y overflow-y-auto">
              {recent.map((n) => (
                <li key={n.id}>
                  <button onClick={() => openItem(n.id, n.link)} className={cn('w-full px-4 py-3 text-left hover:bg-accent', !n.readAt && 'bg-blue-50/60 dark:bg-blue-950/30')}>
                    <p className="text-sm font-medium">{n.title}</p>
                    {n.body && <p className="line-clamp-2 text-xs text-muted-foreground">{n.body}</p>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function UserMenu() {
  const [open, setOpen] = useState(false)
  const ref = useOutsideClick(() => setOpen(false))
  const { user, clear } = useAuthStore()
  if (!user) return null

  const signOut = async () => {
    setOpen(false)
    await authApi.logout().catch(() => undefined)
    clear()
    // Full page load: drops every cached query and open socket so the next person on this
    // browser can never see this user's data, and avoids racing the route guards.
    window.location.assign('/')
  }
  const item = 'block w-full px-4 py-2 text-left text-sm hover:bg-accent'

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-label="Account menu" aria-expanded={open}>
        <UserAvatar name={user.name} src={user.avatar} />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border bg-background py-1 shadow-lg">
          <div className="border-b px-4 py-2">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Link href="/dashboard" className={item} onClick={() => setOpen(false)}>
            Dashboard
          </Link>
          <Link href="/profile" className={item} onClick={() => setOpen(false)}>
            Profile
          </Link>
          <Link href="/settings" className={item} onClick={() => setOpen(false)}>
            Security &amp; billing
          </Link>
          <Link href="/teams" className={item} onClick={() => setOpen(false)}>
            Teams
          </Link>
          <Link href="/feed" className={item} onClick={() => setOpen(false)}>
            Activity feed
          </Link>
          <Link href="/files" className={item} onClick={() => setOpen(false)}>
            Files
          </Link>
          <Link href="/video" className={item} onClick={() => setOpen(false)}>
            Video calls
          </Link>
          <Link href="/search" className={item} onClick={() => setOpen(false)}>
            Search
          </Link>
          {user.role === 'ADMIN' && (
            <Link href="/admin" className={item} onClick={() => setOpen(false)}>
              Administration
            </Link>
          )}
          {(user.role === 'INSTRUCTOR' || user.role === 'ADMIN') && (
            <Link href="/instructor" className={item} onClick={() => setOpen(false)}>
              Instructor studio
            </Link>
          )}
          {(user.role === 'INSTRUCTOR' || user.role === 'ADMIN') && (
            <Link href="/reports" className={item} onClick={() => setOpen(false)}>
              Reports
            </Link>
          )}
          <button onClick={signOut} className={cn(item, 'border-t text-red-600')}>
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const { user, initialized } = useAuthStore()
  const [mobile, setMobile] = useState(false)
  useEffect(() => setMobile(false), [pathname])

  // The lesson player and certificate pages use the full screen
  if (pathname.startsWith('/learn/') || pathname.startsWith('/certificates/') || /^\/video\/[^/]+/.test(pathname)) return null

  const links = [
    { href: '/courses', label: 'Courses' },
    ...(user
      ? [
          { href: '/dashboard', label: 'My learning' },
          { href: '/projects', label: 'Projects' },
          { href: '/boards', label: 'Boards' },
          { href: '/documents', label: 'Docs' },
          { href: '/editor', label: 'Code editor' },
          ...(user.role !== 'STUDENT' ? [{ href: '/instructor', label: 'Teach' }] : []),
        ]
      : []),
  ]
  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <GraduationCap className="h-6 w-6 text-blue-600" />
          DevForge
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={cn('rounded-md px-3 py-2 text-sm font-medium hover:bg-accent', active(l.href) && 'bg-accent')}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          {!initialized ? null : user ? (
            <>
              <NotificationBell />
              <UserMenu />
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <ButtonLink href="/login" variant="ghost">Sign in</ButtonLink>
              <ButtonLink href="/signup">Get started</ButtonLink>
            </div>
          )}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobile((m) => !m)} aria-label="Toggle menu">
            {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {mobile && (
        <div className="border-t px-4 py-2 md:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
              {l.label}
            </Link>
          ))}
          {initialized && !user && (
            <>
              <Link href="/login" className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
                Sign in
              </Link>
              <Link href="/signup" className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
                Get started
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
