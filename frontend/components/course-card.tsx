import Link from 'next/link'
import { Clock, Star, Users } from 'lucide-react'
import type { CourseSummary } from '../lib/api/types'
import { formatDuration, formatPrice } from '../lib/utils'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'

const levelLabel = { BEGINNER: 'Beginner', INTERMEDIATE: 'Intermediate', ADVANCED: 'Advanced' } as const

export function CourseCard({ course }: { course: CourseSummary }) {
  return (
    <Link href={`/courses/${course.id}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden transition-shadow group-hover:shadow-md">
        <div className="flex h-28 items-end bg-gradient-to-br from-blue-600 to-indigo-700 p-4">
          <Badge className="bg-white/90 text-slate-900">{course.category}</Badge>
        </div>
        <CardContent className="flex flex-1 flex-col gap-3 p-4">
          <div>
            <h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-blue-600">{course.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">by {course.instructor.name}</p>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              {course.ratingCount ? `${course.rating.toFixed(1)} (${course.ratingCount})` : 'New'}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {course.students}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(course.totalMinutes)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-xs font-medium text-muted-foreground">{levelLabel[course.level]}</span>
            <span className="font-bold">{formatPrice(course.price)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
