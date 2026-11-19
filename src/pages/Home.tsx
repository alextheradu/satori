import { Link } from 'react-router'
import { ArrowRight, Brain, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item'
import { FadeIn, MasteryBar, pct } from '@/components/app/common'
import { AuroraBg } from '@/components/app/AuroraBg'
import { Momentum } from '@/components/app/Momentum'
import { ScoreRing } from '@/components/app/ScoreRing'
import { QUESTIONS } from '@/data/bank'
import type { Section } from '@/data/types'
import { SECTION_LABEL } from '@/lib/grading'
import { practiceUrl } from '@/lib/practice'
import { bySection, domainBreakdown, practiceEstimate, tally, weakestSkills } from '@/lib/stats'
import { dismissLegacy, importLegacy, latestByQuestion, useStore } from '@/lib/store'
import { toast } from 'sonner'
import { HardDriveUpload } from 'lucide-react'

/** Picked once per app load, so it changes each time you open Satori but not while you navigate. */
const GREETINGS = [
  'Back at it. Let’s close the gap.',
  'One more set. Future you says thanks.',
  'Small reps, big score.',
  'Today’s questions are tomorrow’s points.',
  'Show up, then level up.',
  'Steady wins the SAT.',
  'Pick up where you left off.',
  'A few questions now beats a cram later.',
  'Every miss is a point you’re about to earn.',
  'Keep the streak warm.',
]
const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)]

export default function Home() {
  const attempts = useStore((s) => s.attempts)
  const tests = useStore((s) => s.tests)
  const name = useStore((s) => s.user?.name?.split(' ')[0])

  const all = tally(attempts)
  const seen = latestByQuestion(attempts)
  const timed = attempts.filter((a) => a.ms > 0)
  const avgSec = timed.length ? Math.round(timed.reduce((s, a) => s + a.ms, 0) / timed.length / 1000) : 0
  const lastTest = tests[0]
  const estRW = lastTest?.scores.rw ?? practiceEstimate(attempts, 'rw')
  const estMath = lastTest?.scores.math ?? practiceEstimate(attempts, 'math')
  const total = estRW !== null && estMath !== null ? estRW + estMath : null
  const weak = weakestSkills(attempts)
  const fresh = attempts.length === 0

  return (
    <div className="flex flex-col gap-10">
      <LegacyBanner />
      <section className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
        <div className="relative isolate flex flex-col justify-center overflow-hidden rounded-3xl border bg-card px-7 py-9 sm:px-10 sm:py-12">
          <AuroraBg className="!absolute inset-0 -z-10" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-card via-card/70 to-card/10" />
          <h1 className="font-display text-[2.6rem] leading-[1.02] text-balance sm:text-6xl">
            {fresh ? 'Your 1600 starts with one question.' : greeting}
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-muted-foreground sm:text-lg">
            <span className="font-medium text-foreground">{fresh ? 'Welcome to Satori.' : name ? `Welcome back, ${name}.` : 'Welcome back.'}</span>{' '}
            {fresh
              ? 'Take a 25-minute diagnostic across every domain, then drill exactly the skills costing you points.'
              : 'Pick up a timed module, or let smart practice serve the questions you missed and the ones you haven’t seen.'}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-11 rounded-full px-6 text-[0.9375rem]">
              <Link to={fresh ? '/tests?start=diagnostic' : practiceUrl({ mode: 'smart' })}>
                {fresh ? 'Start the diagnostic' : 'Smart practice'}
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 rounded-full px-6 text-[0.9375rem]">
              <Link to={fresh ? '/practice' : '/tests'}>{fresh ? 'Practice by skill' : 'Take a timed test'}</Link>
            </Button>
          </div>
        </div>

        <Card className="justify-between rounded-3xl">
          <CardHeader>
            <CardTitle>Score estimate</CardTitle>
            <CardDescription>{lastTest ? 'From your latest test' : 'Unlocks after 8+ questions per section'}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-5">
            <ScoreRing value={total} />
            <div className="grid w-full grid-cols-2 gap-2.5">
              <SectionScore label="Reading & Writing" value={estRW} />
              <SectionScore label="Math" value={estMath} />
            </div>
            <p className="text-center text-xs text-muted-foreground">A rough guide, not an official College Board score.</p>
          </CardContent>
        </Card>
      </section>

      <FadeIn>
        <Momentum />
        {all.total > 0 && (
          <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-1 px-1 text-sm text-muted-foreground">
            <div className="flex gap-1.5">
              <dt>Answered</dt>
              <dd className="font-medium text-foreground tabular-nums">{all.total}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt>Accuracy</dt>
              <dd className="font-medium text-foreground tabular-nums">{pct(all.correct / all.total)}</dd>
            </div>
            {avgSec > 0 && (
              <div className="flex gap-1.5">
                <dt>Avg. per question</dt>
                <dd className="font-medium text-foreground tabular-nums">{avgSec}s</dd>
              </div>
            )}
          </dl>
        )}
      </FadeIn>

      {/* Mastery */}
      <section className="grid gap-5 lg:grid-cols-2">
        {(['rw', 'math'] as Section[]).map((s, i) => (
          <FadeIn key={s} delay={0.05 * i}>
            <SectionCard section={s} seenIds={[...seen.keys()]} />
          </FadeIn>
        ))}
      </section>

      {/* Focus next */}
      {weak.length > 0 && (
        <section>
          <SectionTitle icon={Brain} title="Focus next" hint="Your lowest-accuracy skills" />
          <ItemGroup className="gap-2">
            {weak.map((w) => (
              <Item key={w.skill} variant="outline" asChild className="bg-card">
                <Link to={practiceUrl({ skills: [w.skill] })}>
                  <ItemContent>
                    <ItemTitle>{w.skill}</ItemTitle>
                    <ItemDescription>
                      {SECTION_LABEL[w.section]} · {w.correct}/{w.total} correct
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions className="text-sm font-medium text-primary">
                    Drill <ArrowRight className="size-3.5" />
                  </ItemActions>
                </Link>
              </Item>
            ))}
          </ItemGroup>
        </section>
      )}

      {/* Recent tests */}
      {tests.length > 0 && (
        <section>
          <SectionTitle icon={Timer} title="Recent tests" action={<Link to="/tests" className="text-sm font-medium text-primary hover:underline">See all</Link>} />
          <ItemGroup className="gap-2">
            {tests.slice(0, 3).map((t) => (
              <Item key={t.id} variant="outline" asChild className="bg-card">
                <Link to={`/tests/${t.id}`}>
                  <ItemMedia variant="icon">
                    <Timer />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{t.title}</ItemTitle>
                    <ItemDescription>{new Date(t.ts).toLocaleDateString(undefined, { dateStyle: 'medium' })}</ItemDescription>
                  </ItemContent>
                  <ItemActions className="font-display text-3xl tabular-nums">
                    {(t.scores.rw ?? 0) + (t.scores.math ?? 0)}
                  </ItemActions>
                </Link>
              </Item>
            ))}
          </ItemGroup>
        </section>
      )}

      <p className="text-center text-sm text-muted-foreground">
        {QUESTIONS.length} original questions · {seen.size} seen · {pct(seen.size / QUESTIONS.length)} of the bank explored
      </p>
    </div>
  )
}

