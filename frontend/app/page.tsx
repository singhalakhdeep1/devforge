'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Award, Code2, MessageSquare, Users } from 'lucide-react'
import { courseApi } from '../lib/api'
import { useAuthStore } from '../lib/store/authStore'
import { CourseCard } from '../components/course-card'
import { Button, ButtonLink } from '../components/ui/button'

const features = [
  { icon: Code2, title: 'Learn by doing', text: 'Short lessons, runnable examples and an in-browser code editor with live pair-programming.' },
  { icon: Award, title: 'Prove your skills', text: 'Pass the quizzes, finish the course and get a certificate anyone can verify with its code.' },
  { icon: MessageSquare, title: 'Never stuck', text: 'Ask questions on any lesson. Get answers from instructors and other learners.' },
  { icon: Users, title: 'Teach your own', text: 'Build and publish courses with a studio that tracks students, completion and earnings.' },
]

export default function HomePage() {
  const user = useAuthStore((s) => s.user)
  const popular = useQuery({ queryKey: ['courses', 'popular-home'], queryFn: () => courseApi.list({ sort: 'popular', pageSize: 4 }) })
  const categories = useQuery({ queryKey: ['categories'], queryFn: courseApi.categories })

  return (
    <div>
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white">
        <div className="mx-auto max-w-4xl px-4 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">Learn to build software, one project at a time</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-200">
            Practical developer courses with quizzes, certificates, a live code editor and a community that answers your questions.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/courses" size="lg" className="bg-white text-slate-900 hover:bg-white/90">Browse courses</ButtonLink>
            {!user && <ButtonLink href="/signup" size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">Create a free account</ButtonLink>}
            {user && <ButtonLink href="/dashboard" size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">Go to my learning</ButtonLink>}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title}>
              <Icon className="h-8 w-8 text-blue-600" />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {!!popular.data?.data.length && (
        <section className="mx-auto max-w-7xl px-4 pb-16">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold">Popular courses</h2>
            <Link href="/courses" className="text-sm text-blue-600 hover:underline">See all</Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {popular.data.data.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        </section>
      )}

      {!!categories.data?.length && (
        <section className="mx-auto max-w-7xl px-4 pb-20">
          <h2 className="mb-4 text-2xl font-bold">Browse by topic</h2>
          <div className="flex flex-wrap gap-3">
            {categories.data.map((c) => (
              <Link key={c.name} href={`/courses?category=${encodeURIComponent(c.name)}`} className="rounded-full border px-4 py-2 text-sm hover:bg-accent">
                {c.name} <span className="text-muted-foreground">({c.count})</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
