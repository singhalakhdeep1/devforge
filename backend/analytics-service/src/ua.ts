/** Small, dependency-free user-agent classifier: enough for dashboards, not for fingerprinting. */
export interface Client {
  device: 'mobile' | 'tablet' | 'desktop' | 'bot'
  browser: string
  os: string
}

export function parseUserAgent(ua = ''): Client {
  const u = ua.toLowerCase()
  const device = /bot|crawl|spider|slurp|headless/.test(u) ? 'bot' : /ipad|tablet/.test(u) ? 'tablet' : /mobi|iphone|android/.test(u) ? 'mobile' : 'desktop'
  const browser = /edg\//.test(u) ? 'Edge' : /opr\/|opera/.test(u) ? 'Opera' : /firefox|fxios/.test(u) ? 'Firefox' : /chrome|crios/.test(u) ? 'Chrome' : /safari/.test(u) ? 'Safari' : /curl|node|axios|undici/.test(u) ? 'Script' : 'Other'
  const os = /windows/.test(u) ? 'Windows' : /iphone|ipad|ios/.test(u) ? 'iOS' : /android/.test(u) ? 'Android' : /mac os|macintosh/.test(u) ? 'macOS' : /linux|x11/.test(u) ? 'Linux' : 'Other'
  return { device, browser, os }
}

/** "en-IN,en;q=0.9" -> "IN". Approximate by nature: a language region is not a location. */
export function regionFromLanguage(header = ''): string | undefined {
  const m = /^[a-z]{2,3}-([A-Za-z]{2})\b/.exec(header.trim())
  return m ? m[1].toUpperCase() : undefined
}
