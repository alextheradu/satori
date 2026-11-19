import { useRef, useState, type ReactNode } from 'react'
import { Bookmark } from 'lucide-react'
import type { Question } from '@/data/types'
import { Inline, Markup } from '@/lib/Markup'
import { parseNumeric, type Answer } from '@/lib/grading'
import { cn } from '@/lib/utils'

const LETTERS = ['A', 'B', 'C', 'D']

interface Props {
  q: Question
  number: number
  answer: Answer
  onAnswer: (a: Answer) => void
  eliminated: number[]
  onEliminate: (i: number) => void
  elimMode: boolean
  onToggleElim: () => void
  marked: boolean
  onToggleMark: () => void
}

/** Bluebook-style question: split passage / question for RW and math grid-ins, centered column otherwise. */
export function BBQuestion(props: Props) {
  const { q } = props
  const spr = !q.choices
  const split = (q.section === 'rw' && !!q.passage) || spr

  const right = (
    <div className={cn(!split && 'mx-auto w-full max-w-[668px]')}>
      <QuestionHeader {...props} />
      {!split && q.passage && <Markup text={q.passage} className="bb-serif mt-4 text-base leading-[1.6]" />}
      <Markup text={q.prompt} className="bb-serif mt-4 text-base leading-[1.6]" />
      <div className="mt-4">{spr ? <GridIn {...props} /> : <Choices {...props} />}</div>
    </div>
  )

  if (!split) return <div className="bb-scroll h-full overflow-y-auto px-10 pt-14 pb-10">{right}</div>

  const left = spr ? (
    <SprDirections />
  ) : (
    <Markup text={q.passage!} className="bb-serif text-base leading-[1.6]" />
  )

  return <SplitPane left={left} right={right} />
}

// ---- split layout with draggable divider ------------------------------------------------

function SplitPane({ left, right }: { left: ReactNode; right: ReactNode }) {
  const [frac, setFrac] = useState(0.5)
  const box = useRef<HTMLDivElement>(null)

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault()
    const el = box.current
    if (!el) return
    // keep the grab offset so the divider doesn't jump under the pointer
    const start = el.getBoundingClientRect()
    const grab = e.clientX - (start.left + frac * start.width)
    const move = (ev: PointerEvent) => {
      const r = el.getBoundingClientRect()
      setFrac(Math.min(0.75, Math.max(0.25, (ev.clientX - grab - r.left) / r.width)))
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      document.body.style.cursor = ''
    }
    document.body.style.cursor = 'col-resize'
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <div ref={box} className="flex h-full min-h-0">
      <div className="bb-scroll h-full min-w-0 overflow-y-auto pt-9 pr-10 pb-10 pl-[38px]" style={{ width: `${frac * 100}%` }}>
        {left}
      </div>
      <div className="relative w-[3px] shrink-0 bg-[var(--bb-divider)]">
        <button
          type="button"
          aria-label="Resize panes"
          onPointerDown={onDown}
          onDoubleClick={() => setFrac(0.5)}
          className="absolute top-[220px] left-1/2 grid h-[26px] w-[14px] -translate-x-1/2 cursor-col-resize place-items-center rounded-[4px] bg-[var(--bb-ink)]"
        >
          <svg viewBox="0 0 10 14" className="h-3 w-2.5 fill-white" aria-hidden>
            <path d="M4 3 0 7l4 4zM6 3l4 4-4 4z" />
          </svg>
        </button>
      </div>
      <div className="bb-scroll h-full min-w-0 flex-1 overflow-y-auto pt-9 pr-[52px] pb-10 pl-10">{right}</div>
    </div>
  )
}

// ---- question header bar ------------------------------------------------------------------

function QuestionHeader({ number, marked, onToggleMark, elimMode, onToggleElim, q }: Props) {
  return (
    <div>
      <div className="flex h-8 items-stretch bg-[var(--bb-bar)]">
        <span className="grid w-[26px] shrink-0 place-items-center bg-[var(--bb-ink)] text-base font-bold text-white">{number}</span>
        <button
          type="button"
          onClick={onToggleMark}
          aria-pressed={marked}
          className="ml-4 flex items-center gap-1.5 text-[15px] hover:underline"
        >
          <Bookmark
            className={cn('size-[18px]', marked && 'fill-[var(--bb-red)] text-[var(--bb-red)]')}
            strokeWidth={1.75}
          />
          Mark for Review
        </button>
        {q.choices && (
          <button
            type="button"
            onClick={onToggleElim}
            aria-pressed={elimMode}
            aria-label="Cross out answer choices"
            className={cn(
              'my-auto mr-1 ml-auto grid h-[26px] w-[28px] place-items-center rounded-[4px] border transition-colors',
              elimMode
                ? 'border-[#9aa6e6] bg-[var(--bb-blue)] text-white'
                : 'border-[var(--bb-ink)] bg-white text-[var(--bb-ink)] hover:bg-[#e6edf8]',
            )}
          >
            <span className="relative text-[10px] leading-none font-bold tracking-tight">
              ABC
              <span className="absolute top-1/2 -left-[2px] h-[1.5px] w-[calc(100%+4px)] -rotate-[30deg] bg-current" />
            </span>
          </button>
        )}
      </div>
      <div className="bb-dash" />
    </div>
  )
}

// ---- multiple choice -------------------------------------------------------------------------

