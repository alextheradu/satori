import { BY_ID, pickBalanced } from '@/data/bank'
import type { Section } from '@/data/types'
import { estimateSection, isCorrect } from './grading'
import { saveTest, setActive, uid, type ActiveModule, type ActiveTest, type TestRecord } from './store'

interface ModuleSpec {
  section: Section
  label: string
  stage: 1 | 2
  count: number
  minutes: number
}

export interface TestKind {
  kind: string
  title: string
  blurb: string
  modules: ModuleSpec[]
}

const RW1: ModuleSpec = { section: 'rw', label: 'Reading and Writing · Module 1', stage: 1, count: 27, minutes: 32 }
const RW2: ModuleSpec = { section: 'rw', label: 'Reading and Writing · Module 2', stage: 2, count: 27, minutes: 32 }
const M1: ModuleSpec = { section: 'math', label: 'Math · Module 1', stage: 1, count: 22, minutes: 35 }
const M2: ModuleSpec = { section: 'math', label: 'Math · Module 2', stage: 2, count: 22, minutes: 35 }

export const TEST_KINDS: TestKind[] = [
  {
    kind: 'diagnostic',
    title: 'Diagnostic',
    blurb: 'A short, timed sampler across every domain. Great first step to find your baseline.',
    modules: [
      { section: 'rw', label: 'Reading and Writing', stage: 1, count: 10, minutes: 12 },
      { section: 'math', label: 'Math', stage: 1, count: 8, minutes: 13 },
    ],
  },
  {
    kind: 'full',
    title: 'Full-length practice test',
    blurb: 'Four adaptive modules timed like test day. Your Module 1 results decide how hard Module 2 is.',
    modules: [RW1, RW2, M1, M2],
  },
  {
    kind: 'rw',
    title: 'Reading & Writing section',
    blurb: 'Both adaptive RW modules: 54 questions in 64 minutes.',
    modules: [RW1, RW2],
  },
  {
    kind: 'math',
    title: 'Math section',
    blurb: 'Both adaptive Math modules: 44 questions in 70 minutes. Calculator allowed throughout.',
    modules: [M1, M2],
  },
]

export const totalMinutes = (k: TestKind) => k.modules.reduce((s, m) => s + m.minutes, 0)
export const totalQuestions = (k: TestKind) => k.modules.reduce((s, m) => s + m.count, 0)

export function startTest(kind: string): ActiveTest {
  const k = TEST_KINDS.find((t) => t.kind === kind)!
  const active: ActiveTest = {
    id: uid(),
    kind,
    title: k.title,
    createdAt: Date.now(),
    current: 0,
    cursor: 0,
    modules: k.modules.map((m) => ({ ...m, qids: [], answers: {}, marked: [], eliminated: {}, time: {} })),
  }
  setActive(active)
  return active
}

/** Pick questions for a module when it begins (module 2 adapts to module 1). */
export function prepareModule(t: ActiveTest, idx: number): ActiveModule {
  const m = t.modules[idx]
  const used = new Set(t.modules.flatMap((x) => x.qids))
  let route: ActiveModule['route']
  if (m.stage === 2) {
    const first = t.modules.find((x) => x.section === m.section && x.stage === 1)
    if (first) {
      const correct = first.qids.filter((id) => isCorrect(BY_ID.get(id)!, first.answers[id] ?? null)).length
      route = correct / Math.max(1, first.qids.length) >= 0.6 ? 'harder' : 'easier'
    }
  }
  const qids = pickBalanced(m.section, m.count, used, route ?? 'mixed').map((q) => q.id)
  const now = Date.now()
  return { ...m, route, qids, startedAt: now, deadline: now + m.minutes * 60_000 }
}

export function finishTest(t: ActiveTest): TestRecord {
  const scoreFor = (section: Section) => {
    const mods = t.modules.filter((m) => m.section === section)
    if (!mods.length) return null
    const items = mods.flatMap((m) =>
      m.qids.map((id) => {
        const q = BY_ID.get(id)!
        return { difficulty: q.difficulty, correct: isCorrect(q, m.answers[id] ?? null) }
      }),
    )
    return estimateSection(items, mods.some((m) => m.route === 'easier'))
  }
  const rec: TestRecord = {
    id: t.id,
    ts: Date.now(),
    kind: t.kind,
    title: t.title,
    modules: t.modules.map((m) => ({ section: m.section, label: m.label, route: m.route, qids: m.qids, answers: m.answers })),
    scores: { rw: scoreFor('rw'), math: scoreFor('math') },
    durationMs: t.modules.reduce((s, m) => s + ((m.finishedAt ?? m.startedAt ?? 0) - (m.startedAt ?? 0)), 0),
  }
  const now = Date.now()
  const graded = t.modules.flatMap((m) =>
    m.qids.map((id) => {
      const a = m.answers[id] ?? null
      return { qid: id, answer: a, correct: isCorrect(BY_ID.get(id)!, a), ts: now, ms: Math.round(m.time?.[id] ?? 0), mode: 'test' as const }
    }),
  )
  saveTest(rec, graded, t.rev)
  return rec
}

