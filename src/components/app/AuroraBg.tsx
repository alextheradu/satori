import { useTheme } from 'next-themes'
import Aurora from '@/components/reactbits/Aurora'

/** Animated aurora behind the Home hero, tuned per theme. */
export function AuroraBg({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme()
  const dark = resolvedTheme === 'dark'
  return (
    <Aurora
      key={dark ? 'd' : 'l'}
      className={className}
      colorStops={dark ? ['#4f3df5', '#21b5e3', '#8b5cf6'] : ['#8b7cf6', '#67d4f2', '#b49cff']}
      lightMode={!dark}
      amplitude={1.1}
      blend={0.6}
      speed={0.6}
      opacity={dark ? 0.9 : 0.55}
    />
  )
}
