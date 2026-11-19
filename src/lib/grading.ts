import type { Difficulty, Question, Section } from '../data/types'
import { isSprEntry, matchesSprAnswer, sprEntries } from './spr.mjs'

export type Answer = number | string | null

/** Parse "3/4", "-1.5", ".75" → number, or null if not numeric. */
export function parseNumeric(raw: string): number | null {
  const s = raw.replace(/\s+/g, '').replace(/−/g, '-')
  if (!s) return null
  const frac = /^(-?)(\d+(?:\.\d+)?|\.\d+)\/(\d+(?:\.\d+)?|\.\d+)$/.exec(s)
  if (frac) {
    const den = Number(frac[3])
    if (!den) return null
    return (frac[1] ? -1 : 1) * (Number(frac[2]) / den)
  }
  if (/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return Number(s)
  return null
}

export function isCorrect(q: Question, a: Answer): boolean {
  if (a === null || a === undefined || a === '') return false
  if (typeof q.answer === 'number') return a === q.answer
  const input = String(a).trim()
  return q.answer.some((acc) => matchesSprAnswer(acc, input))
}

export function formatAnswer(_q: Question, a: Answer): string {
  if (a === null || a === '') return 'Skipped'
  if (typeof a === 'number') return 'ABCD'[a] ?? '?'
  return a
}

export function correctLabel(q: Question): string {
  if (typeof q.answer === 'number') return 'ABCD'[q.answer]
  const exact = q.answer[0]
  const entry = sprEntries(exact)[0]
  return isSprEntry(exact) || !entry ? exact : `${exact} (enter ${entry})`
}

const WEIGHT: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3 }

/**
 * Rough 200–800 section estimate from a set of graded items.
 * Difficulty-weighted accuracy, nudged down when the sample is mostly easy questions.
 * It is an estimate only; it is not the official College Board scoring.
 */
export function estimateSection(items: { difficulty: Difficulty; correct: boolean }[], easyRoute = false): number | null {
  if (!items.length) return null
  let earned = 0
  let possible = 0
  for (const it of items) {
    possible += WEIGHT[it.difficulty]
    if (it.correct) earned += WEIGHT[it.difficulty]
  }
  // How demanding the set was: 1 (all easy) .. 3 (all hard) → ceiling 650..800
  const avgW = possible / items.length
  const ceiling = 650 + ((avgW - 1) / 2) * 150
  let pct = earned / possible
  if (easyRoute) pct *= 0.85
  const raw = 200 + (Math.min(ceiling, 800) - 200) * pct
  return Math.max(200, Math.min(800, Math.round(raw / 10) * 10))
}

export const SECTION_LABEL: Record<Section, string> = {
  rw: 'Reading & Writing',
  math: 'Math',
}
