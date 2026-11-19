import { and, asc, desc, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { db } from './db/index.js'
import { activeTests, attempts, bookmarks, tests } from './db/schema.js'
import { requireUser, type AppEnv } from './auth.js'

const qid = z.string().min(1).max(64).regex(/^[a-z0-9-]+$/)
const answer = z.union([z.number().int().min(0).max(3), z.string().max(16), z.null()])

const attemptIn = z.object({
  qid,
  correct: z.boolean(),
  answer,
  ts: z.number().int().positive(),
  ms: z.number().int().min(0).max(86_400_000),
  mode: z.enum(['practice', 'test']),
})

const testIn = z.object({
  id: z.string().min(1).max(64),
  ts: z.number().int().positive(),
  kind: z.string().max(32),
  title: z.string().max(120),
  modules: z
    .array(
      z.object({
        section: z.enum(['rw', 'math']),
        label: z.string().max(120),
        route: z.enum(['harder', 'easier']).optional(),
        qids: z.array(qid).max(60),
        answers: z.record(z.string(), answer),
      }),
    )
    .max(8),
  scores: z.object({ rw: z.number().int().nullable(), math: z.number().int().nullable() }),
  durationMs: z.number().int().min(0),
})

const toDate = (ms: number) => new Date(Math.min(ms, Date.now() + 60_000))

async function parse<T extends z.ZodType>(schema: T, req: Request): Promise<z.infer<T> | null> {
  try {
    const r = schema.safeParse(await req.json())
    return r.success ? r.data : null
  } catch {
    return null
  }
}

export const api = new Hono<AppEnv>()

api.get('/me', (c) => {
  const user = c.get('user')
  return user ? c.json({ user }) : c.json({ user: null }, 401)
})

api.use('*', requireUser)

/** Everything the client needs to render, in one round-trip. */
api.get('/state', async (c) => {
  const userId = c.get('user')!.id
  const [a, b, t, act] = await Promise.all([
    db.select().from(attempts).where(eq(attempts.userId, userId)).orderBy(asc(attempts.ts), asc(attempts.id)),
    db.select().from(bookmarks).where(eq(bookmarks.userId, userId)).orderBy(asc(bookmarks.createdAt)),
    db.select().from(tests).where(eq(tests.userId, userId)).orderBy(desc(tests.ts)),
    db.select().from(activeTests).where(eq(activeTests.userId, userId)),
  ])
  return c.json({
    attempts: a.map((x) => ({ qid: x.qid, correct: x.correct, answer: x.answer ?? null, ts: x.ts.getTime(), ms: x.ms, mode: x.mode })),
    bookmarks: b.map((x) => x.qid),
    tests: t.map((x) => ({
      id: x.id,
      ts: x.ts.getTime(),
      kind: x.kind,
      title: x.title,
      modules: x.modules,
      scores: { rw: x.scoreRw, math: x.scoreMath },
      durationMs: x.durationMs,
    })),
    active: act[0]?.data ?? null,
  })
})

api.post('/attempts', async (c) => {
  const body = await parse(z.object({ attempts: z.array(attemptIn).min(1).max(500) }), c.req.raw)
  if (!body) return c.json({ error: 'invalid' }, 400)
  const userId = c.get('user')!.id
  await db.insert(attempts).values(body.attempts.map((a) => ({ ...a, userId, ts: toDate(a.ts) })))
  return c.body(null, 204)
})

api.put('/bookmarks/:qid', async (c) => {
  const id = qid.safeParse(c.req.param('qid'))
  if (!id.success) return c.json({ error: 'invalid' }, 400)
  await db.insert(bookmarks).values({ userId: c.get('user')!.id, qid: id.data }).onConflictDoNothing()
  return c.body(null, 204)
})

api.delete('/bookmarks/:qid', async (c) => {
  await db.delete(bookmarks).where(and(eq(bookmarks.userId, c.get('user')!.id), eq(bookmarks.qid, c.req.param('qid'))))
  return c.body(null, 204)
})

/**
 * The in-progress test carries a revision number that the client bumps on every change.
 * A write based on an older revision of the same test (a stale tab, or a reload that
 * restored an older copy) must not overwrite newer progress.
 */
type ActiveMeta = { id?: unknown; rev?: unknown }
function isStale(stored: ActiveMeta | undefined, id: unknown, rev: unknown) {
  return !!stored && stored.id === id && typeof stored.rev === 'number' && typeof rev === 'number' && rev <= stored.rev
}
async function storedActive(userId: string) {
  const [row] = await db.select({ data: activeTests.data }).from(activeTests).where(eq(activeTests.userId, userId))
  return row?.data as ActiveMeta | undefined
}

/** Save a finished test and clear the in-progress one, atomically. */
api.post('/tests', async (c) => {
  const body = await parse(z.object({ test: testIn, attempts: z.array(attemptIn).max(200), rev: z.number().int().optional() }), c.req.raw)
  if (!body) return c.json({ error: 'invalid' }, 400)
  const userId = c.get('user')!.id
  const t = body.test
  // Finishing from an outdated copy would grade answers that were since changed or lost
  if (body.rev !== undefined && isStale(await storedActive(userId), t.id, body.rev + 1)) return c.json({ error: 'stale' }, 409)
  await db.transaction(async (tx) => {
    await tx
      .insert(tests)
      .values({
        userId,
        id: t.id,
        kind: t.kind,
        title: t.title,
        modules: t.modules,
        scoreRw: t.scores.rw,
        scoreMath: t.scores.math,
        durationMs: t.durationMs,
        ts: toDate(t.ts),
      })
      .onConflictDoNothing()
    if (body.attempts.length) await tx.insert(attempts).values(body.attempts.map((a) => ({ ...a, userId, ts: toDate(a.ts) })))
    await tx.delete(activeTests).where(eq(activeTests.userId, userId))
  })
  return c.body(null, 204)
})

/** Autosave of the in-progress test (opaque to the server, size-capped). */
api.put('/active', async (c) => {
  const text = await c.req.text()
  if (text.length > 200_000) return c.json({ error: 'too_large' }, 413)
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return c.json({ error: 'invalid' }, 400)
  }
  if (!data || typeof data !== 'object' || !('modules' in data)) return c.json({ error: 'invalid' }, 400)
  const userId = c.get('user')!.id
  const incoming = data as ActiveMeta
  if (isStale(await storedActive(userId), incoming.id, incoming.rev)) return c.json({ error: 'stale' }, 409)
  await db
    .insert(activeTests)
    .values({ userId, data })
    .onConflictDoUpdate({ target: activeTests.userId, set: { data, updatedAt: new Date() } })
  return c.body(null, 204)
})

