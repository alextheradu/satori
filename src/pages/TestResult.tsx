import { Link, useParams } from 'react-router'
import { ArrowLeft, Check, Clock, RotateCcw, SearchX, TrendingDown, TrendingUp, X } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Count, DifficultyBadge, FadeIn, MasteryBar, fmtDuration, pct } from '@/components/app/common'
import { BookmarkToggle, Explanation, QuestionView } from '@/components/app/QuestionView'
import { BY_ID, DOMAINS } from '@/data/bank'
import type { Section } from '@/data/types'
import { correctLabel, formatAnswer, isCorrect, SECTION_LABEL } from '@/lib/grading'
import { idsUrl } from '@/lib/practice'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export default function TestResult() {
  const { id } = useParams()
  const tests = useStore((s) => s.tests)
  const idx = tests.findIndex((t) => t.id === id)
  const rec = idx >= 0 ? tests[idx] : undefined
  const prev = rec ? tests.slice(idx + 1).find((t) => t.kind === rec.kind) : undefined

  if (!rec)
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchX />
          </EmptyMedia>
          <EmptyTitle>Test not found</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild variant="outline">
            <Link to="/tests">Back to tests</Link>
          </Button>
        </EmptyContent>
      </Empty>
    )

  const items = rec.modules.flatMap((m) =>
    m.qids.map((qid) => {
      const q = BY_ID.get(qid)!
      const a = m.answers[qid] ?? null
      return { q, a, correct: isCorrect(q, a) }
    }),
  )
  const sections = (['rw', 'math'] as Section[]).filter((s) => rec.modules.some((m) => m.section === s))
  const total = (rec.scores.rw ?? 0) + (rec.scores.math ?? 0)
  const correct = items.filter((i) => i.correct).length
  const missedIds = items.filter((i) => !i.correct).map((i) => i.q.id)

  return (
    <div className="flex flex-col gap-8">
      <Button asChild variant="ghost" size="sm" className="self-start">
        <Link to="/tests">
          <ArrowLeft /> All tests
        </Link>
      </Button>

      {/* Score hero */}
      <section className="rounded-3xl border bg-card px-6 py-10 text-center sm:py-14">
        <Badge variant="outline">
          {rec.title} · {new Date(rec.ts).toLocaleDateString(undefined, { dateStyle: 'medium' })}
        </Badge>
        <div className="mt-5 font-display text-8xl leading-none tracking-[-0.02em] tabular-nums sm:text-9xl">
          <Count to={total} from={sections.length * 200} duration={1.1} />
        </div>
        {prev && <Delta now={total} before={(prev.scores.rw ?? 0) + (prev.scores.math ?? 0)} />}
        <p className="mt-3 text-muted-foreground">
          Estimated {sections.length === 2 ? 'total' : `${SECTION_LABEL[sections[0]]}`} score · {correct}/{items.length} correct ({pct(correct / Math.max(1, items.length))})
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" /> {fmtDuration(rec.durationMs)} on the clock
          </span>
          {missedIds.length > 0 && (
            <Button asChild className="rounded-full">
              <Link to={idsUrl(missedIds)}>
                <RotateCcw /> Practice {missedIds.length} missed
              </Link>
            </Button>
          )}
        </div>
        <p className="mx-auto mt-6 max-w-md text-xs text-muted-foreground">
          Estimated from difficulty-weighted accuracy and your Module 2 route. Not an official College Board score.
        </p>
      </section>

      {/* Section breakdowns */}
      <div className={cn('grid gap-5', sections.length === 2 && 'lg:grid-cols-2')}>
        {sections.map((s, i) => {
          const list = items.filter((x) => x.q.section === s)
          const c = list.filter((x) => x.correct).length
          const route = rec.modules.find((m) => m.section === s && m.route)?.route
          return (
            <FadeIn key={s} delay={i * 0.08}>
              <Card className="h-full">
                <CardHeader>
                  <CardDescription>{SECTION_LABEL[s]}</CardDescription>
                  <CardTitle className="font-display text-5xl font-normal tabular-nums">{rec.scores[s]}</CardTitle>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="secondary" className="font-mono">
                      {c}/{list.length} correct
                    </Badge>
                    {route && (
                      <Badge variant="secondary" className={route === 'harder' ? 'bg-success/12 text-success' : ''}>
                        Module 2: {route} route
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  {DOMAINS[s].map((d) => {
                    const dl = list.filter((x) => x.q.domain === d)
                    if (!dl.length) return null
                    return <MasteryBar key={d} label={d} correct={dl.filter((x) => x.correct).length} total={dl.length} />
                  })}
                </CardContent>
              </Card>
            </FadeIn>
          )
        })}
      </div>

      {/* Question review */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">Question review</h2>
        <div className="flex flex-col gap-6">
          {rec.modules.map((m) => (
            <div key={m.label}>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{m.label}</p>
              <Card className="py-0">
                <Accordion type="single" collapsible>
                  {m.qids.map((qid, n) => {
                    const q = BY_ID.get(qid)!
                    const a = m.answers[qid] ?? null
                    const ok = isCorrect(q, a)
                    return (
                      <AccordionItem key={qid} value={qid} className="px-4 sm:px-5">
                        <AccordionTrigger className="items-center gap-3 hover:no-underline">
                          <span className="flex min-w-0 flex-1 items-center gap-3">
                            <span className="w-5 shrink-0 text-right font-mono text-xs text-muted-foreground">{n + 1}</span>
                            <span className={cn('grid size-6 shrink-0 place-items-center rounded-full', ok ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive')}>
                              {ok ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                            </span>
                            <span className="truncate font-normal">{q.skill}</span>
                          </span>
                          <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
                            {formatAnswer(q, a)} → {correctLabel(q)}
                          </span>
                          <DifficultyBadge d={q.difficulty} />
                        </AccordionTrigger>
                        <AccordionContent className="pb-6 pt-2">
                          <div className="rounded-xl border bg-background p-4 sm:p-6">
                            <QuestionView q={q} answer={a} onAnswer={() => {}} reveal toolbar={<BookmarkToggle qid={q.id} />} />
                            <Explanation q={q} answer={a} />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )
                  })}
                </Accordion>
              </Card>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function Delta({ now, before }: { now: number; before: number }) {
  const d = now - before
  if (d === 0) return <p className="mt-3 text-sm text-muted-foreground">Same as your last attempt ({before}).</p>
  const up = d > 0
  return (
    <p
      className={cn(
        'mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium animate-in fade-in fill-mode-backwards delay-700 duration-300',
        up ? 'bg-success/12 text-success' : 'bg-muted text-muted-foreground',
      )}
    >
      {up ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
      {up ? '+' : '−'}
      {Math.abs(d)} vs. your last attempt ({before})
    </p>
  )
}
