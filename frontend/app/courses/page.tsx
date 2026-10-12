'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { courseApi, type Level } from '../../lib/api'
import { CourseCard } from '../../components/course-card'
import { Empty, ErrorBox, Loading } from '../../components/state'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'

type Sort = 'newest' | 'popular' | 'price_asc' | 'price_desc'

function useDebounced<T>(value: T, ms = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return debounced
}

export default function CoursesPage() {
  const [search, setSearch] = useState('')
  const initialCategory = useSearchParams().get('category') ?? 'All'
  const [category, setCategory] = useState(initialCategory)
  const [level, setLevel] = useState<Level | ''>('')
  const [sort, setSort] = useState<Sort>('newest')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounced(search)

  useEffect(() => setPage(1), [debouncedSearch, category, level, sort])

  const categories = useQuery({ queryKey: ['categories'], queryFn: courseApi.categories })
  const courses = useQuery({
    queryKey: ['courses', debouncedSearch, category, level, sort, page],
    queryFn: () => courseApi.list({ search: debouncedSearch || undefined, category, level, sort, page, pageSize: 12 }),
    placeholderData: (prev) => prev,
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">Browse courses</h1>
      <p className="mt-1 text-muted-foreground">Project-based lessons, quizzes and certificates.</p>

      <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courses…" className="pl-9" aria-label="Search courses" />
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category" className="md:w-44">
          <option value="All">All categories</option>
          {categories.data?.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name} ({c.count})
            </option>
          ))}
        </Select>
        <Select value={level} onChange={(e) => setLevel(e.target.value as Level | '')} aria-label="Level" className="md:w-40">
          <option value="">All levels</option>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort by" className="md:w-44">
          <option value="newest">Newest</option>
          <option value="popular">Most popular</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </Select>
      </div>

      <div className="mt-8">
        {courses.isLoading ? (
          <Loading />
        ) : courses.isError ? (
          <ErrorBox error={courses.error} onRetry={() => courses.refetch()} />
        ) : courses.data!.data.length === 0 ? (
          <Empty title="No courses match your filters">Try a different search or clear the filters.</Empty>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              {courses.data!.total} course{courses.data!.total === 1 ? '' : 's'}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {courses.data!.data.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
            {courses.data!.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {courses.data!.totalPages}
                </span>
                <Button variant="outline" disabled={page >= courses.data!.totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
