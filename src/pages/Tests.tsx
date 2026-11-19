import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { ArrowRight, BookOpenText, Calculator, ClipboardList, Gauge, History, Trophy } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { FadeIn, PageHeader, Tile, fmtDuration } from '@/components/app/common'
import { hasStarted, setActive, useStore } from '@/lib/store'
import { startTest, TEST_KINDS, totalMinutes, totalQuestions } from '@/lib/tests'
import { cn } from '@/lib/utils'

const ICON: Record<string, typeof Gauge> = { diagnostic: Gauge, full: Trophy, rw: BookOpenText, math: Calculator }

export default function Tests() {
  const [params] = useSearchParams()
  const highlight = params.get('start')
  const tests = useStore((s) => s.tests)
  const active = useStore((s) => s.active)
  const started = hasStarted(active)
  const nav = useNavigate()
  const [pending, setPending] = useState<string | null>(null)

  const launch = (kind: string) => {
    setActive(null)
    startTest(kind)
    nav('/tests/run')
  }
  const begin = (kind: string) => (started ? setPending(kind) : launch(kind))

  return (
    <div>
      <PageHeader
        eyebrow="Timed tests"
        title="Practice like it’s test day."
        description="Timed, adaptive modules modeled on the Digital SAT. No feedback until the end, then a score estimate and every explanation."
      />

      {started && (
        <Card className="mb-6 flex-row flex-wrap items-center justify-between gap-4 border-warning/40 bg-warning/[0.08] px-6 py-5">
          <div className="flex items-center gap-3">
            <ClipboardList className="size-5 text-warning-ink" />
            <div>
              <p className="font-semibold">Unfinished: {active.title}</p>
              <p className="text-sm text-muted-foreground">
                Module {Math.min(active.current + 1, active.modules.length)} of {active.modules.length}
              </p>
            </div>
          </div>
          <Button className="rounded-full" onClick={() => nav('/tests/run')}>
            Resume <ArrowRight />
          </Button>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {TEST_KINDS.map((k, i) => {
          const Icon = ICON[k.kind] ?? Gauge
          const hl = highlight === k.kind
          return (
            <FadeIn key={k.kind} delay={i * 0.06}>
              <Tile className={cn('flex h-full flex-col p-6', hl && 'border-primary ring-1 ring-primary')}>
                <div className="flex items-start justify-between gap-3">
                  <span className={cn('grid size-11 place-items-center rounded-xl bg-primary/10 text-primary', hl && 'bg-primary text-primary-foreground')}>
                    <Icon className="size-5" />
                  </span>
                  <div className="flex gap-1.5">
                    <Badge variant="secondary" className="font-mono">
                      {totalQuestions(k)} q
                    </Badge>
                    <Badge variant="secondary" className="font-mono">
                      {totalMinutes(k)} min
                    </Badge>
                  </div>
                </div>
                <h2 className="mt-5 text-xl font-semibold">{k.title}</h2>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{k.blurb}</p>
                <ul className="mt-5 space-y-1.5 border-t pt-4 text-sm">
                  {k.modules.map((m, j) => (
                    <li key={j} className="flex justify-between gap-3 text-muted-foreground">
                      <span>{m.label}</span>
                      <span className="font-mono text-xs tabular-nums">
                        {m.count}q · {m.minutes}m
                      </span>
                    </li>
                  ))}
                </ul>
                <Button className="mt-5 self-start rounded-full" variant={hl ? 'default' : 'outline'} onClick={() => begin(k.kind)}>
                  Start <ArrowRight />
                </Button>
              </Tile>
            </FadeIn>
          )
        })}
      </div>

      <div className="mb-4 mt-12 flex items-center gap-2.5">
        <History className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">History</h2>
      </div>
      {tests.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <History />
            </EmptyMedia>
            <EmptyTitle>No tests yet</EmptyTitle>
            <EmptyDescription>Finished tests and their score estimates will show up here.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Test</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="hidden sm:table-cell">Time</TableHead>
                <TableHead className="text-right">RW</TableHead>
                <TableHead className="text-right">Math</TableHead>
                <TableHead className="pr-5 text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tests.map((t) => (
                <TableRow key={t.id} className="cursor-pointer" onClick={() => nav(`/tests/${t.id}`)}>
                  <TableCell className="pl-5 font-medium">
                    <Link to={`/tests/${t.id}`} onClick={(e) => e.stopPropagation()}>
                      {t.title}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">{new Date(t.ts).toLocaleDateString()}</TableCell>
                  <TableCell className="hidden font-mono text-muted-foreground sm:table-cell">{fmtDuration(t.durationMs)}</TableCell>
                  <TableCell className="text-right font-mono">{t.scores.rw ?? '–'}</TableCell>
                  <TableCell className="text-right font-mono">{t.scores.math ?? '–'}</TableCell>
                  <TableCell className="pr-5 text-right font-display text-xl">{(t.scores.rw ?? 0) + (t.scores.math ?? 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard your unfinished test?</AlertDialogTitle>
            <AlertDialogDescription>
              You still have “{active?.title}” in progress. Starting a new test deletes its answers. This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => pending && launch(pending)}>
              Discard &amp; start
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
