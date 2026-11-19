import { useSyncExternalStore } from 'react'
import { toast } from 'sonner'
import type { Answer } from './grading'
import type { Section } from '../data/types'

export interface Attempt {
  qid: string
  correct: boolean
  answer: Answer
  ts: number
  ms: number
  mode: 'practice' | 'test'
}

export interface TestModuleResult {
  section: Section
  label: string
  route?: 'harder' | 'easier'
  qids: string[]
  answers: Record<string, Answer>
}

export interface TestRecord {
  id: string
  ts: number
  kind: string
  title: string
  modules: TestModuleResult[]
  scores: { rw: number | null; math: number | null }
  durationMs: number
}

export interface ActiveModule {
  section: Section
  label: string
  stage: 1 | 2
  count: number
  minutes: number
  route?: 'harder' | 'easier'
  qids: string[]
  answers: Record<string, Answer>
  marked: string[]
  eliminated: Record<string, number[]>
  /** ms spent on each question */
  time: Record<string, number>
  startedAt?: number
  /** wall-clock deadline while running; undefined while paused */
  deadline?: number
  /** time left when paused */
  remainingMs?: number
  finishedAt?: number
}

export interface ActiveTest {
  id: string
  kind: string
  title: string
  createdAt: number
  current: number
  /** index of the question currently shown in the current module */
  cursor: number
  modules: ActiveModule[]
  /** Bumped on every change; the server rejects saves based on an older revision. */
  rev?: number
}

export interface User {
  id: string
  name: string | null
  email: string | null
  slackId: string | null
}

export interface StoreState {
  status: 'loading' | 'anon' | 'authed' | 'error'
  user: User | null
  attempts: Attempt[]
  bookmarks: string[]
  tests: TestRecord[]
  active: ActiveTest | null
  /** unsynced changes waiting for the network */
  pending: number
  /** progress found in this browser from the pre-account version */
  legacy: { attempts: number; tests: number } | null
}

const empty = (): Omit<StoreState, 'status' | 'user' | 'pending' | 'legacy'> => ({ attempts: [], bookmarks: [], tests: [], active: null })

let state: StoreState = { status: 'loading', user: null, pending: 0, legacy: null, ...empty() }
const listeners = new Set<() => void>()

function setState(fn: (s: StoreState) => StoreState) {
  state = fn(state)
  listeners.forEach((l) => l())
}

export function getState() {
  return state
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useStore<T>(select: (s: StoreState) => T): T {
  return useSyncExternalStore(subscribe, () => select(state))
}

// ---- network -------------------------------------------------------------------

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: 'same-origin',
    ...init,
    headers: { accept: 'application/json', ...(init.body ? { 'content-type': 'application/json' } : {}), ...init.headers },
  })
  if (res.status === 401) {
    setState((s) => ({ ...s, status: 'anon', user: null }))
    throw new ApiError(401, 'Signed out')
  }
  if (!res.ok) throw new ApiError(res.status, `Request failed (${res.status})`)
  return (res.status === 204 ? null : await res.json()) as T
}

/**
 * Outbox: writes are applied to local state immediately, then sent to the server in order.
 * Failed sends retry with backoff and survive reloads via localStorage.
 */
interface Op {
  method: 'POST' | 'PUT' | 'DELETE'
  path: string
  body?: unknown
}
const OUTBOX_KEY = 'satori.outbox'
/** Unsynced ops are tagged with the user they belong to, so they never replay into another account. */
let outboxOwner: string | null = null
let outbox: Op[] = (() => {
  try {
    const saved = JSON.parse(localStorage.getItem(OUTBOX_KEY) ?? 'null') as { owner: string; ops: Op[] } | null
    outboxOwner = saved?.owner ?? null
    return Array.isArray(saved?.ops) ? saved.ops : []
  } catch {
    return []
  }
})()
let flushing = false
let retryDelay = 2000

function saveOutbox() {
  try {
    localStorage.setItem(OUTBOX_KEY, JSON.stringify({ owner: outboxOwner ?? state.user?.id ?? null, ops: outbox }))
  } catch {
    /* ignore */
  }
  setState((s) => (s.pending === outbox.length ? s : { ...s, pending: outbox.length }))
}

