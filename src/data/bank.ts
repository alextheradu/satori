import type { Difficulty, Domain, Question, Section } from './types'
import { MATH_DOMAINS, RW_DOMAINS } from './types'

const modules = import.meta.glob<{ default: Question[] }>('./questions/*.json', { eager: true })
const retiredModules = import.meta.glob<{ default: Question[] }>('./retired/*.json', { eager: true })

export const QUESTIONS: Question[] = Object.keys(modules)
  .sort()
  .flatMap((k) => modules[k].default)

// Historical attempts keep their original question and key after a repeat is retired.
const retiredQuestions = Object.keys(retiredModules).sort().flatMap((key) => retiredModules[key].default)
export const BY_ID = new Map([...retiredQuestions, ...QUESTIONS].map((q) => [q.id, q]))

export const DOMAINS: Record<Section, readonly Domain[]> = {
  rw: RW_DOMAINS,
  math: MATH_DOMAINS,
}

export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Order the way the Digital SAT does: RW grouped by question type, Math easy → hard. */
const RW_ORDER: Domain[] = [
  'Craft and Structure',
  'Information and Ideas',
  'Standard English Conventions',
  'Expression of Ideas',
]
const DIFF_ORDER: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 }

export function orderForTest(qs: Question[]): Question[] {
  return [...qs].sort((a, b) => {
    if (a.section === 'rw' && b.section === 'rw') {
      const d = RW_ORDER.indexOf(a.domain) - RW_ORDER.indexOf(b.domain)
      if (d) return d
      return a.skill.localeCompare(b.skill) || DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty]
    }
    return DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty]
  })
}

/**
 * Pick `count` questions from a section, balanced across domains and skills within each domain.
 * `bias` shifts difficulty: 'mixed' = balanced, 'harder' prefers hard/medium, 'easier' prefers easy/medium.
 */
export function pickBalanced(
  section: Section,
  count: number,
  exclude: Set<string>,
  bias: 'mixed' | 'harder' | 'easier' = 'mixed',
): Question[] {
  const pool = QUESTIONS.filter((q) => q.section === section && !exclude.has(q.id))
  const score = (q: Question) => {
    const d = DIFF_ORDER[q.difficulty]
    if (bias === 'harder') return -d + Math.random() * 1.2
    if (bias === 'easier') return d + Math.random() * 1.2
    return Math.random()
  }
  const byDomain = DOMAINS[section].map((domain) => {
    const groups = new Map<string, { q: Question; s: number }[]>()
    for (const q of pool) {
      if (q.domain !== domain) continue
      const group = groups.get(q.skill) ?? []
      group.push({ q, s: score(q) })
      groups.set(q.skill, group)
    }
    const skills = shuffle([...groups.values()]).map((group) =>
      group.sort((a, b) => a.s - b.s).map(({ q }) => q),
    )
    // Interleave skills so a large numerical-variant family cannot dominate a module.
    const ordered: Question[] = []
    for (let index = 0; skills.some((skill) => index < skill.length); index++) {
      for (const skill of skills) if (skill[index]) ordered.push(skill[index])
    }
    return ordered
  })
  const picked: Question[] = []
  let i = 0
  while (picked.length < count && byDomain.some((l) => l.length)) {
    const list = byDomain[i % byDomain.length]
    const next = list.shift()
    if (next) picked.push(next)
    i++
  }
  return orderForTest(picked)
}

export function countBy<T extends string>(qs: Question[], key: (q: Question) => T) {
  const m = {} as Record<T, number>
  for (const q of qs) m[key(q)] = (m[key(q)] ?? 0) + 1
  return m
}
