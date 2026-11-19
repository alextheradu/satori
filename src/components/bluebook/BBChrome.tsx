import { useRef, useState, type ReactNode } from 'react'
import { Bookmark, MapPin, X } from 'lucide-react'
import { MathReference } from '@/components/app/MathReference'
import type { Section } from '@/data/types'
import { cn } from '@/lib/utils'

export const BB_DIRECTIONS: Record<Section, ReactNode> = {
  rw: (
    <>
      <p>
        The questions in this section address a number of important reading and writing skills. Each question includes one or more
        passages, which may include a table or graph. Read each passage and question carefully, and then choose the best answer to the
        question based on the passage(s).
      </p>
      <p>All questions in this section are multiple-choice with four answer choices. Each question has a single best answer.</p>
    </>
  ),
  math: (
    <>
      <p>The questions in this section address a number of important math skills.</p>
      <p>Use of a calculator is permitted for all questions. A reference sheet, calculator, and these directions can be accessed throughout the test.</p>
      <p>Unless otherwise indicated:</p>
      <ul className="list-disc space-y-1 pl-6">
        <li>All variables and expressions represent real numbers.</li>
        <li>Figures provided are drawn to scale.</li>
        <li>All figures lie in a plane.</li>
        <li>
          The domain of a given function <i>f</i> is the set of all real numbers <i>x</i> for which <i>f</i>(<i>x</i>) is a real number.
        </li>
      </ul>
      <p>
        For <b>multiple-choice questions</b>, solve each problem and choose the correct answer from the choices provided. Each multiple-choice
        question has a single correct answer.
      </p>
      <p>
        For <b>student-produced response questions</b>, solve each problem and enter your answer as described in the directions shown next to
        each of these questions.
      </p>
    </>
  ),
}

// ---- buttons --------------------------------------------------------------------------------

export function BBPrimary({ className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...p}
      className={cn(
        'h-10 min-w-[4.875rem] rounded-full bg-[var(--bb-blue)] px-5 text-base font-bold text-white hover:bg-[var(--bb-blue-hover)] disabled:opacity-50',
        className,
      )}
    />
  )
}

export function BBOutline({ className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...p}
      className={cn(
        'h-10 rounded-full border border-[var(--bb-blue)] bg-white px-5 text-base font-bold text-[var(--bb-blue)] hover:bg-[#eef1fb]',
        className,
      )}
    />
  )
}

// ---- question grid (popup + review page) ------------------------------------------------------

export function BBLegend({ current = true }: { current?: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-[0.9375rem]">
      {current && (
        <span className="flex items-center gap-1.5">
          <MapPin className="size-[1.125rem] fill-[var(--bb-ink)] text-[var(--bb-ink)] [&>circle]:fill-white" /> Current
        </span>
      )}
      <span className="flex items-center gap-1.5">
        <span className="size-[1.125rem] border border-dashed border-[var(--bb-ink)]" /> Unanswered
      </span>
      <span className="flex items-center gap-1.5">
        <Bookmark className="size-[1.125rem] fill-[var(--bb-red)] text-[var(--bb-red)]" /> For Review
      </span>
    </div>
  )
}

export function BBGrid({
  count,
  cursor,
  isAnswered,
  isMarked,
  onGo,
}: {
  count: number
  cursor: number
  isAnswered: (i: number) => boolean
  isMarked: (i: number) => boolean
  onGo: (i: number) => void
}) {
  return (
    <div className="flex flex-wrap justify-center gap-x-[1.125rem] gap-y-6 pt-4">
      {Array.from({ length: count }, (_, i) => {
        const a = isAnswered(i)
        const m = isMarked(i)
        return (
          <button
            type="button"
            key={i}
            onClick={() => onGo(i)}
            aria-label={`Question ${i + 1}${a ? ', answered' : ', unanswered'}${m ? ', marked for review' : ''}`}
            className={cn(
              'relative grid size-[2.125rem] place-items-center text-[1.0625rem] font-bold',
              a ? 'bg-[var(--bb-blue)] text-white' : 'border border-dashed border-[var(--bb-ink)] text-[var(--bb-blue)] hover:bg-[#eef1fb]',
            )}
          >
            {i + 1}
            {i === cursor && (
              <MapPin className="absolute -top-[1.375rem] left-1/2 size-[1.125rem] -translate-x-1/2 fill-[var(--bb-ink)] text-[var(--bb-ink)] [&>circle]:fill-white" />
            )}
            {m && <Bookmark className="absolute -top-[0.4375rem] -right-[0.4375rem] size-[0.9375rem] fill-[var(--bb-red)] text-white" strokeWidth={1.5} />}
          </button>
        )
      })}
    </div>
  )
}

// ---- floating reference sheet -------------------------------------------------------------------

export function BBReference({ onClose }: { onClose: () => void }) {
  const [pos, setPos] = useState(() => ({ x: Math.max(16, window.innerWidth - 640), y: 96 }))
  const start = useRef<{ x: number; y: number; px: number; py: number } | null>(null)

  const onDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    start.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y }
    const move = (ev: PointerEvent) => {
      const s = start.current!
      setPos({
        x: Math.min(window.innerWidth - 120, Math.max(0, s.px + ev.clientX - s.x)),
        y: Math.min(window.innerHeight - 60, Math.max(0, s.py + ev.clientY - s.y)),
      })
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <div
      className="fixed z-40 flex max-h-[75dvh] w-[min(600px,calc(100vw-32px))] flex-col overflow-hidden rounded-[0.375rem] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.25)]"
      style={{ left: pos.x, top: pos.y }}
      role="dialog"
      aria-label="Reference sheet"
    >
      <div onPointerDown={onDown} className="flex h-[3.25rem] shrink-0 cursor-move items-center bg-[#151515] px-4 text-white select-none">
        <span className="text-[1.0625rem] font-bold">Reference Sheet</span>
        <span className="mx-auto grid grid-cols-3 gap-[3px]" aria-hidden>
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="size-[0.25rem] rounded-full bg-white" />
          ))}
        </span>
        <button type="button" onClick={onClose} aria-label="Close reference sheet" className="grid size-8 place-items-center">
          <X className="size-6" strokeWidth={1.75} />
        </button>
      </div>
      <div className="bb-scroll overflow-y-auto p-5 [&_.rounded-xl]:rounded-[0.25rem] [&_.rounded-xl]:border-[#c4c4c4] [&_.rounded-xl]:bg-white [&_.text-muted-foreground]:text-[#505050]">
        <MathReference />
      </div>
    </div>
  )
}
