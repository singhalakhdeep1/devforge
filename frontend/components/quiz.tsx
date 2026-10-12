'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { apiErrorMessage, learnApi, type LessonView, type QuizResult } from '../lib/api'
import { cn } from '../lib/utils'
import { useToast } from './toast'
import { Button } from './ui/button'

interface Props {
  lesson: LessonView
  /** Called after a pass so the page can refresh progress / unlock the next lesson. */
  onPassed: (result: QuizResult) => void
}

export function Quiz({ lesson, onPassed }: Props) {
  const toast = useToast()
  const [answers, setAnswers] = useState<number[]>(() => lesson.questions.map(() => -1))
  const [result, setResult] = useState<QuizResult | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const allAnswered = answers.every((a) => a >= 0)

  const submit = async () => {
    setSubmitting(true)
    try {
      const r = await learnApi.submitQuiz(lesson.id, answers)
      setResult(r)
      if (r.passed) onPassed(r)
    } catch (e) {
      toast.error(apiErrorMessage(e, 'Could not submit the quiz'))
    } finally {
      setSubmitting(false)
    }
  }

  const retry = () => {
    setAnswers(lesson.questions.map(() => -1))
    setResult(null)
  }

  return (
    <div className="space-y-6">
      {lesson.lastAttempt && !result && (
        <p className="rounded-md bg-muted p-3 text-sm">
          Your last attempt: <strong>{lesson.lastAttempt.score}%</strong> {lesson.lastAttempt.passed ? '(passed)' : `(you need ${lesson.passPercent}% to pass)`}
        </p>
      )}

      {lesson.questions.map((q, qi) => {
        const review = result?.review[qi]
        return (
          <fieldset key={q.id} className="space-y-3 rounded-lg border p-4" disabled={Boolean(result)}>
            <legend className="px-1 font-medium">
              {qi + 1}. {q.question}
            </legend>
            <div className="space-y-2">
              {q.options.map((option, oi) => {
                const selected = answers[qi] === oi
                const isCorrect = review && oi === review.correctAnswer
                const isWrongPick = review && selected && !review.correct
                return (
                  <label
                    key={oi}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors',
                      !result && selected && 'border-blue-600 bg-blue-50 dark:bg-blue-950/40',
                      !result && !selected && 'hover:bg-accent',
                      isCorrect && 'border-green-600 bg-green-50 dark:bg-green-950/40',
                      isWrongPick && 'border-red-600 bg-red-50 dark:bg-red-950/40',
                      result && 'cursor-default'
                    )}
                  >
                    <input type="radio" name={`q-${q.id}`} checked={selected} onChange={() => setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)))} className="h-4 w-4" />
                    <span className="flex-1">{option}</span>
                    {isCorrect && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    {isWrongPick && <XCircle className="h-4 w-4 text-red-600" />}
                  </label>
                )
              })}
            </div>
            {review?.explanation && <p className="text-sm text-muted-foreground">{review.explanation}</p>}
          </fieldset>
        )
      })}

      {result ? (
        <div className={cn('rounded-lg border p-4', result.passed ? 'border-green-600 bg-green-50 dark:bg-green-950/30' : 'border-red-600 bg-red-50 dark:bg-red-950/30')}>
          <p className="text-lg font-semibold">
            {result.passed ? 'Passed' : 'Not passed yet'}: {result.score}% ({result.correctAnswers}/{result.totalQuestions} correct)
          </p>
          {!result.passed && <p className="mt-1 text-sm">You need {result.passPercent}% to pass. Review the answers above and try again.</p>}
          {!result.passed && (
            <Button className="mt-3" onClick={retry}>
              Try again
            </Button>
          )}
        </div>
      ) : (
        <Button onClick={submit} disabled={!allAnswered || submitting}>
          {submitting ? 'Checking…' : 'Submit answers'}
        </Button>
      )}
    </div>
  )
}
