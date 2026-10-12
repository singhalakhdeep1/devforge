import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
/** Only same-site relative paths are allowed as a post-login destination (prevents open redirects). */
export function safeNext(value: string | null, fallback = '/dashboard') {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : fallback
}

export function formatPrice(price: number) {
  return price > 0 ? `$${price.toFixed(2)}` : 'Free'
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

export function timeAgo(iso: string) {
  const seconds = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  const steps: [number, string][] = [[60, 'second'], [60, 'minute'], [24, 'hour'], [30, 'day'], [12, 'month']]
  let value = seconds
  for (const [size, unit] of steps) {
    if (value < size) return `${Math.floor(value)} ${unit}${Math.floor(value) === 1 ? '' : 's'} ago`
    value /= size
  }
  return `${Math.floor(value)} year${Math.floor(value) === 1 ? '' : 's'} ago`
}
