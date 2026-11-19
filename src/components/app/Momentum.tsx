import { Check, Flame } from 'lucide-react'
import { DAILY_GOAL, answeredToday, lastWeek } from '@/lib/stats'
import { streak, useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

/** Streak, the last 7 days, and today's goal. The motivation lives here, never on a question screen. */
export function Momentum({ className, compact }: { className?: string; compact?: boolean }) {
  const attempts = useStore((s) => s.attempts)
  const days = streak(attempts)
  const today = answeredToday(attempts)
  const week = lastWeek(attempts)
  const lit = week[6].active
  const done = today >= DAILY_GOAL
  const frac = Math.min(1, today / DAILY_GOAL)

  return (
    <div className={cn('grid gap-6 rounded-2xl border bg-card p-5 sm:p-6', !compact && 'md:grid-cols-[auto_1fr_minmax(0,16rem)] md:items-center md:gap-10', className)}>
      <div className="flex items-center gap-3.5">
        <span
          className={cn(
            'grid size-12 shrink-0 place-items-center rounded-2xl transition-colors duration-300',
            lit ? 'bg-streak/15 text-streak' : 'bg-muted text-muted-foreground',
          )}
        >
          <Flame className={cn('size-6', lit && 'fill-current')} strokeWidth={1.75} />
        </span>
        <div>
          <p className="text-3xl leading-none font-semibold tracking-tight tabular-nums">{days}</p>
          <p className="mt-1 text-sm text-muted-foreground">day streak</p>
        </div>
      </div>

      <ol className="flex justify-between gap-1.5 sm:justify-start sm:gap-3" aria-label="Practice in the last 7 days">
        {week.map((d, i) => (
          <li key={i} className="flex flex-col items-center gap-1.5">
            <span
              className={cn(
                'grid size-8 place-items-center rounded-full border text-xs transition-colors',
                d.active ? 'border-transparent bg-streak text-white dark:text-background' : 'border-dashed text-muted-foreground',
                d.today && !d.active && 'border-solid border-foreground/30',
              )}
              aria-label={`${d.today ? 'Today' : d.label}: ${d.active ? 'practiced' : 'no practice'}`}
            >
              {d.active ? <Check className="size-3.5" strokeWidth={3} /> : null}
            </span>
            <span className={cn('text-[11px] text-muted-foreground', d.today && 'font-semibold text-foreground')}>{d.label}</span>
          </li>
        ))}
      </ol>

      <div>
        <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
          <span className="font-medium">{done ? 'Daily goal met' : 'Daily goal'}</span>
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {Math.min(today, 999)}/{DAILY_GOAL}
          </span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={DAILY_GOAL}
          aria-valuenow={Math.min(today, DAILY_GOAL)}
          aria-label="Questions answered today"
        >
          <div
            className={cn('h-full origin-left rounded-full transition-transform duration-500 ease-(--ease-out-quint)', done ? 'bg-success' : 'bg-primary')}
            style={{ transform: `scaleX(${frac})` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {done
            ? 'Nice. Anything more today is a bonus.'
            : today === 0 && days > 0
              ? 'Answer one question today to keep your streak.'
              : today === 0
                ? 'One question starts a streak.'
                : `${DAILY_GOAL - today} to go.`}
        </p>
      </div>
    </div>
  )
}
