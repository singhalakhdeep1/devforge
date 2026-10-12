import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import { Navbar } from '../components/navbar'
import { Providers } from '../components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DevForge: learn to build software',
  description: 'Project-based developer courses with quizzes, certificates, a live code editor and a community.',
}

// Applies the saved theme before first paint to avoid a flash of the wrong theme
const themeScript = `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={inter.className}>
        <Providers>
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
          <Suspense fallback={null}>
            <main>{children}</main>
          </Suspense>
        </Providers>
      </body>
    </html>
  )
}
