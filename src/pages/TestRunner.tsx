import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { ArrowRight, Calculator, ChevronDown, ChevronUp, Clock, Coffee, EllipsisVertical, Highlighter, StickyNote, Timer, X } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { fmtDuration } from '@/components/app/common'
import { BBQuestion } from '@/components/bluebook/BBQuestion'
import { BBCalculator } from '@/components/bluebook/BBCalculator'
import { BB_DIRECTIONS, BBGrid, BBLegend, BBOutline, BBPrimary, BBReference } from '@/components/bluebook/BBChrome'
import { BY_ID } from '@/data/bank'
import type { Answer } from '@/lib/grading'
import { getState, hasStarted, setActive, updateActive, useStore, type ActiveModule } from '@/lib/store'
import { finishTest, prepareModule } from '@/lib/tests'
import { cn } from '@/lib/utils'

/** Id of the test that was just submitted, so the redirect lands on its results. */
let justFinished: string | null = null

export default function TestRunner() {
  const active = useStore((s) => s.active)
  const nav = useNavigate()

  if (!active) return <Navigate to={justFinished ? `/tests/${justFinished}` : '/tests'} replace />
  const mod = active.modules[active.current]
  if (!mod) return null

  if (!mod.startedAt) {
    const prev = active.modules[active.current - 1]
    return (
      <Interstitial
        testTitle={active.title}
        step={active.current + 1}
        steps={active.modules.length}
        mod={mod}
        breakNote={!!prev && prev.section !== mod.section}
        onStart={() =>
          updateActive((t) => ({ ...t, cursor: 0, modules: t.modules.map((m, i) => (i === t.current ? prepareModule(t, i) : m)) }))
        }
        onExit={() => {
          if (!hasStarted(active)) setActive(null)
          nav('/tests')
        }}
      />
    )
  }

  return <Runner key={active.current} />
}

