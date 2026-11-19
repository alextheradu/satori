import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { and, eq, gt, sql as dsql } from 'drizzle-orm'
import { Hono, type Context, type MiddlewareHandler } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { db } from './db/index.js'
import { sessions, users } from './db/schema.js'
import { env } from './env.js'

export interface SessionUser {
  id: string
  name: string | null
  email: string | null
  slackId: string | null
}

export type AppEnv = { Variables: { user: SessionUser | null; sessionId: string | null } }

const SID = env.secureCookies ? '__Host-sid' : 'sid'
const OAUTH = env.secureCookies ? '__Host-hca_oauth' : 'hca_oauth'
const DAY = 86_400_000

const b64url = (buf: Buffer) => buf.toString('base64url')
const sha256 = (s: string) => createHash('sha256').update(s).digest('hex')
const redirectUri = () => `${env.appUrl}/auth/callback`

function safeReturnTo(v: string | undefined | null) {
  if (!v || !v.startsWith('/') || v.startsWith('//') || v.startsWith('/\\')) return '/'
  return v
}

function sameString(a: string, b: string) {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && timingSafeEqual(ab, bb)
}

// ---- sessions -----------------------------------------------------------------

async function createSession(c: Context, userId: string) {
  const token = b64url(randomBytes(32))
  const expiresAt = new Date(Date.now() + env.sessionDays * DAY)
  await db.insert(sessions).values({ id: sha256(token), userId, expiresAt })
  setCookie(c, SID, token, {
    httpOnly: true,
    secure: env.secureCookies,
    sameSite: 'Lax',
    path: '/',
    expires: expiresAt,
  })
}

/** Loads the signed-in user (if any) into c.var.user. Sliding expiry. */
export const sessionMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  c.set('user', null)
  c.set('sessionId', null)
  const token = getCookie(c, SID)
  if (token) {
    const id = sha256(token)
    const [row] = await db
      .select({ id: users.id, name: users.name, email: users.email, slackId: users.slackId, expiresAt: sessions.expiresAt })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(and(eq(sessions.id, id), gt(sessions.expiresAt, new Date())))
      .limit(1)
    if (row) {
      c.set('user', { id: row.id, name: row.name, email: row.email, slackId: row.slackId })
      c.set('sessionId', id)
      // Renew when less than half the lifetime is left
      if (row.expiresAt.getTime() - Date.now() < (env.sessionDays * DAY) / 2) {
        const expiresAt = new Date(Date.now() + env.sessionDays * DAY)
        await db.update(sessions).set({ expiresAt }).where(eq(sessions.id, id))
        setCookie(c, SID, token, { httpOnly: true, secure: env.secureCookies, sameSite: 'Lax', path: '/', expires: expiresAt })
      }
    } else {
      deleteCookie(c, SID, { path: '/', secure: env.secureCookies })
    }
  }
  await next()
}

export const requireUser: MiddlewareHandler<AppEnv> = async (c, next) => {
  if (!c.get('user')) return c.json({ error: 'unauthorized' }, 401)
  await next()
}

// ---- Hack Club Auth (OAuth 2 / OIDC authorization code flow) -----------------

interface HcaUserInfo {
  sub: string
  email?: string
  name?: string
  given_name?: string
  family_name?: string
  nickname?: string
  slack_id?: string
}

export const authRoutes = new Hono<AppEnv>()

authRoutes.get('/login', (c) => {
  const state = b64url(randomBytes(24))
  const verifier = env.hca.usePkce ? b64url(randomBytes(32)) : undefined
  const returnTo = safeReturnTo(c.req.query('return_to'))
  setCookie(c, OAUTH, b64url(Buffer.from(JSON.stringify({ state, verifier, returnTo }))), {
    httpOnly: true,
    secure: env.secureCookies,
    sameSite: 'Lax',
    path: '/',
    maxAge: 600,
  })
  const url = new URL(`${env.hca.issuer}/oauth/authorize`)
  url.searchParams.set('client_id', env.hca.clientId)
  url.searchParams.set('redirect_uri', redirectUri())
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', env.hca.scopes)
  url.searchParams.set('state', state)
  if (verifier) {
    url.searchParams.set('code_challenge', b64url(createHash('sha256').update(verifier).digest()))
    url.searchParams.set('code_challenge_method', 'S256')
  }
  return c.redirect(url.toString())
})

authRoutes.get('/callback', async (c) => {
  const fail = (reason: string) => {
    console.warn('[auth] login failed:', reason)
    return c.redirect(`/?auth_error=${encodeURIComponent(reason)}`)
  }
  const raw = getCookie(c, OAUTH)
  deleteCookie(c, OAUTH, { path: '/', secure: env.secureCookies })
  if (c.req.query('error')) return fail(c.req.query('error') ?? 'denied')

  let saved: { state: string; verifier?: string; returnTo: string }
  try {
    saved = JSON.parse(Buffer.from(raw ?? '', 'base64url').toString())
  } catch {
    return fail('expired')
  }
  const code = c.req.query('code')
  const state = c.req.query('state')
  if (!code || !state || !saved?.state || !sameString(state, saved.state)) return fail('state_mismatch')

  // Exchange the code for an access token
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri(),
    client_id: env.hca.clientId,
    client_secret: env.hca.clientSecret,
  })
  if (saved.verifier) body.set('code_verifier', saved.verifier)
  const tokenRes = await fetch(`${env.hca.issuer}/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
    body,
  })
  if (!tokenRes.ok) return fail(`token_${tokenRes.status}`)
  const token = (await tokenRes.json()) as { access_token?: string }
  if (!token.access_token) return fail('no_access_token')

  // Who is this?
  const infoRes = await fetch(`${env.hca.issuer}/oauth/userinfo`, {
    headers: { authorization: `Bearer ${token.access_token}`, accept: 'application/json' },
  })
  if (!infoRes.ok) return fail(`userinfo_${infoRes.status}`)
  const info = (await infoRes.json()) as HcaUserInfo
  if (!info.sub) return fail('no_subject')

  const name = info.name || [info.given_name, info.family_name].filter(Boolean).join(' ') || info.nickname || null
  const [user] = await db
    .insert(users)
    .values({ hcaSub: info.sub, email: info.email ?? null, name, slackId: info.slack_id ?? null })
    .onConflictDoUpdate({
      target: users.hcaSub,
      set: { email: info.email ?? null, name, slackId: info.slack_id ?? null, lastLoginAt: dsql`now()` },
    })
    .returning({ id: users.id })

  await createSession(c, user.id)
  return c.redirect(safeReturnTo(saved.returnTo))
})

authRoutes.post('/logout', async (c) => {
  const id = c.get('sessionId')
  if (id) await db.delete(sessions).where(eq(sessions.id, id))
  deleteCookie(c, SID, { path: '/', secure: env.secureCookies })
  return c.body(null, 204)
})

/** Housekeeping: drop expired sessions. */
export async function purgeExpiredSessions() {
  await db.delete(sessions).where(dsql`${sessions.expiresAt} < now()`)
}
