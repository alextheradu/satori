
import { useId } from 'react'

/** Circular gauge for a 400–1600 (or 200–800) score. */
export function ScoreRing({
  value,
  min = 400,
  max = 1600,
  size = 180,
  label = 'Estimated score',
}: {
  value: number | null
  min?: number
  max?: number
  size?: number
  label?: string
}) {
  const id = useId()
  const stroke = 12
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const arc = 0.75 // 270° gauge
  const frac = value === null ? 0 : Math.max(0, Math.min(1, (value - min) / (max - min)))
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-[225deg]" aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" />
            <stop offset="100%" stopColor="var(--chart-2)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * arc} ${c}`}
        />
        {frac > 0 && <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * arc * frac} ${c}`}
          className="transition-[stroke-dasharray] duration-700 ease-(--ease-out-quint)"
        />}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-5xl leading-none tabular-nums" style={{ fontSize: size / 3.6 }}>
            {value === null ? <span className="text-muted-foreground">–</span> : value}
          </div>
          <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  )
}
