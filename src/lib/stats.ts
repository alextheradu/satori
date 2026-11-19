import { BY_ID, DOMAINS } from '../data/bank'
import type { Domain, Section } from '../data/types'
import { estimateSection } from './grading'
import { dayKey, type Attempt } from './store'

export interface Tally {
  total: number
  correct: number
}

export function tally(attempts: Attempt[]): Tally {
  return { total: attempts.length, correct: attempts.filter((a) => a.correct).length }
}

export function bySection(attempts: Attempt[], section: Section) {
  return attempts.filter((a) => BY_ID.get(a.qid)?.section === section)
}

export function domainBreakdown(attempts: Attempt[], section: Section) {
  return DOMAINS[section].map((d: Domain) => {
    const list = attempts.filter((a) => BY_ID.get(a.qid)?.domain === d)
    return { domain: d, ...tally(list) }
  })
}

/** Estimate from the most recent 40 attempts in a section (needs at least 8). */
export function practiceEstimate(attempts: Attempt[], section: Section): number | null {
  const recent = bySection(attempts, section).slice(-40)
  if (recent.length < 8) return null
  return estimateSection(
    recent.map((a) => ({ difficulty: BY_ID.get(a.qid)!.difficulty, correct: a.correct })),
  )
}

/** Weakest skills by accuracy (min 2 attempts). */
export function weakestSkills(attempts: Attempt[], n = 4) {
  const m = new Map<string, { skill: string; section: Section; total: number; correct: number }>()
  for (const a of attempts) {
    const q = BY_ID.get(a.qid)
    if (!q) continue
    const e = m.get(q.skill) ?? { skill: q.skill, section: q.section, total: 0, correct: 0 }
    e.total++
    if (a.correct) e.correct++
    m.set(q.skill, e)
  }
  return [...m.values()]
    .filter((e) => e.total >= 2 && e.correct / e.total < 0.8)
    .sort((a, b) => a.correct / a.total - b.correct / b.total)
    .slice(0, n)
}

/** Questions per day that count toward the daily goal. */
export const DAILY_GOAL = 20

/** Questions answered today (practice and tests). */
export function answeredToday(attempts: Attempt[]): number {
  const today = dayKey(Date.now())
  let n = 0
  for (let i = attempts.length - 1; i >= 0; i--) if (dayKey(attempts[i].ts) === today) n++
  return n
}

/** The last 7 days, oldest first, with whether any question was answered that day. */
export function lastWeek(attempts: Attempt[]): { label: string; active: boolean; today: boolean }[] {
  const days = new Set(attempts.map((a) => dayKey(a.ts)))
  const out: { label: string; active: boolean; today: boolean }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    out.push({
      label: d.toLocaleDateString(undefined, { weekday: 'narrow' }),
      active: days.has(dayKey(d.getTime())),
      today: i === 0,
    })
  }
  return out
}
