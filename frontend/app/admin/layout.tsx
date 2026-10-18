'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, DatabaseBackup, FileBarChart, Gauge, ScrollText, Server, Users } from 'lucide-react'
import { RequireAuth } from '../../components/require-auth'
import { cn } from '../../lib/utils'

const NAV = [
  { href: '/admin', label: 'Overview', icon: Gauge },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/monitoring', label: 'Monitoring', icon: Activity },
  { href: '/admin/audit', label: 'Audit log', icon: ScrollText },
  { href: '/reports', label: 'Reports', icon: FileBarChart },
  { href: '/admin/backups', label: 'Backups', icon: DatabaseBackup },
  { href: '/admin/system', label: 'System', icon: Server },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <RequireAuth roles={['ADMIN']}>
      <div className="container mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 md:flex-row">
        <nav aria-label="Administration" className="flex shrink-0 gap-1 overflow-x-auto md:w-48 md:flex-col">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn('flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium hover:bg-accent', (href === '/admin' ? pathname === href : pathname.startsWith(href)) && 'bg-accent')}
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </RequireAuth>
  )
}
