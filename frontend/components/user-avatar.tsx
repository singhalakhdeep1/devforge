import { FILES_URL } from '../lib/api/client'
import { cn } from '../lib/utils'

/** Uploaded avatars live on the API origin; everything else falls back to the initial. */
export function UserAvatar({ name, src, className }: { name: string; src?: string | null; className?: string }) {
  const url = src ? (src.startsWith('http') ? src : `${FILES_URL}${src}`) : null
  return (
    <span className={cn('relative inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary', className)}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name} className="h-full w-full object-cover" />
      ) : (
        (name.trim()[0] ?? '?').toUpperCase()
      )}
    </span>
  )
}
