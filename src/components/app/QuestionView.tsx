import type { ReactNode } from 'react'
import { Bookmark, Check, CircleSlash, Flag, Lightbulb, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Toggle } from '@/components/ui/toggle'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { Question } from '@/data/types'
import { Inline, Markup } from '@/lib/Markup'
import { isCorrect, parseNumeric, type Answer } from '@/lib/grading'
import { toggleBookmark, useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const LETTERS = ['A', 'B', 'C', 'D']

interface Props {
  q: Question
  number?: number
  answer: Answer
  onAnswer: (a: Answer) => void
  reveal?: boolean
  eliminated?: number[]
  onEliminate?: (i: number) => void
  elimMode?: boolean
  toolbar?: ReactNode
  /** In the test runner the passage pane scrolls independently */
  fullHeight?: boolean
}

export function QuestionView({ q, number, answer, onAnswer, reveal = false, eliminated = [], onEliminate, elimMode, toolbar, fullHeight }: Props) {
  const split = !!q.passage && q.section === 'rw'

  const head = (
    <div className="mb-5 flex items-center justify-between gap-3 border-b pb-3">
      <div className="flex min-w-0 items-center gap-3">
        {number !== undefined && (
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-foreground font-mono text-sm font-semibold text-background">
            {number}
          </span>
        )}
        <span className="truncate text-sm text-muted-foreground">{q.skill}</span>
      </div>
      <div className="flex shrink-0 items-center gap-1">{toolbar}</div>
    </div>
  )

  const body = (
    <div>
      <Markup text={q.prompt} className="text-[1.05rem] leading-relaxed" />
      <div className="mt-6">
        {q.choices ? (
          <Choices q={q} answer={answer} onAnswer={onAnswer} reveal={reveal} eliminated={eliminated} onEliminate={onEliminate} elimMode={elimMode} />
        ) : (
          <GridIn q={q} answer={answer} onAnswer={onAnswer} reveal={reveal} />
        )}
      </div>
    </div>
  )

  if (split) {
    return (
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-0">
        <div className={cn('lg:border-r lg:pr-10', fullHeight && 'lg:max-h-[calc(100dvh-11rem)] lg:overflow-y-auto')}>
          <Markup text={q.passage!} className="font-serif text-[1.1rem] leading-[1.8]" />
        </div>
        <div className="lg:pl-10">
          {head}
          {body}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      {head}
      {q.passage && <Markup text={q.passage} className="mb-6 font-serif text-[1.08rem] leading-relaxed" />}
      {body}
    </div>
  )
}

function Choices({
  q,
  answer,
  onAnswer,
  reveal,
  eliminated,
  onEliminate,
  elimMode,
}: Pick<Props, 'q' | 'answer' | 'onAnswer' | 'onEliminate' | 'elimMode'> & { reveal: boolean; eliminated: number[] }) {
  return (
    <div className="flex flex-col gap-2.5" role="radiogroup" aria-label="Answer choices">
        {q.choices!.map((c, i) => {
          const selected = answer === i
          const right = reveal && q.answer === i
          const wrong = reveal && selected && q.answer !== i
          const out = eliminated.includes(i) && !reveal
          return (
            <div key={i} className="flex items-stretch gap-2">
              <button
                role="radio"
                aria-checked={selected}
                disabled={reveal}
                onClick={() => onAnswer(selected ? null : i)}
                className={cn(
                  'motion-press group relative flex flex-1 items-start gap-3.5 rounded-xl border bg-card px-4 py-3.5 text-left shadow-xs transition-[border-color,background-color,box-shadow,opacity,scale] duration-150 ease-(--ease-out-quint)',
                  'hover:border-primary/50 hover:shadow-sm active:scale-[0.99] disabled:cursor-default disabled:hover:shadow-xs disabled:active:scale-100',
                  selected && 'border-primary bg-primary/[0.06] ring-1 ring-primary',
                  right && 'border-success bg-success/10 ring-1 ring-success',
                  wrong && 'border-destructive bg-destructive/10 ring-1 ring-destructive',
                  reveal && !right && !wrong && 'opacity-70',
                  out && 'opacity-40',
                )}
              >
                <span
                  className={cn(
                    'grid size-7 shrink-0 place-items-center rounded-full border text-[13px] font-semibold transition-colors',
                    selected && 'border-primary bg-primary text-primary-foreground',
                    right && 'border-success bg-success text-white dark:text-background',
                    wrong && 'border-destructive bg-destructive text-white dark:text-background',
                  )}
                >
                  {right ? <Check className="size-4" /> : wrong ? <X className="size-4" /> : LETTERS[i]}
                </span>
                <span className={cn('pt-0.5 leading-relaxed', out && 'line-through decoration-2')}>
                  <Inline text={c} />
                </span>
              </button>
              {elimMode && !reveal && onEliminate && (
                <button
                  onClick={() => onEliminate(i)}
                  className="grid w-11 shrink-0 place-items-center rounded-xl border bg-card text-xs font-semibold text-muted-foreground transition hover:text-foreground"
                  aria-label={eliminated.includes(i) ? `Restore choice ${LETTERS[i]}` : `Eliminate choice ${LETTERS[i]}`}
                >
                  {eliminated.includes(i) ? 'Undo' : <span className="line-through decoration-2">{LETTERS[i]}</span>}
                </button>
              )}
            </div>
          )
        })}
    </div>
  )
}

function GridIn({ q, answer, onAnswer, reveal }: Pick<Props, 'q' | 'answer' | 'onAnswer'> & { reveal: boolean }) {
  const val = typeof answer === 'string' ? answer : ''
  const num = parseNumeric(val)
  const ok = reveal && isCorrect(q, val)
  const [n, d] = val.split('/')
  const preview = val.includes('/') ? `$\\frac{${n || '?'}}{${d || '?'}}$` : val
  return (
    <div className="max-w-sm">
      <label className="mb-2 block text-sm font-medium" htmlFor={`spr-${q.id}`}>
        Your answer
      </label>
      <Input
        id={`spr-${q.id}`}
        inputMode="decimal"
        autoComplete="off"
        disabled={reveal}
        value={val}
        maxLength={7}
        placeholder="12, -3, 3/4, .75"
        onChange={(e) => {
          const v = e.target.value.replace(/[^0-9./-]/g, '')
          onAnswer(v === '' ? null : v)
        }}
        className={cn(
          'h-14 rounded-xl px-4 font-mono text-xl tracking-wider md:text-xl',
          reveal && (ok ? 'border-success bg-success/10' : 'border-destructive bg-destructive/10'),
        )}
      />
      <div className="mt-3 flex min-h-7 items-center gap-2 text-sm text-muted-foreground">
        {val ? (
          <>
            <span>Preview</span>
            <span className="rounded-md bg-muted px-2 py-0.5 text-foreground">
              <Inline text={preview} />
            </span>
            {num === null && <span className="text-destructive">Not a valid number yet</span>}
          </>
        ) : (
          !reveal && <span>Fractions and decimals both work. No mixed numbers, %, or $.</span>
        )}
      </div>
    </div>
  )
}

export function Explanation({ q, answer }: { q: Question; answer: Answer }) {
  const right = isCorrect(q, answer)
  const key = typeof q.answer === 'number' ? `Choice ${LETTERS[q.answer]}` : q.answer[0]
  return (
    <div
      className={cn(
        'mt-6 animate-in fade-in slide-in-from-bottom-2 rounded-2xl border p-5 duration-300',
        right ? 'border-success/30 bg-success/[0.07]' : 'border-destructive/30 bg-destructive/[0.06]',
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className={cn('flex items-center gap-1.5 font-semibold', right ? 'text-success' : 'text-destructive')}>
          {right ? <Check className="size-4" /> : answer === null ? <CircleSlash className="size-4" /> : <X className="size-4" />}
          {answer === null ? 'Skipped' : right ? 'Correct' : 'Not quite'}
        </span>
        <span className="text-sm text-muted-foreground">
          Answer: <strong className="text-foreground">{key}</strong>
        </span>
      </div>
      <div className="mt-3 flex gap-3">
        <Lightbulb className="mt-1 size-4 shrink-0 text-muted-foreground" />
        <Markup text={q.explanation} className="leading-relaxed" />
      </div>
    </div>
  )
}

// ---- toolbar toggles ----------------------------------------------------------

function TipToggle({ label, pressed, onChange, children }: { label: string; pressed: boolean; onChange: () => void; children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle size="sm" pressed={pressed} onPressedChange={onChange} aria-label={label} className="data-[state=on]:text-primary">
          {children}
        </Toggle>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export function BookmarkToggle({ qid }: { qid: string }) {
  const on = useStore((s) => s.bookmarks.includes(qid))
  return (
    <TipToggle label={on ? 'Saved to Review' : 'Save to Review'} pressed={on} onChange={() => toggleBookmark(qid)}>
      <Bookmark className={cn(on && 'fill-current')} />
    </TipToggle>
  )
}

export function ElimToggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <TipToggle label="Answer eliminator" pressed={on} onChange={onChange}>
      <span className="text-xs font-bold line-through decoration-2">ABC</span>
    </TipToggle>
  )
}

export function MarkToggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <Toggle size="sm" pressed={on} onPressedChange={onChange} className="gap-1.5 data-[state=on]:text-warning-ink">
      <Flag className={cn(on && 'fill-current')} />
      <span className="hidden sm:inline">Mark for review</span>
    </Toggle>
  )
}