function Interstitial({
  testTitle,
  step,
  steps,
  mod,
  breakNote,
  onStart,
  onExit,
}: {
  testTitle: string
  step: number
  steps: number
  mod: ActiveModule
  breakNote: boolean
  onStart: () => void
  onExit: () => void
}) {
  const rules = [
    'The timer starts when you press Start. Pause exists, but skip it for realistic practice.',
    'Move freely between questions and flag any to revisit before you submit.',
    'When time runs out, the module submits automatically.',
    ...(mod.stage === 2 ? ['This module adapts to how you did on Module 1.'] : []),
    ...(mod.section === 'math' ? ['A calculator is allowed on every question. The reference sheet is in the top bar.'] : []),
  ]
  return (
    <div className="bg-grid grid min-h-dvh place-items-center px-4 py-10">
      <Card className="w-full max-w-lg animate-in fade-in zoom-in-95 rounded-3xl duration-300">
        <CardHeader>
          {breakNote && (
            <div className="mb-3 flex items-start gap-3 rounded-xl bg-success/10 p-4 text-sm text-success">
              <Coffee className="mt-0.5 size-4 shrink-0" />
              <span>Nice work. On test day you’d get a 10-minute break here. Stretch, drink water, then continue.</span>
            </div>
          )}
          <CardDescription>
            {testTitle} · Part {step} of {steps}
          </CardDescription>
          <CardTitle className="font-display text-4xl font-normal">{mod.label}</CardTitle>
          <div className="mt-2 flex gap-2">
            <Badge variant="secondary" className="font-mono">
              {mod.count} questions
            </Badge>
            <Badge variant="secondary" className="font-mono">
              <Timer /> {mod.minutes} min
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {rules.map((r) => (
              <li key={r} className="flex gap-2.5">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                {r}
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="gap-2">
          <Button size="lg" className="rounded-full px-6" onClick={onStart}>
            Start module <ArrowRight />
          </Button>
          <Button size="lg" variant="ghost" className="rounded-full" onClick={onExit}>
            Not now
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

const SECTION_NAME = { rw: 'Reading and Writing', math: 'Math' } as const

/** Bluebook is light-only; drop the app's dark class while the runner is on screen. */
function useForceLight() {
  useEffect(() => {
    const el = document.documentElement
    const wasDark = el.classList.contains('dark')
    const prev = el.style.colorScheme
    el.classList.remove('dark')
    el.style.colorScheme = 'light'
    return () => {
      if (wasDark) el.classList.add('dark')
      el.style.colorScheme = prev
    }
  }, [])
}

function Runner() {
  const active = useStore((s) => s.active)!
  const userName = useStore((s) => s.user?.name)
  const nav = useNavigate()
  const mod = active.modules[active.current]
  const cursor = active.cursor
  const reviewing = cursor >= mod.qids.length
  const qid = mod.qids[cursor]
  const q = qid ? BY_ID.get(qid) : undefined

  const [now, setNow] = useState(Date.now())
  const [hideTimer, setHideTimer] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [dirOpen, setDirOpen] = useState(false)
  const [refOpen, setRefOpen] = useState(false)
  const [calcOpen, setCalcOpen] = useState(false)
  const [calcW, setCalcW] = useState(() => Math.round(Math.min(560, Math.max(380, window.innerWidth * 0.3))))
  const [elimMode, setElimMode] = useState(false)
  const lastSwitch = useRef(Date.now())
  const finishing = useRef(false)
  useForceLight()

  const paused = !mod.deadline
  const remaining = paused ? (mod.remainingMs ?? 0) : mod.deadline! - now

  const sections = [...new Set(active.modules.map((m) => m.section))]
  const title = `Section ${sections.indexOf(mod.section) + 1}, Module ${mod.stage}: ${SECTION_NAME[mod.section]}`

  const patchMod = (fn: (m: ActiveModule) => ActiveModule) =>
    updateActive((t) => ({ ...t, modules: t.modules.map((m, i) => (i === t.current ? fn(m) : m)) }))

  /** Credit the time spent on the current question. */
  const logTime = () => {
    const t = Date.now()
    const spent = t - lastSwitch.current
    lastSwitch.current = t
    if (qid && !paused) patchMod((m) => ({ ...m, time: { ...m.time, [qid]: (m.time?.[qid] ?? 0) + spent } }))
  }

  const go = (c: number) => {
    logTime()
    setNavOpen(false)
    updateActive((t) => ({ ...t, cursor: c }))
  }

  const submitModule = () => {
    if (finishing.current) return
    finishing.current = true
    logTime()
    updateActive((t) => ({
      ...t,
      cursor: 0,
      current: t.current + 1,
      modules: t.modules.map((m, i) => (i === t.current ? { ...m, finishedAt: Date.now() } : m)),
    }))
    const t = getState().active
    if (t && t.current >= t.modules.length) {
      justFinished = t.id
      finishTest(t)
    }
  }

  useEffect(() => {
    justFinished = null
    const id = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!paused && remaining <= 0) submitModule()
  }, [remaining, paused]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onHide = () => document.visibilityState === 'hidden' && logTime()
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  })

  const setAnswer = (a: Answer) => qid && patchMod((m) => ({ ...m, answers: { ...m.answers, [qid]: a } }))
  const toggleMark = () =>
    qid && patchMod((m) => ({ ...m, marked: m.marked.includes(qid) ? m.marked.filter((x) => x !== qid) : [...m.marked, qid] }))
  const toggleElim = (n: number) =>
    qid &&
    patchMod((m) => {
      const cur = m.eliminated[qid] ?? []
      return { ...m, eliminated: { ...m.eliminated, [qid]: cur.includes(n) ? cur.filter((x) => x !== n) : [...cur, n] } }
    })

  const pause = () => {
    logTime()
    patchMod((m) => ({ ...m, remainingMs: Math.max(0, (m.deadline ?? 0) - Date.now()), deadline: undefined }))
  }
  const resume = () => {
    lastSwitch.current = Date.now()
    patchMod((m) => ({ ...m, deadline: Date.now() + (m.remainingMs ?? 0), remainingMs: undefined }))
  }

  const answered = (id: string) => {
    const a = mod.answers[id]
    return a !== undefined && a !== null && a !== ''
  }
  const lowTime = remaining < 5 * 60_000
  const showTimer = !hideTimer || lowTime

  const grid = (cur: number) => (
    <BBGrid
      count={mod.qids.length}
      cursor={cur}
      isAnswered={(i) => answered(mod.qids[i])}
      isMarked={(i) => mod.marked.includes(mod.qids[i])}
      onGo={go}
    />
  )

  return (
    <div className="bb flex h-dvh flex-col overflow-hidden" style={{ paddingLeft: calcOpen ? calcW : 0 }}>
      {mod.section === 'math' && <BBCalculator open={calcOpen} width={calcW} onWidth={setCalcW} onClose={() => setCalcOpen(false)} />}
      {refOpen && <BBReference onClose={() => setRefOpen(false)} />}

      {/* Header */}
      <header className="relative z-20 shrink-0 bg-[var(--bb-chrome)]">
        <div className="grid h-[4.875rem] grid-cols-[1fr_auto_1fr] items-center gap-4 px-[2.375rem]">
          <div className="min-w-0">
            <h1 className="truncate text-[1.25rem] leading-tight">{title}</h1>
            <Popover open={dirOpen} onOpenChange={setDirOpen}>
              <PopoverTrigger asChild>
                <button type="button" className="mt-1.5 flex items-center gap-1.5 text-[1rem] font-medium">
                  Directions <ChevronDown className={cn('size-5 transition-transform', dirOpen && 'rotate-180')} strokeWidth={1.75} />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                sideOffset={14}
                className="bb w-[min(880px,calc(100vw-48px))] gap-0 rounded-[0.5rem] p-0 text-[1rem] shadow-[0_6px_28px_rgba(0,0,0,0.28)] ring-0"
              >
                <div className="bb-scroll max-h-[60dvh] space-y-4 overflow-y-auto px-8 pt-7 pb-2 leading-[1.6]">{BB_DIRECTIONS[mod.section]}</div>
                <div className="flex justify-end px-8 pt-3 pb-6">
                  <button
                    type="button"
                    onClick={() => setDirOpen(false)}
                    className="h-10 rounded-full bg-[#fedb00] px-6 text-base font-bold text-[var(--bb-ink)] hover:bg-[#f2cf00]"
                  >
                    Close
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col items-center">
            {showTimer ? (
              <span className={cn('text-[1.375rem] leading-none font-bold tabular-nums', lowTime && 'text-[var(--bb-red)]')}>
                {fmtDuration(remaining)}
              </span>
            ) : (
              <Clock className="size-[1.375rem]" strokeWidth={2} aria-label="Timer hidden" />
            )}
            {!lowTime && (
              <button
                type="button"
                onClick={() => setHideTimer((h) => !h)}
                className="mt-2 h-[1.375rem] rounded-full border-[1.5px] border-[var(--bb-ink)] px-3 text-[0.875rem] leading-none font-bold hover:bg-white"
              >
                {hideTimer ? 'Show' : 'Hide'}
              </button>
            )}
          </div>

          <div className="flex items-end justify-end gap-5">
            {mod.section === 'math' ? (
              <>
                <Tool label="Calculator" active={calcOpen} onClick={() => setCalcOpen((o) => !o)}>
                  <Calculator className="size-[1.375rem]" strokeWidth={1.5} />
                </Tool>
                <Tool label="Reference" active={refOpen} onClick={() => setRefOpen((o) => !o)}>
                  <span className="bb-serif text-[1.375rem] leading-none font-bold italic">
                    x<sup className="text-[0.625rem]">2</sup>
                  </span>
                </Tool>
              </>
            ) : (
              <Tool label="Highlights & Notes" onClick={() => toast('Highlights & Notes isn’t available in practice tests yet.')}>
                <span className="flex items-center gap-1">
                  <Highlighter className="size-[1.1875rem]" strokeWidth={1.5} />
                  <StickyNote className="size-[1.1875rem]" strokeWidth={1.5} />
                </span>
              </Tool>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="flex flex-col items-center gap-1.5 text-[0.9375rem] font-medium">
                  <EllipsisVertical className="size-[1.5rem]" strokeWidth={2.5} />
                  More
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={10} className="bb w-56 rounded-[0.5rem] p-1 text-[0.9375rem] shadow-[0_6px_28px_rgba(0,0,0,0.22)] ring-0">
                <DropdownMenuItem className="px-3 py-2.5 text-[0.9375rem]" onSelect={paused ? resume : pause}>
                  {paused ? 'Resume Testing' : 'Unscheduled Break'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="px-3 py-2.5 text-[0.9375rem]"
                  onSelect={() => {
                    if (!paused) pause()
                    nav('/tests')
                  }}
                >
                  Save and Exit
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="bb-dash-thick" />
      </header>

      <div className="relative z-10 shrink-0 px-[2.375rem]">
        <div className="-mt-[3px] grid h-[2.0625rem] place-items-center rounded-b-[1rem] bg-[var(--bb-navy)] text-[0.875rem] font-bold tracking-[0.01em] text-white uppercase">
          This is a practice test
        </div>
      </div>

      {/* Body */}
      <main className="min-h-0 flex-1">
        {paused ? (
          <div className="grid h-full place-items-center px-6 text-center">
            <div>
              <h2 className="text-[1.875rem]">Unscheduled Break</h2>
              <p className="mt-3 text-[1.0625rem]">Your timer is paused. On test day, the clock keeps running during an unscheduled break.</p>
              <p className="mt-6 text-[0.9375rem]">Remaining time in this module</p>
              <p className="text-[2.75rem] font-bold tabular-nums">{fmtDuration(remaining)}</p>
              <BBPrimary className="mt-6 px-7" onClick={resume}>
                Resume Testing
              </BBPrimary>
            </div>
          </div>
        ) : reviewing ? (
          <div className="bb-scroll h-full overflow-y-auto px-6 pt-12 pb-16">
            <div className="mx-auto max-w-[56.25rem] text-center">
              <h2 className="text-[2rem]">Check Your Work</h2>
              <p className="mt-4 text-[1.0625rem]">On test day, you won’t be able to move on to the next module until time expires.</p>
              <p className="mt-1 text-[1.0625rem]">
                For these practice questions, you can click <b>Next</b> when you’re ready to move on to the next module.
              </p>
              <div className="mt-10 rounded-[0.5rem] bg-white px-10 pt-7 pb-10 text-left shadow-[0_2px_16px_rgba(0,0,0,0.18)]">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#c4c4c4] pb-5">
                  <h3 className="text-[1.125rem] font-bold">{title} Questions</h3>
                  <BBLegend current={false} />
                </div>
                <div className="pt-4">{grid(-1)}</div>
              </div>
            </div>
          </div>
        ) : q ? (
          <BBQuestion
            key={qid}
            q={q}
            number={cursor + 1}
            answer={mod.answers[qid] ?? null}
            onAnswer={setAnswer}
            eliminated={mod.eliminated[qid] ?? []}
            onEliminate={toggleElim}
            elimMode={elimMode}
            onToggleElim={() => setElimMode((m) => !m)}
            marked={mod.marked.includes(qid)}
            onToggleMark={toggleMark}
          />
        ) : null}
      </main>

      {/* Footer */}
      <footer className="relative z-20 shrink-0 bg-[var(--bb-chrome)]">
        <div className="bb-dash-thick" />
        <div className="grid h-[4.25rem] grid-cols-[1fr_auto_1fr] items-center gap-4 px-10">
          <span className="truncate text-[1.25rem] font-medium">{userName || 'Student'}</span>
          {!paused && !reviewing ? (
            <Popover open={navOpen} onOpenChange={setNavOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex h-[2.375rem] items-center gap-2 rounded-[0.375rem] bg-[var(--bb-ink)] px-4 text-[1.0625rem] font-bold text-white hover:bg-black"
                >
                  Question {cursor + 1} of {mod.qids.length}
                  <ChevronUp className={cn('size-5 transition-transform', navOpen && 'rotate-180')} strokeWidth={2.5} />
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                sideOffset={18}
                className="bb w-[min(640px,calc(100vw-32px))] gap-0 overflow-visible rounded-[0.5rem] p-0 shadow-[0_4px_28px_rgba(0,0,0,0.3)] ring-0"
              >
                <div className="relative px-6 pt-5 pb-4 text-center">
                  <h3 className="text-[1.0625rem] font-bold">{title} Questions</h3>
                  <button type="button" onClick={() => setNavOpen(false)} aria-label="Close" className="absolute top-4 right-4 grid size-8 place-items-center">
                    <X className="size-6" strokeWidth={1.75} />
                  </button>
                </div>
                <div className="mx-6 border-t border-[#c4c4c4]" />
                <div className="py-4">
                  <BBLegend />
                </div>
                <div className="mx-6 border-t border-[#c4c4c4]" />
                <div className="bb-scroll max-h-[45dvh] overflow-y-auto px-8 pt-4 pb-2">{grid(cursor)}</div>
                <div className="flex justify-center pt-5 pb-6">
                  <BBOutline onClick={() => go(mod.qids.length)}>Go to Review Page</BBOutline>
                </div>
                <span className="absolute -bottom-[0.5625rem] left-1/2 size-[1.125rem] -translate-x-1/2 rotate-45 bg-white shadow-[4px_4px_6px_rgba(0,0,0,0.08)]" />
              </PopoverContent>
            </Popover>
          ) : (
            <span />
          )}
          <div className="flex justify-end gap-3">
            {!paused && (
              <>
                {cursor > 0 && <BBPrimary onClick={() => go(cursor - 1)}>Back</BBPrimary>}
                <BBPrimary onClick={() => (reviewing ? submitModule() : go(cursor + 1))}>Next</BBPrimary>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}

function Tool({ label, active, onClick, children }: { label: string; active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className="group relative flex flex-col items-center gap-1.5 text-[0.9375rem] font-medium">
      <span className="grid h-6 place-items-center">{children}</span>
      {label}
      <span className={cn('absolute -bottom-[0.4375rem] h-[3px] w-full rounded-full bg-[var(--bb-ink)]', active ? 'block' : 'hidden')} />
    </button>
  )
}