api.delete('/active', async (c) => {
  await db.delete(activeTests).where(eq(activeTests.userId, c.get('user')!.id))
  return c.body(null, 204)
})

/** Merge a backup (or old browser-only progress) into the account. */
api.post('/import', async (c) => {
  const body = await parse(
    z.object({
      attempts: z.array(attemptIn).max(20_000),
      bookmarks: z.array(qid).max(5_000),
      tests: z.array(testIn).max(500),
    }),
    c.req.raw,
  )
  if (!body) return c.json({ error: 'invalid' }, 400)
  const userId = c.get('user')!.id
  await db.transaction(async (tx) => {
    for (let i = 0; i < body.attempts.length; i += 1000) {
      await tx.insert(attempts).values(body.attempts.slice(i, i + 1000).map((a) => ({ ...a, userId, ts: toDate(a.ts) })))
    }
    if (body.bookmarks.length) await tx.insert(bookmarks).values(body.bookmarks.map((q) => ({ userId, qid: q }))).onConflictDoNothing()
    for (const t of body.tests) {
      await tx
        .insert(tests)
        .values({
          userId,
          id: t.id,
          kind: t.kind,
          title: t.title,
          modules: t.modules,
          scoreRw: t.scores.rw,
          scoreMath: t.scores.math,
          durationMs: t.durationMs,
          ts: toDate(t.ts),
        })
        .onConflictDoNothing()
    }
  })
  return c.json({ imported: { attempts: body.attempts.length, bookmarks: body.bookmarks.length, tests: body.tests.length } })
})

/** Wipe this user's progress (keeps the account). */
api.delete('/data', async (c) => {
  const userId = c.get('user')!.id
  await db.transaction(async (tx) => {
    await tx.delete(attempts).where(eq(attempts.userId, userId))
    await tx.delete(bookmarks).where(eq(bookmarks.userId, userId))
    await tx.delete(tests).where(eq(tests.userId, userId))
    await tx.delete(activeTests).where(eq(activeTests.userId, userId))
  })
  return c.body(null, 204)
})