function enqueue(op: Op) {
  // Only the latest autosave of the active test matters
  if (op.path === '/active') outbox = outbox.filter((o) => o.path !== '/active')
  outbox.push(op)
  saveOutbox()
  void flush()
}

async function flush() {
  if (flushing || state.status !== 'authed') return
  flushing = true
  try {
    while (outbox.length) {
      const op = outbox[0]
      try {
        await api(op.path, { method: op.method, body: op.body === undefined ? undefined : JSON.stringify(op.body) })
      } catch (e) {
        if (e instanceof ApiError && e.status === 409 && (op.path === '/active' || op.path === '/tests')) {
          // This copy of the test is outdated (another tab or an older reload). Drop it and load the latest.
          outbox.shift()
          saveOutbox()
          void resync()
          continue
        }
        if (e instanceof ApiError && e.status >= 400 && e.status < 500 && e.status !== 401 && e.status !== 408 && e.status !== 429) {
          console.warn('[sync] dropping rejected change', op.path, e.status)
        } else {
          setTimeout(() => void flush(), retryDelay)
          retryDelay = Math.min(retryDelay * 2, 60_000)
          return
        }
      }
      outbox.shift()
      retryDelay = 2000
      saveOutbox()
    }
  } finally {
    flushing = false
  }
}

window.addEventListener('online', () => void flush())

/** Replace local state with the server's (after a rejected stale write). */
async function resync() {
  try {
    const data = await api<Pick<StoreState, 'attempts' | 'bookmarks' | 'tests' | 'active'>>('/state')
    cancelActiveSave()
    setState((s) => ({ ...s, ...data }))
    toast.info('This test changed in another tab or session, so the latest saved version was loaded.')
  } catch (e) {
    console.error('[sync] resync failed', e)
  }
}

// Debounced autosave for the in-progress test
let activeTimer: ReturnType<typeof setTimeout> | undefined
function scheduleActiveSave() {
  clearTimeout(activeTimer)
  activeTimer = setTimeout(() => {
    activeTimer = undefined
    if (state.active) enqueue({ method: 'PUT', path: '/active', body: state.active })
  }, 800)
}
function cancelActiveSave() {
  clearTimeout(activeTimer)
  activeTimer = undefined
  outbox = outbox.filter((o) => o.path !== '/active')
  saveOutbox()
}
window.addEventListener('pagehide', () => {
  if (activeTimer && state.active) {
    clearTimeout(activeTimer)
    void fetch('/api/active', {
      method: 'PUT',
      keepalive: true,
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(state.active),
    })
  }
})

// ---- boot ----------------------------------------------------------------------

const LEGACY_KEY = 'satori.v1'

function readLegacy(): { attempts: Attempt[]; bookmarks: string[]; tests: TestRecord[] } | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return null
    const p = JSON.parse(raw)
    if (!p?.attempts?.length && !p?.tests?.length) return null
    return { attempts: p.attempts ?? [], bookmarks: p.bookmarks ?? [], tests: p.tests ?? [] }
  } catch {
    return null
  }
}

export async function boot() {
  try {
    const me = await fetch('/api/me', { credentials: 'same-origin' })
    if (me.status === 401) return setState((s) => ({ ...s, status: 'anon', user: null }))
    if (!me.ok) throw new Error(String(me.status))
    const { user } = (await me.json()) as { user: User }
    const data = await api<Pick<StoreState, 'attempts' | 'bookmarks' | 'tests' | 'active'>>('/state')
    const legacy = readLegacy()
    if (outboxOwner && outboxOwner !== user.id) outbox = []
    outboxOwner = user.id
    // An autosave that never reached the server is newer than the server's copy; keep it.
    const pending = [...outbox].reverse().find((o) => o.path === '/active' && o.method === 'PUT')?.body as ActiveTest | undefined
    if (pending && data.active && pending.id === data.active.id && (pending.rev ?? 0) > (data.active.rev ?? 0)) data.active = pending
    setState((s) => ({
      ...s,
      status: 'authed',
      user,
      ...data,
      legacy: legacy ? { attempts: legacy.attempts.length, tests: legacy.tests.length } : null,
    }))
    void flush()
  } catch (e) {
    console.error('[boot]', e)
    setState((s) => ({ ...s, status: 'error' }))
  }
}

