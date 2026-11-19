import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { BarChart3, BookOpenText, Brain, Calculator, Cloud, RotateCcw, Timer } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FadeIn, Logo } from '@/components/app/common'
import { ThemeMenu } from '@/components/app/AppShell'
import { AuroraBg } from '@/components/app/AuroraBg'
import { Explanation, QuestionView } from '@/components/app/QuestionView'
import { BY_ID, QUESTIONS } from '@/data/bank'
import type { Answer } from '@/lib/grading'
import { signIn } from '@/lib/store'
import { cn } from '@/lib/utils'

const FEATURES = [
  { icon: Timer, title: 'Adaptive timed tests', text: 'Modules timed like test day. How you do on Module 1 decides how hard Module 2 is.' },
  { icon: Brain, title: 'Smart practice', text: 'Missed questions come back first, then ones you haven’t seen, so practice targets your gaps.' },
  { icon: BarChart3, title: 'Score estimates', text: 'Section scores, domain-by-domain mastery, and the skills to drill next.' },
  { icon: BookOpenText, title: 'Every RW skill', text: 'Words in context, evidence, inferences, transitions, boundaries and more.' },
  { icon: Calculator, title: 'Every math domain', text: 'Algebra through trig, with grid-ins, the reference sheet and a built-in Desmos calculator.' },
  { icon: Cloud, title: 'Synced to your account', text: 'Sign in with Hack Club and your progress follows you to any device.' },
]

/** Sample questions for the logged-out demo (falls back gracefully if the bank changes). */
const SAMPLES = [
  { key: 'rw', label: 'Reading & Writing', id: 'rw-original-vocab-015' },
  { key: 'math', label: 'Math', id: 'm-gen-radical-equation-017' },
] as const

export function HackClubButton({ size = 'lg', label = 'Sign in with Hack Club' }: { size?: 'lg' | 'default'; label?: string }) {
  return (
    <Button size={size} className="h-11 gap-2.5 rounded-full pr-6 pl-2 text-[15px]" onClick={() => signIn()}>
      <img src="https://assets.hackclub.com/icon-rounded.svg" alt="" className="size-7 rounded-full bg-white" />
      {label}
    </Button>
  )
}

