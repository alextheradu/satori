import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { ArrowRight, Check, RotateCcw, SearchX, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Kbd } from '@/components/ui/kbd'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Count, DifficultyBadge, pct } from '@/components/app/common'
import { Momentum } from '@/components/app/Momentum'
import { BookmarkToggle, ElimToggle, Explanation, QuestionView } from '@/components/app/QuestionView'
import { BY_ID } from '@/data/bank'
import { isCorrect, SECTION_LABEL, type Answer } from '@/lib/grading'
import { buildSession, idsUrl, parsePracticeParams } from '@/lib/practice'
import { recordAttempt } from '@/lib/store'
import { cn } from '@/lib/utils'

interface Result {
  qid: string
  correct: boolean
}

export default function PracticeSession() {
  const [params, setParams] = useSearchParams()
  const nav = useNavigate()

  // Resolve filter params into a fixed list of ids once and pin it in the URL so a refresh keeps the same set.
  const idsParam = params.get('ids')
  useEffect(() => {
    if (!idsParam) setParams({ ids: buildSession(parsePracticeParams(params)).join(',') }, { replace: true })
  }, [idsParam]) // eslint-disable-line react-hooks/exhaustive-deps

  const ids = useMemo(() => (idsParam ? idsParam.split(',').filter((id) => BY_ID.has(id)) : []), [idsParam])

  const [i, setI] = useState(0)
  const [answer, setAnswer] = useState<Answer>(null)
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState<Result[]>([])
  const [elim, setElim] = useState<number[]>([])
  const [elimMode, setElimMode] = useState(false)
  const started = useRef(Date.now())

  const q = ids[i] ? BY_ID.get(ids[i]) : undefined
  const done = idsParam !== null && ids.length > 0 && i >= ids.length

  useEffect(() => {
    setI(0)
    setResults([])
  }, [idsParam])

  useEffect(() => {
    started.current = Date.now()
    setAnswer(null)
    setSubmitted(false)
    setElim([])
  }, [i, idsParam])

  const submit = () => {
    if (!q || submitted) return
    const correct = isCorrect(q, answer)
    recordAttempt({ qid: q.id, correct, answer, ts: Date.now(), ms: Date.now() - started.current, mode: 'practice' })
    setResults((r) => [...r, { qid: q.id, correct }])
    setSubmitted(true)
    const streak = [...results, { correct }].reverse().findIndex((r) => !r.correct)
    const run = streak === -1 ? results.length + 1 : streak
    if (correct && run >= 3) toast.success(`${run} in a row!`, { duration: 1500 })
  }
  const next = () => setI((n) => n + 1)

  // Keyboard: A–D choose, Enter check / next
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!q || e.metaKey || e.ctrlKey || e.altKey) return
      const tag = (e.target as HTMLElement)?.tagName
      if (e.key === 'Enter') {
        if (tag === 'BUTTON') return
        e.preventDefault()
        if (submitted) next()
        else if (answer !== null) submit()
        return
      }
      if (tag === 'INPUT' || submitted || !q.choices) return
      const idx = 'abcd'.indexOf(e.key.toLowerCase())
      if (idx >= 0) setAnswer(idx)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!idsParam) return null
  if (!ids.length)
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchX />
          </EmptyMedia>
          <EmptyTitle>No questions match</EmptyTitle>
          <EmptyDescription>Try loosening your filters.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild variant="outline">
            <Link to="/practice">Change filters</Link>
          </Button>
        </EmptyContent>
      </Empty>
    )

  if (done) {
    const correct = results.filter((r) => r.correct).length
    const missed = results.filter((r) => !r.correct).map((r) => r.qid)
    const acc = results.length ? correct / results.length : 0
    return (
      <div className="mx-auto max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 ease-(--ease-out-quint)">
        <Card className="items-center rounded-3xl py-10 text-center">
          <CardContent className="flex flex-col items-center">
            <Badge variant="secondary">Session complete</Badge>
            <div className="mt-5 font-display text-8xl leading-none tracking-[-0.02em] tabular-nums">
              <Count to={correct} duration={0.8} />
              <span className="text-muted-foreground">/{results.length}</span>
            </div>
            <p className="mt-3 text-muted-foreground">
              {pct(acc)} correct · {acc >= 0.8 ? 'Excellent work.' : acc >= 0.5 ? 'Solid. Review the misses below.' : 'Every miss is a lesson. Retry them now.'}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {missed.length > 0 && (
                <Button className="rounded-full" onClick={() => nav(idsUrl(missed))}>
                  <RotateCcw /> Retry {missed.length} missed
                </Button>
              )}
              <Button variant="outline" className="rounded-full" onClick={() => nav('/practice')}>
                New session
              </Button>
              <Button variant="ghost" className="rounded-full" onClick={() => nav('/')}>
                Home
              </Button>
            </div>
          </CardContent>
        </Card>
        <Momentum compact className="mt-5 animate-in fade-in slide-in-from-bottom-1 fill-mode-backwards delay-300 duration-300" />
        <Card className="mt-5 gap-0 py-2">
          {results.map((r, n) => {
            const rq = BY_ID.get(r.qid)!
            return (
              <div key={n} className="flex items-center gap-3 border-b px-5 py-3 text-sm last:border-0">
                <span className={cn('grid size-6 place-items-center rounded-full', r.correct ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive')}>
                  {r.correct ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                </span>
                <span className="flex-1">{rq.skill}</span>
                <DifficultyBadge d={rq.difficulty} />
              </div>
            )
          })}
        </Card>
      </div>
    )
  }

  if (!q) return null
  const correctSoFar = results.filter((r) => r.correct).length

  return (
    <div className="pb-24 sm:pb-0">
      <div className="mb-6 flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/practice">
            <X /> Exit
          </Link>
        </Button>
        <Progress value={((i + (submitted ? 1 : 0)) / ids.length) * 100} className="h-2 flex-1" />
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          {i + 1}/{ids.length}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <Badge variant="outline">{SECTION_LABEL[q.section]}</Badge>
        <span className="text-muted-foreground">{q.domain}</span>
        <DifficultyBadge d={q.difficulty} />
        {results.length > 0 && (
          <span className="ml-auto font-mono text-xs text-muted-foreground">
            {correctSoFar}/{results.length} correct
          </span>
        )}
      </div>

      <Card key={q.id} className="animate-in fade-in slide-in-from-bottom-1 rounded-2xl duration-200 ease-(--ease-out-quint)">
        <CardContent className="sm:px-8 sm:py-2">
          <QuestionView
            q={q}
            answer={answer}
            onAnswer={setAnswer}
            reveal={submitted}
            eliminated={elim}
            elimMode={elimMode}
            onEliminate={(n) => setElim((e) => (e.includes(n) ? e.filter((x) => x !== n) : [...e, n]))}
            toolbar={
              <>
                {q.choices && <ElimToggle on={elimMode} onChange={() => setElimMode((m) => !m)} />}
                <BookmarkToggle qid={q.id} />
              </>
            }
          />
          {submitted && <Explanation q={q} answer={answer} />}
        </CardContent>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t chrome-translucent bg-background/85 px-4 py-3 backdrop-blur-xl sm:static sm:mt-6 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <p className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
            <Kbd>A</Kbd>–<Kbd>D</Kbd> choose <span className="mx-1">·</span> <Kbd>Enter</Kbd> {submitted ? 'next' : 'check'}
          </p>
          <div className="ml-auto flex gap-2">
            {!submitted && (
              <Button variant="ghost" onClick={submit}>
                Skip
              </Button>
            )}
            {submitted ? (
              <Button size="lg" className="rounded-full px-6" onClick={next}>
                {i + 1 === ids.length ? 'See results' : 'Next question'} <ArrowRight />
              </Button>
            ) : (
              <Button size="lg" className="rounded-full px-6" onClick={submit} disabled={answer === null}>
                Check answer
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