export function signIn(returnTo = window.location.pathname + window.location.search) {
  window.location.href = `/auth/login?return_to=${encodeURIComponent(returnTo)}`
}

export async function signOut() {
  await fetch('/auth/logout', { method: 'POST', credentials: 'same-origin' })
  outbox = []
  saveOutbox()
  window.location.href = '/'
}

// ---- actions -------------------------------------------------------------------

export function recordAttempt(a: Attempt) {
  setState((s) => ({ ...s, attempts: [...s.attempts, a] }))
  enqueue({ method: 'POST', path: '/attempts', body: { attempts: [a] } })
}

export function toggleBookmark(qid: string) {
  const on = state.bookmarks.includes(qid)
  setState((s) => ({ ...s, bookmarks: on ? s.bookmarks.filter((b) => b !== qid) : [...s.bookmarks, qid] }))
  enqueue({ method: on ? 'DELETE' : 'PUT', path: `/bookmarks/${encodeURIComponent(qid)}` })
}

export function setActive(active: ActiveTest | null) {
  if (active) active = { ...active, rev: active.rev ?? 1 }
  setState((s) => ({ ...s, active }))
  if (active) {
    cancelActiveSave()
    enqueue({ method: 'PUT', path: '/active', body: active })
  } else {
    cancelActiveSave()
    enqueue({ method: 'DELETE', path: '/active' })
  }
}

/** A test counts as in progress only once its first module has actually started. */
export const hasStarted = (t: ActiveTest | null): t is ActiveTest => !!t?.modules.some((m) => m.startedAt)

export function updateActive(fn: (a: ActiveTest) => ActiveTest) {
  setState((s) => (s.active ? { ...s, active: { ...fn(s.active), rev: (s.active.rev ?? 0) + 1 } } : s))
  scheduleActiveSave()
}

/** Save a finished test with its graded answers; clears the in-progress test server-side. */
export function saveTest(rec: TestRecord, list: Attempt[], rev?: number) {
  cancelActiveSave()
  setState((s) => ({ ...s, tests: [rec, ...s.tests], attempts: [...s.attempts, ...list], active: null }))
  enqueue({ method: 'POST', path: '/tests', body: { test: rec, attempts: list, rev } })
}

async function importPayload(p: { attempts: Attempt[]; bookmarks: string[]; tests: TestRecord[] }) {
  await api('/import', { method: 'POST', body: JSON.stringify({ attempts: p.attempts, bookmarks: p.bookmarks, tests: p.tests }) })
  const data = await api<Pick<StoreState, 'attempts' | 'bookmarks' | 'tests' | 'active'>>('/state')
  setState((s) => ({ ...s, ...data }))
}

/** Move progress saved by the old browser-only version into the account. */
export async function importLegacy() {
  const legacy = readLegacy()
  if (legacy) await importPayload(legacy)
  dismissLegacy()
}

export function dismissLegacy() {
  try {
    localStorage.removeItem(LEGACY_KEY)
  } catch {
    /* ignore */
  }
  setState((s) => ({ ...s, legacy: null }))
}

export async function resetAll() {
  outbox = []
  saveOutbox()
  cancelActiveSave()
  await api('/data', { method: 'DELETE' })
  setState((s) => ({ ...s, ...empty() }))
}

// ---- derived helpers ---------------------------------------------------------------

/** Most recent attempt per question. */
export function latestByQuestion(attempts: Attempt[]): Map<string, Attempt> {
  const m = new Map<string, Attempt>()
  for (const a of attempts) m.set(a.qid, a)
  return m
}

export function dayKey(ts: number) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

export function streak(attempts: Attempt[]): number {
  if (!attempts.length) return 0
  const days = new Set(attempts.map((a) => dayKey(a.ts)))
  const d = new Date()
  if (!days.has(dayKey(d.getTime()))) d.setDate(d.getDate() - 1)
  let n = 0
  while (days.has(dayKey(d.getTime()))) {
    n++
    d.setDate(d.getDate() - 1)
  }
  return n
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
