import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { Difficulty } from '@/data/types'
import { useReducedMotion } from 'motion/react'
import CountUp from '@/components/reactbits/CountUp'

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn('flex items-center gap-2.5 text-foreground', className)}>
      <img src="/favicon.svg" alt="" className="size-7 rounded-lg shadow-sm" />
      <span className="font-display text-2xl leading-none">Satori</span>
    </Link>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}
        <h1 className="font-display text-4xl leading-[1.05] sm:text-5xl">{title}</h1>
        {description && <p className="mt-3 text-pretty text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  )
}

const DIFF: Record<Difficulty, string> = {
  easy: 'bg-success/12 text-success',
  medium: 'bg-warning/15 text-warning-ink',
  hard: 'bg-destructive/12 text-destructive',
}

export function DifficultyBadge({ d, className }: { d: Difficulty; className?: string }) {
  return (
    <Badge variant="secondary" className={cn('capitalize', DIFF[d], className)}>
      {d}
    </Badge>
  )
}

export function accuracyTone(acc: number, total: number) {
  if (!total) return 'bg-muted-foreground/30'
  if (acc >= 0.75) return 'bg-success'
  if (acc >= 0.5) return 'bg-warning'
  return 'bg-destructive'
}

export function MasteryBar({ label, correct, total, href }: { label: string; correct: number; total: number; href?: string }) {
  const acc = total ? correct / total : 0
  const inner = (
    <>
      <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium transition-colors group-hover:text-primary">{label}</span>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {total ? `${Math.round(acc * 100)}% · ${correct}/${total}` : 'not started'}
        </span>
      </div>
      <Progress value={total ? Math.max(acc * 100, 3) : 0} className="h-1.5" indicatorClassName={accuracyTone(acc, total)} />
    </>
  )
  return href ? (
    <Link to={href} className="group block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {inner}
    </Link>
  ) : (
    <div>{inner}</div>
  )
}

/** Short, CSS-only entrance (opacity + 4px). Product UI loads into a task; keep it quick. */
export function FadeIn({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <div
      className={cn('animate-in fade-in slide-in-from-bottom-1 fill-mode-backwards duration-300 ease-(--ease-out-quint)', className)}
      style={delay ? { animationDelay: `${Math.round(delay * 1000)}ms` } : undefined}
    >
      {children}
    </div>
  )
}

/** A plain bordered surface. Interactive tiles get a quiet hover and press state. */
export function Tile({ className, interactive, ...props }: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      {...props}
      className={cn(
        'rounded-2xl border bg-card text-card-foreground',
        interactive && 'transition-[border-color,box-shadow] duration-150 hover:border-primary/40 hover:shadow-sm',
        className,
      )}
    />
  )
}

/** Animated count for rare, earned moments (results). Static when the user prefers reduced motion. */
export function Count({ to, from = 0, duration = 1 }: { to: number; from?: number; duration?: number }) {
  const reduce = useReducedMotion()
  if (reduce) return <>{to}</>
  return <CountUp to={to} from={from} duration={duration} trigger="load" />
}

export function fmtDuration(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${m}:${String(sec).padStart(2, '0')}`
}

export const pct = (n: number) => `${Math.round(n * 100)}%`
