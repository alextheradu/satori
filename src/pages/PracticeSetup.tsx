import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowRight, BookOpenText, Calculator, ExternalLink, Layers, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { FadeIn, PageHeader, Tile } from '@/components/app/common'
import { DIFFICULTIES, DOMAINS, QUESTIONS } from '@/data/bank'
import type { Difficulty, Domain, Section } from '@/data/types'
import { SECTION_LABEL } from '@/lib/grading'
import { matchPool, practiceUrl, type PracticeOpts } from '@/lib/practice'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

type Filter = 'all' | 'unseen' | 'missed'

export default function PracticeSetup() {
  const nav = useNavigate()
  const attempts = useStore((s) => s.attempts)
  const [section, setSection] = useState<Section | 'both'>('both')
  const [domains, setDomains] = useState<Domain[]>([])
  const [diffs, setDiffs] = useState<Difficulty[]>([])
  const [count, setCount] = useState('10')
  const [filter, setFilter] = useState<Filter>('all')

  const opts: PracticeOpts = { section, domains, difficulties: diffs, count: Number(count), filter }
  const available = useMemo(() => matchPool(opts, attempts).length, [section, domains, diffs, filter, attempts]) // eslint-disable-line react-hooks/exhaustive-deps
  const sections: Section[] = section === 'both' ? ['rw', 'math'] : [section]
  const n = Math.min(available, Number(count))

  return (
    <div>
      <PageHeader
        eyebrow="Practice"
        title="Drill what matters."
        description="Untimed questions with instant feedback and a worked explanation after every answer."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <FadeIn className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Section</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {(
                  [
                    { v: 'both', label: 'Both sections', icon: Layers },
                    { v: 'rw', label: 'Reading & Writing', icon: BookOpenText },
                    { v: 'math', label: 'Math', icon: Calculator },
                  ] as const
                ).map((o) => (
                  <button
                    key={o.v}
                    onClick={() => {
                      setSection(o.v)
                      setDomains([])
                    }}
                    aria-pressed={section === o.v}
                    className={cn(
                      'motion-press flex items-center gap-3 rounded-xl border bg-card px-4 py-3.5 text-left text-sm font-medium transition-[border-color,background-color,box-shadow,scale] duration-150 hover:border-primary/50 active:scale-[0.98]',
                      section === o.v && 'border-primary bg-primary/[0.06] ring-1 ring-primary',
                    )}
                  >
                    <span className={cn('grid size-8 place-items-center rounded-lg bg-muted', section === o.v && 'bg-primary text-primary-foreground')}>
                      <o.icon className="size-4" />
                    </span>
                    {o.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Domains</CardTitle>
              <CardDescription>Leave everything unchecked to mix all domains.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {sections.map((s) => (
                <div key={s}>
                  {section === 'both' && <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">{SECTION_LABEL[s]}</p>}
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {DOMAINS[s].map((d) => {
                      const on = domains.includes(d)
                      const id = `dom-${d}`
                      return (
                        <Label
                          key={d}
                          htmlFor={id}
                          className={cn(
                            'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 font-normal transition-colors hover:bg-muted/50',
                            on && 'border-primary/60 bg-primary/[0.05]',
                          )}
                        >
                          <Checkbox id={id} checked={on} onCheckedChange={(v) => setDomains(v ? [...domains, d] : domains.filter((x) => x !== d))} />
                          <span className="flex-1">{d}</span>
                          <span className="font-mono text-xs text-muted-foreground">{QUESTIONS.filter((q) => q.domain === d).length}</span>
                        </Label>
                      )
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Difficulty</CardTitle>
              <CardDescription>Pick any combination, or none for all.</CardDescription>
            </CardHeader>
            <CardContent>
              <ToggleGroup type="multiple" variant="outline" value={diffs} onValueChange={(v) => setDiffs(v as Difficulty[])} className="w-full sm:w-auto">
                {DIFFICULTIES.map((d) => (
                  <ToggleGroupItem key={d} value={d} className="flex-1 px-5 capitalize sm:flex-none">
                    {d}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.1} className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Session</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div>
                <p className="mb-2 text-sm font-medium">Questions</p>
                <ToggleGroup type="single" variant="outline" value={count} onValueChange={(v) => v && setCount(v)} className="w-full">
                  {['5', '10', '20', '50'].map((c) => (
                    <ToggleGroupItem key={c} value={c} className="flex-1 font-mono">
                      {c}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Include</p>
                <ToggleGroup type="single" variant="outline" value={filter} onValueChange={(v) => v && setFilter(v as Filter)} className="w-full">
                  <ToggleGroupItem value="all" className="flex-1">
                    All
                  </ToggleGroupItem>
                  <ToggleGroupItem value="unseen" className="flex-1">
                    New
                  </ToggleGroupItem>
                  <ToggleGroupItem value="missed" className="flex-1">
                    Missed
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              <Separator />
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-muted-foreground">Matching questions</span>
                <span className="font-mono font-semibold">{available}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button size="lg" className="h-11 w-full rounded-full" disabled={!available} onClick={() => nav(practiceUrl(opts))}>
                {available ? `Start ${n} question${n === 1 ? '' : 's'}` : 'No matches'}
                {available > 0 && <ArrowRight />}
              </Button>
            </CardFooter>
          </Card>

          <Tile className="p-6">
            <div className="flex items-center gap-2 font-semibold">
              <Wand2 className="size-4 text-primary" /> Smart practice
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Ten questions: the ones you missed first, then ones you haven’t seen.</p>
            <Button variant="outline" className="mt-4 w-full rounded-full" onClick={() => nav(practiceUrl({ mode: 'smart' }))}>
              Start smart session
            </Button>
          </Tile>

          <a
            href="https://satsuiteeducatorquestionbank.collegeboard.org/digital/search"
            target="_blank"
            rel="noreferrer"
            className="group flex items-start gap-3 rounded-2xl border border-dashed p-5 text-sm transition-colors hover:border-primary/50"
          >
            <ExternalLink className="mt-0.5 size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">Want official questions too?</span> College Board’s free SAT Suite Question Bank uses the
              same domains and skills.
            </span>
          </a>
        </FadeIn>
      </div>
    </div>
  )
}