export default function Landing() {
  const [params, setParams] = useSearchParams()

  useEffect(() => {
    const err = params.get('auth_error')
    if (err) {
      toast.error(err === 'access_denied' ? 'Sign-in was cancelled.' : 'Sign-in failed. Please try again.')
      params.delete('auth_error')
      setParams(params, { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip">
      {/* Aurora wash behind the hero, fading into the page */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[760px] [mask-image:linear-gradient(to_bottom,black_55%,transparent)]">
        <AuroraBg className="!absolute inset-0" />
      </div>

      <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeMenu />
          <Button variant="outline" className="rounded-full bg-background/70" onClick={() => signIn()}>
            Sign in
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 sm:px-6">
        {/* Hero */}
        <section className="px-2 pt-16 pb-20 text-center sm:pt-24 sm:pb-28">
          {/*<p className="animate-in fade-in fill-mode-backwards text-sm font-medium text-primary duration-500">
            Free · {QUESTIONS.length} original practice questions
          </p> */}
          <h1 className="mx-auto mt-5 max-w-4xl animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards font-display text-5xl leading-[0.98] tracking-[-0.025em] text-balance delay-100 duration-700 ease-(--ease-out-quint) sm:text-7xl lg:text-8xl">
            Your 1600 starts with <em className="text-primary">one</em> question.
          </h1>
          <p className="mx-auto mt-7 max-w-xl animate-in fade-in fill-mode-backwards text-pretty text-muted-foreground delay-200 duration-700 sm:text-lg">
            Digital SAT practice that adapts to you. Timed modules on a test-day screen, instant explanations, and a clear picture of what to study
            next.
          </p>
          <div className="mt-10 flex animate-in flex-col items-center gap-3 fade-in fill-mode-backwards delay-300 duration-700">
            <HackClubButton />
            <a href="#try" className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              or try a question first ↓
            </a>
          </div>
        </section>

        {/* Try a question */}
        <TryOne />

        {/* Test-day screen */}
        <FadeIn>
          <section className="mt-28 grid items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
            <div>
              <p className="text-sm font-medium text-primary">Practice like it’s test day</p>
              <h2 className="mt-3 font-display text-4xl leading-[1.05] tracking-[-0.02em] text-balance sm:text-5xl">
                The test screen you’ll actually see.
              </h2>
              <p className="mt-4 max-w-md text-pretty text-muted-foreground">
                Timed tests run on a screen modeled on the official testing app: the same timer, question navigator, mark for review, answer
                eliminator, reference sheet and graphing calculator. Nothing on test day will feel new.
              </p>
            </div>
            <TestScreenMock />
          </section>
        </FadeIn>

        {/* Features */}
        <FadeIn>
          <section className="mt-28">
            <h2 className="text-center font-display text-4xl tracking-[-0.02em] sm:text-5xl">Everything else you need.</h2>
            <dl className="mx-auto mt-10 grid max-w-4xl gap-x-12 border-t sm:grid-cols-2">
              {FEATURES.map((f) => (
                <div key={f.title} className="flex gap-4 border-b py-6">
                  <f.icon className="mt-0.5 size-5 shrink-0 text-primary" strokeWidth={1.75} />
                  <div>
                    <dt className="font-semibold">{f.title}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.text}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>
        </FadeIn>

        {/* Closing CTA */}
        <section className="mt-28 rounded-[2rem] border bg-card px-6 py-16 text-center sm:py-20">
          <h2 className="mx-auto max-w-2xl font-display text-4xl leading-[1.05] tracking-[-0.02em] text-balance sm:text-6xl">
            Twenty questions a day adds up.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-pretty text-muted-foreground">
            Keep a streak, watch your weak skills turn into strong ones, and walk into test day already used to it.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <HackClubButton label="Start practicing free" />
            <p className="text-xs text-muted-foreground">Free for everyone with a Hack Club account.</p>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
          <span>Sign-in is provided by Hack Club Auth. We store your name, email and practice history.</span>
          <span>SAT® is a trademark of the College Board, which is not affiliated with this site.</span>
        </div>
      </footer>
    </div>
  )
}

/** A real, answerable question so visitors feel the product before signing in. */
function TryOne() {
  const samples = SAMPLES.filter((s) => BY_ID.has(s.id))
  const [tab, setTab] = useState(0)
  const [answer, setAnswer] = useState<Answer>(null)
  const q = samples[tab] ? BY_ID.get(samples[tab].id) : undefined
  if (!q) return null
  const revealed = answer !== null

  const switchTo = (i: number) => {
    setTab(i)
    setAnswer(null)
  }

  return (
    <section id="try" className="scroll-mt-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">Try one</p>
            <h2 className="mt-1 font-display text-4xl tracking-[-0.02em] sm:text-5xl">No account needed.</h2>
          </div>
          <div role="tablist" aria-label="Sample question section" className="flex rounded-full border bg-card p-1 text-sm">
            {samples.map((s, i) => (
              <button
                key={s.key}
                role="tab"
                aria-selected={tab === i}
                onClick={() => switchTo(i)}
                className={cn(
                  'rounded-full px-3.5 py-1.5 font-medium transition-colors duration-150',
                  tab === i ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div key={q.id} className="animate-in rounded-3xl border bg-card p-5 shadow-sm fade-in duration-200 sm:p-8">
          <QuestionView q={q} answer={answer} onAnswer={(a) => a !== null && setAnswer(a)} reveal={revealed} />
          {revealed && (
            <>
              <Explanation q={q} answer={answer} />
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-5">
                <p className="text-sm text-muted-foreground">That’s one. {QUESTIONS.length - 1} more inside, each with an explanation like this.</p>
                <div className="flex gap-2">
                  <Button variant="ghost" className="rounded-full" onClick={() => setAnswer(null)}>
                    <RotateCcw /> Retry
                  </Button>
                  {samples.length > 1 && (
                    <Button variant="outline" className="rounded-full" onClick={() => switchTo((tab + 1) % samples.length)}>
                      Try {samples[(tab + 1) % samples.length].label}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

/** A miniature, static rendering of the timed-test screen. */
function TestScreenMock() {
  const choices = ['enhance', 'hinder', 'misrepresent', 'aggravate']
  return (
    <div className="bb pointer-events-none overflow-hidden rounded-2xl border shadow-[0_24px_60px_-20px_rgba(20,24,60,0.35)] select-none" aria-hidden>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center bg-[var(--bb-chrome)] px-4 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-[11px]">Section 1, Module 1: Reading and Writing</p>
          <p className="mt-0.5 text-[9px] font-medium">Directions ⌄</p>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[13px] font-bold tabular-nums">31:53</span>
          <span className="mt-0.5 rounded-full border border-[var(--bb-ink)] px-1.5 text-[8px] leading-tight font-bold">Hide</span>
        </div>
        <p className="text-right text-[9px] font-medium">Highlights &amp; Notes · More</p>
      </div>
      <div className="bb-dash" />
      <div className="mx-4 grid h-4 place-items-center rounded-b-lg bg-[var(--bb-navy)] text-[7px] font-bold tracking-wide text-white uppercase">
        This is a practice test
      </div>
      <div className="grid grid-cols-2 bg-white">
        <p className="bb-serif border-r-2 border-[var(--bb-divider)] p-4 text-[9.5px] leading-[1.6]">
          Although critics believed that customers would never agree to pay to pick their own produce on farms, such concerns didn’t ______
          Booker T. Whatley’s efforts to promote the practice.
        </p>
        <div className="p-4">
          <div className="flex h-4 items-stretch bg-[var(--bb-bar)]">
            <span className="grid w-4 place-items-center bg-[var(--bb-ink)] text-[8px] font-bold text-white">1</span>
            <span className="ml-1.5 self-center text-[8px]">Mark for Review</span>
          </div>
          <div className="bb-dash" />
          <p className="bb-serif mt-2 text-[8.5px]">Which choice completes the text with the most logical and precise word?</p>
          <div className="mt-2 flex flex-col gap-1.5">
            {choices.map((c, i) => (
              <div
                key={c}
                className={cn(
                  'flex items-center gap-2 rounded-[4px] border px-1.5 py-1',
                  i === 1 ? 'border-[var(--bb-blue)] shadow-[inset_0_0_0_1px_var(--bb-blue)]' : 'border-[var(--bb-ink)]',
                )}
              >
                <span
                  className={cn(
                    'grid size-3 place-items-center rounded-full border text-[6.5px] font-medium',
                    i === 1 ? 'border-[var(--bb-blue)] bg-[var(--bb-blue)] text-white' : 'border-[var(--bb-ink)]',
                  )}
                >
                  {'ABCD'[i]}
                </span>
                <span className="bb-serif text-[8.5px]">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bb-dash" />
      <div className="flex items-center justify-between bg-[var(--bb-chrome)] px-4 py-2">
        <span className="text-[10px] font-medium">Student</span>
        <span className="rounded-[4px] bg-[var(--bb-ink)] px-2 py-1 text-[9px] font-bold text-white">Question 1 of 27 ⌃</span>
        <span className="rounded-full bg-[var(--bb-blue)] px-3 py-1 text-[9px] font-bold text-white">Next</span>
      </div>
    </div>
  )
}
