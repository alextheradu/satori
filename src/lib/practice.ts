import { QUESTIONS, shuffle } from '@/data/bank'
import type { Difficulty, Domain, Question, Section } from '@/data/types'
import { getState, latestByQuestion, type Attempt } from './store'

export interface PracticeOpts {
  section?: Section | 'both'
  domains?: Domain[]
  skills?: string[]
  difficulties?: Difficulty[]
  count?: number
  filter?: 'all' | 'unseen' | 'missed'
  mode?: 'smart'
}

/** URL that starts a practice session directly with these options. */
export function practiceUrl(o: PracticeOpts) {
  const p = new URLSearchParams()
  if (o.section && o.section !== 'both') p.set('section', o.section)
  if (o.domains?.length) p.set('domains', o.domains.join('|'))
  if (o.skills?.length) p.set('skills', o.skills.join('|'))
  if (o.difficulties?.length) p.set('diff', o.difficulties.join('|'))
  if (o.count) p.set('count', String(o.count))
  if (o.filter && o.filter !== 'all') p.set('filter', o.filter)
  if (o.mode) p.set('mode', o.mode)
  return `/practice/session?${p}`
}

export const idsUrl = (ids: string[]) => `/practice/session?ids=${ids.join(',')}`

export function parsePracticeParams(p: URLSearchParams): PracticeOpts {
  const list = (k: string) => p.get(k)?.split('|').filter(Boolean)
  return {
    section: (p.get('section') as Section) ?? 'both',
    domains: list('domains') as Domain[] | undefined,
    skills: list('skills'),
    difficulties: list('diff') as Difficulty[] | undefined,
    count: p.get('count') ? Number(p.get('count')) : undefined,
    filter: (p.get('filter') as PracticeOpts['filter']) ?? 'all',
    mode: p.get('mode') === 'smart' ? 'smart' : undefined,
  }
}

export function matchPool(o: PracticeOpts, attempts: Attempt[]): Question[] {
  const latest = latestByQuestion(attempts)
  return QUESTIONS.filter((q) => {
    if (o.section && o.section !== 'both' && q.section !== o.section) return false
    if (o.domains?.length && !o.domains.includes(q.domain)) return false
    if (o.skills?.length && !o.skills.includes(q.skill)) return false
    if (o.difficulties?.length && !o.difficulties.includes(q.difficulty)) return false
    if (o.filter === 'unseen' && latest.has(q.id)) return false
    if (o.filter === 'missed' && (!latest.has(q.id) || latest.get(q.id)!.correct)) return false
    return true
  })
}

/** Choose question ids for a session. Smart mode: missed first, then unseen, then least-recently seen. */
export function buildSession(o: PracticeOpts): string[] {
  const attempts = getState().attempts
  const pool = matchPool(o, attempts)
  const count = o.count ?? 10
  const latest = latestByQuestion(attempts)
  if (o.mode === 'smart') {
    const rank = (q: Question) => {
      const a = latest.get(q.id)
      if (a && !a.correct) return Math.random()
      if (!a) return 1 + Math.random()
      return 2 + a.ts / Date.now()
    }
    return pool
      .map((q) => ({ q, r: rank(q) }))
      .sort((a, b) => a.r - b.r)
      .slice(0, count)
      .map((x) => x.q.id)
  }
  const unseen = shuffle(pool.filter((q) => !latest.has(q.id)))
  const seen = shuffle(pool.filter((q) => latest.has(q.id)))
  return [...unseen, ...seen].slice(0, count).map((q) => q.id)
}
