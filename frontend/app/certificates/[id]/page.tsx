'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Award, Printer } from 'lucide-react'
import { certificateApi } from '../../../lib/api'
import { ErrorBox, Loading } from '../../../components/state'
import { Button } from '../../../components/ui/button'

/** Public page: anyone with the certificate code can verify it. */
export default function CertificatePage() {
  const { id } = useParams<{ id: string }>()
  const cert = useQuery({ queryKey: ['certificate', id], queryFn: () => certificateApi.get(id), retry: false })

  if (cert.isLoading) return <Loading />
  if (cert.isError) return <ErrorBox error={cert.error} />
  const c = cert.data!

  return (
    <div className="min-h-screen bg-muted/40 px-4 py-10 print:bg-white print:p-0">
      <div className="mx-auto mb-6 flex max-w-4xl items-center justify-between print:hidden">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">← Back to DevForge</Link>
        <Button onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print / save as PDF</Button>
      </div>

      <div className="mx-auto max-w-4xl border-8 border-double border-blue-800 bg-white p-12 text-center text-slate-900 shadow-lg print:shadow-none">
        <Award className="mx-auto h-14 w-14 text-yellow-600" />
        <p className="mt-4 text-sm uppercase tracking-[0.3em] text-slate-500">Certificate of completion</p>
        <p className="mt-10 text-slate-600">This certifies that</p>
        <h1 className="mt-2 font-serif text-5xl font-bold">{c.studentName}</h1>
        <p className="mt-8 text-slate-600">has successfully completed the course</p>
        <h2 className="mt-2 text-3xl font-semibold text-blue-900">{c.courseTitle}</h2>
        <div className="mt-14 flex items-end justify-between text-sm">
          <div className="text-left">
            <p className="font-semibold">{c.instructorName}</p>
            <p className="text-slate-500">Instructor</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">{new Date(c.issuedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-slate-500">Date issued</p>
          </div>
        </div>
        <p className="mt-10 break-all text-xs text-slate-400">Certificate ID: {c.id}</p>
      </div>
    </div>
  )
}
