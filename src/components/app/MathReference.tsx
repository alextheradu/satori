import { Markup } from '@/lib/Markup'

const FORMULAS: [string, string][] = [
  ['Circle', '$A = \\pi r^2$  ·  $C = 2\\pi r$'],
  ['Rectangle', '$A = \\ell w$'],
  ['Triangle', '$A = \\frac{1}{2}bh$'],
  ['Pythagorean theorem', '$c^2 = a^2 + b^2$'],
  ['30°-60°-90° triangle', 'sides $x$, $x\\sqrt{3}$, $2x$'],
  ['45°-45°-90° triangle', 'sides $s$, $s$, $s\\sqrt{2}$'],
  ['Rectangular prism', '$V = \\ell wh$'],
  ['Cylinder', '$V = \\pi r^2 h$'],
  ['Sphere', '$V = \\frac{4}{3}\\pi r^3$'],
  ['Cone', '$V = \\frac{1}{3}\\pi r^2 h$'],
  ['Pyramid', '$V = \\frac{1}{3}\\ell wh$'],
]

const FACTS = [
  'A circle has $360$ degrees of arc, or $2\\pi$ radians.',
  'The angles of a triangle add up to $180^\\circ$.',
]

export function MathReference() {
  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {FORMULAS.map(([name, f]) => (
          <div key={name} className="rounded-xl border bg-card px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{name}</p>
            <Markup text={f} className="mt-1.5" />
          </div>
        ))}
      </div>
      <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
        {FACTS.map((f) => (
          <li key={f}>
            <Markup text={f} />
          </li>
        ))}
      </ul>
    </div>
  )
}
