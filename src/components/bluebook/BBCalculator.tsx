import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Desmos API key, inlined at build time from VITE_DESMOS_API_KEY.
 * Falls back to Desmos's public demo key (from their docs) so local dev works without one.
 */
const API_KEY = (import.meta.env.VITE_DESMOS_API_KEY as string | undefined) || 'dcb31709b452b1cf9dc26972add0fda6'

interface DesmosCalc {
  destroy: () => void
  resize: () => void
}
interface DesmosApi {
  GraphingCalculator: (el: HTMLElement, opts?: Record<string, unknown>) => DesmosCalc
  ScientificCalculator: (el: HTMLElement, opts?: Record<string, unknown>) => DesmosCalc
}

let loading: Promise<DesmosApi> | null = null
function loadDesmos(): Promise<DesmosApi> {
  const w = window as unknown as { Desmos?: DesmosApi }
  if (w.Desmos) return Promise.resolve(w.Desmos)
  loading ??= new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = `https://www.desmos.com/api/v1.11/calculator.js?apiKey=${API_KEY}`
    s.async = true
    s.onload = () => (w.Desmos ? resolve(w.Desmos) : reject(new Error('Desmos failed to load')))
    s.onerror = () => {
      loading = null
      reject(new Error('Desmos failed to load'))
    }
    document.head.appendChild(s)
  })
  return loading
}

/** Left-docked Desmos panel, styled after the in-app calculator. Stays mounted while closed so work persists. */
export function BBCalculator({ open, width, onWidth, onClose }: { open: boolean; width: number; onWidth: (w: number) => void; onClose: () => void }) {
  const [mode, setMode] = useState<'graphing' | 'scientific'>('graphing')
  const [error, setError] = useState(false)
  const graphEl = useRef<HTMLDivElement>(null)
  const sciEl = useRef<HTMLDivElement>(null)
  const calcs = useRef<{ graph?: DesmosCalc; sci?: DesmosCalc }>({})
  const [started, setStarted] = useState(open)
  if (open && !started) setStarted(true)

  useEffect(() => {
    if (!started) return
    let dead = false
    loadDesmos()
      .then((D) => {
        if (dead) return
        if (graphEl.current && !calcs.current.graph)
          calcs.current.graph = D.GraphingCalculator(graphEl.current, { expressionsCollapsed: false, border: false, settingsMenu: true, zoomButtons: true })
        if (sciEl.current && !calcs.current.sci) calcs.current.sci = D.ScientificCalculator(sciEl.current)
      })
      .catch(() => !dead && setError(true))
    return () => {
      dead = true
    }
  }, [started])

  useEffect(
    () => () => {
      calcs.current.graph?.destroy()
      calcs.current.sci?.destroy()
    },
    [],
  )

  useEffect(() => {
    calcs.current.graph?.resize()
    calcs.current.sci?.resize()
  }, [width, mode, open])

  const onResize = (e: React.PointerEvent) => {
    e.preventDefault()
    const grab = e.clientX - width
    const move = (ev: PointerEvent) => onWidth(Math.min(Math.max(320, ev.clientX - grab), window.innerWidth - 420))
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      document.body.style.cursor = ''
    }
    document.body.style.cursor = 'ew-resize'
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  if (!started) return null

  return (
    <aside
      className={cn('fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[#c4c4c4] bg-white shadow-[2px_0_8px_rgba(0,0,0,0.12)]', !open && 'hidden')}
      style={{ width }}
      aria-label="Calculator"
    >
      <div className="flex h-[3.875rem] shrink-0 items-center bg-[#151515] px-2.5">
        <div className="flex overflow-hidden rounded-[0.375rem] border border-[#555]">
          {(['graphing', 'scientific'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                'flex h-[1.875rem] items-center gap-1.5 px-2.5 text-[0.9375rem] font-medium capitalize',
                mode === m ? 'bg-white text-[var(--bb-ink)] underline underline-offset-2' : 'bg-[#151515] text-white',
              )}
            >
              {m === 'graphing' ? (
                <svg viewBox="0 0 20 16" className="h-3.5 w-4 fill-none stroke-current stroke-[1.6]" aria-hidden>
                  <path d="M1 1v14M1 8h18M2 13c3-11 5-11 8-5s5 6 8-5" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 18" className="h-4 w-3.5 fill-none stroke-current stroke-[1.4]" aria-hidden>
                  <rect x="1" y="1" width="14" height="16" rx="1.5" />
                  <path d="M4 4h8v3H4zM4 10h1M7.5 10h1M11 10h1M4 13h1M7.5 13h1M11 13h1" />
                </svg>
              )}
              {m}
            </button>
          ))}
        </div>
        <span className="mx-auto grid grid-cols-3 gap-[3px]" aria-hidden>
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="size-[0.25rem] rounded-full bg-white" />
          ))}
        </span>
        <button type="button" onClick={onClose} aria-label="Close calculator" className="grid size-9 place-items-center text-white">
          <X className="size-6" strokeWidth={1.75} />
        </button>
      </div>
      <div className="relative min-h-0 flex-1">
        <div ref={graphEl} className={cn('absolute inset-0', mode !== 'graphing' && 'invisible')} />
        <div ref={sciEl} className={cn('absolute inset-0', mode !== 'scientific' && 'invisible')} />
        {error && (
          <div className="absolute inset-0 grid place-items-center bg-white p-6 text-center text-sm">
            <p>
              Couldn’t load the Desmos calculator.{' '}
              <a className="text-[var(--bb-blue)] underline" href="https://www.desmos.com/calculator" target="_blank" rel="noreferrer">
                Open it in a new tab
              </a>
              .
            </p>
          </div>
        )}
      </div>
      <button
        type="button"
        aria-label="Resize calculator"
        onPointerDown={onResize}
        className="absolute -right-[0.6875rem] bottom-1 z-10 grid size-[1.375rem] cursor-ew-resize place-items-center rounded-full border border-[#c4c4c4] bg-white"
      >
        <svg viewBox="0 0 12 12" className="size-3 fill-none stroke-[var(--bb-ink)] stroke-[1.6]" aria-hidden>
          <path d="M2 2l8 8M2 2h3.5M2 2v3.5M10 10H6.5M10 10V6.5" />
        </svg>
      </button>
    </aside>
  )
}