function SectionTitle({ icon: Icon, title, hint, action }: { icon: typeof Brain; title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <Icon className="size-5 text-primary" />
        <h2 className="text-lg font-semibold">{title}</h2>
        {hint && <span className="hidden text-sm text-muted-foreground sm:inline">· {hint}</span>}
      </div>
      {action}
    </div>
  )
}

function SectionScore({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-xl border bg-muted/40 px-3.5 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-display text-3xl tabular-nums">{value ?? <span className="text-muted-foreground">–</span>}</p>
    </div>
  )
}

function SectionCard({ section, seenIds }: { section: Section; seenIds: string[] }) {
  const attempts = useStore((s) => s.attempts)
  const t = tally(bySection(attempts, section))
  const rows = domainBreakdown(attempts, section)
  const bank = QUESTIONS.filter((q) => q.section === section).length
  const seen = seenIds.filter((id) => id.startsWith(section === 'rw' ? 'rw-' : 'm-')).length
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{SECTION_LABEL[section]}</CardTitle>
        <CardDescription>
          {t.total ? `${pct(t.correct / t.total)} accuracy · ` : ''}
          {seen}/{bank} questions seen
        </CardDescription>
        <CardAction>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link to={practiceUrl({ section })}>
              Practice <ArrowRight />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {rows.map((r) => (
          <MasteryBar key={r.domain} label={r.domain} correct={r.correct} total={r.total} href={practiceUrl({ section, domains: [r.domain] })} />
        ))}
      </CardContent>
    </Card>
  )
}

function LegacyBanner() {
  const legacy = useStore((s) => s.legacy)
  if (!legacy) return null
  return (
    <Card className="flex-row flex-wrap items-center justify-between gap-4 border-primary/30 bg-primary/[0.05] px-6 py-5">
      <div className="flex items-center gap-3">
        <HardDriveUpload className="size-5 text-primary" />
        <div>
          <p className="font-semibold">Found progress saved in this browser</p>
          <p className="text-sm text-muted-foreground">
            {legacy.attempts} answers and {legacy.tests} tests from before accounts. Add them to your account?
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          className="rounded-full"
          onClick={() =>
            importLegacy().then(
              () => toast.success('Progress imported'),
              () => toast.error('Import failed. Try again in a moment.'),
            )
          }
        >
          Import
        </Button>
        <Button variant="ghost" className="rounded-full" onClick={dismissLegacy}>
          Discard
        </Button>
      </div>
    </Card>
  )
}