function Choices({ q, answer, onAnswer, eliminated, onEliminate, elimMode }: Props) {
  return (
    <div className="flex flex-col gap-[15px]" role="radiogroup" aria-label="Answer choices">
      {q.choices!.map((c, i) => {
        const selected = answer === i
        const out = eliminated.includes(i)
        return (
          <div key={i} className="flex items-center gap-4">
            <button
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                if (out) onEliminate(i)
                onAnswer(selected ? null : i)
              }}
              className={cn(
                'relative flex min-h-[47px] flex-1 items-center gap-[18px] rounded-[8px] border bg-white px-3 py-2.5 text-left',
                selected
                  ? 'border-[var(--bb-blue)] shadow-[inset_0_0_0_2px_var(--bb-blue)]'
                  : 'border-[var(--bb-ink)] hover:shadow-[inset_0_0_0_1px_var(--bb-ink)]',
                out && 'text-[#767676]',
              )}
            >
              <span
                className={cn(
                  'grid size-[24px] shrink-0 place-items-center rounded-full border-2 text-[13px] font-medium',
                  selected ? 'border-[var(--bb-blue)] bg-[var(--bb-blue)] text-white' : out ? 'border-[#767676]' : 'border-[var(--bb-ink)]',
                )}
              >
                {LETTERS[i]}
              </span>
              <span className="bb-serif text-base leading-normal">
                <Inline text={c} />
              </span>
              {out && <span className="pointer-events-none absolute top-1/2 right-[-6px] left-[-6px] h-[2px] -translate-y-1/2 bg-[var(--bb-ink)]" />}
            </button>
            {elimMode && (
              <button
                type="button"
                onClick={() => {
                  if (!out && selected) onAnswer(null)
                  onEliminate(i)
                }}
                aria-label={out ? `Undo cross out of choice ${LETTERS[i]}` : `Cross out choice ${LETTERS[i]}`}
                className="grid w-[30px] shrink-0 place-items-center"
              >
                {out ? (
                  <span className="text-[15px] font-bold underline underline-offset-2">Undo</span>
                ) : (
                  <span className="relative grid size-[20px] place-items-center rounded-full border-[1.5px] border-[var(--bb-ink)] text-[11px] font-bold">
                    {LETTERS[i]}
                    <span className="absolute top-1/2 -left-[5px] h-[1.5px] w-[28px] -translate-y-1/2 bg-[var(--bb-ink)]" />
                  </span>
                )}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ---- student-produced response ----------------------------------------------------------------

function GridIn({ q, answer, onAnswer }: Props) {
  const val = typeof answer === 'string' ? answer : ''
  const [n, d] = val.split('/')
  const preview = val.includes('/') ? `$\\frac{${n || '\\ '}}{${d || '\\ '}}$` : val
  const valid = !val || parseNumeric(val) !== null
  return (
    <div>
      <input
        id={`spr-${q.id}`}
        aria-label="Your answer"
        inputMode="decimal"
        autoComplete="off"
        value={val}
        maxLength={val.startsWith('-') ? 6 : 5}
        onChange={(e) => {
          const v = e.target.value.replace(/[^0-9./-]/g, '')
          onAnswer(v === '' ? null : v)
        }}
        className="bb-serif h-[46px] w-[170px] rounded-[8px] border border-[var(--bb-ink)] border-b-[3px] bg-white px-3 text-xl outline-none focus:border-[var(--bb-blue)]"
      />
      <p className="mt-4 text-base">
        Answer Preview: <span className="bb-serif font-bold">{val ? <Inline text={preview} /> : null}</span>
      </p>
      {!valid && <p className="mt-1 text-sm text-[var(--bb-red)]">This isn’t a valid answer yet.</p>}
    </div>
  )
}

function SprDirections() {
  const rules = [
    'If you find **more than one correct answer**, enter only one answer.',
    'You can enter up to 5 characters for a **positive** answer and up to 6 characters (including the negative sign) for a **negative** answer.',
    'If your answer is a **fraction** that doesn’t fit in the provided space, enter the decimal equivalent.',
    'If your answer is a **decimal** that doesn’t fit in the provided space, enter it by truncating or rounding at the fourth digit.',
    'If your answer is a **mixed number** (such as $3\\frac{1}{2}$), enter it as an improper fraction (7/2) or its decimal equivalent (3.5).',
    'Don’t enter **symbols** such as a percent sign, comma, or dollar sign.',
  ]
  const rows: [string, string, string][] = [
    ['$3.5$', '3.5\n3.50\n7/2', '31/2\n3 1/2'],
    ['$\\frac{2}{3}$', '2/3\n.6666\n.6667\n0.666\n0.667', '0.66\n.66\n0.67\n.67'],
    ['$-\\frac{1}{3}$', '-1/3\n-.3333\n-0.333', '-.33\n-0.33'],
  ]
  return (
    <div className="text-base leading-[1.6]">
      <h2 className="text-[17px] font-bold">Student-produced response directions</h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-6">
        {rules.map((r) => (
          <li key={r}>
            <Inline text={r} />
          </li>
        ))}
      </ul>
      <h3 className="mt-6 text-center font-bold">Examples</h3>
      <table className="mt-3 w-full border-collapse text-center text-[15px]">
        <thead>
          <tr className="bg-[var(--bb-bar)]">
            <th className="border border-[var(--bb-ink)] px-2 py-2 font-bold">Answer</th>
            <th className="border border-[var(--bb-ink)] px-2 py-2 font-bold">Acceptable ways to enter answer</th>
            <th className="border border-[var(--bb-ink)] px-2 py-2 font-bold">Unacceptable: will NOT receive credit</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([a, ok, bad]) => (
            <tr key={a}>
              <td className="border border-[var(--bb-ink)] px-2 py-2">
                <Inline text={a} />
              </td>
              <td className="border border-[var(--bb-ink)] px-2 py-2 whitespace-pre-line">{ok}</td>
              <td className="border border-[var(--bb-ink)] px-2 py-2 whitespace-pre-line">{bad}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
