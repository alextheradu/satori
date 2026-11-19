import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { authRoutes, sessionMiddleware, type AppEnv } from './auth.js'
import { api } from './api.js'
import { ensureMigrated, sql } from './db/index.js'
import { env } from './env.js'

/** API + auth routes. Used by the production server (server/index.ts) and by Vite in dev (vite.config.ts). */
export const app = new Hono<AppEnv>()

app.use('*', async (_c, next) => {
  await ensureMigrated()
  await next()
})
app.use('*', logger())
// No HTTP caching anywhere: every response (HTML, assets, API) is fetched fresh,
// so a new deploy shows up on the next page load.
app.use('*', async (c, next) => {
  await next()
  c.header('Cache-Control', 'no-store')
  c.res.headers.delete('Last-Modified')
  c.res.headers.delete('ETag')
})
app.use('*', secureHeaders({ contentSecurityPolicy: undefined, crossOriginEmbedderPolicy: false }))

app.get('/healthz', async (c) => {
  try {
    await sql`select 1`
    return c.text('ok')
  } catch {
    return c.text('db unavailable', 503)
  }
})

// CSRF defence for state-changing requests: cookies are SameSite=Lax and we also require a same-origin Origin header.
app.use('/api/*', async (c, next) => {
  if (c.req.method !== 'GET' && c.req.method !== 'HEAD') {
    const origin = c.req.header('origin')
    if (origin && origin !== env.appUrl) return c.json({ error: 'bad_origin' }, 403)
  }
  await next()
})
app.use('/api/*', bodyLimit({ maxSize: 4 * 1024 * 1024 }))
app.use('/api/*', sessionMiddleware)
app.use('/auth/*', sessionMiddleware)
app.route('/api', api)
app.route('/auth', authRoutes)
app.all('/api/*', (c) => c.json({ error: 'not_found' }, 404))

app.onError((err, c) => {
  console.error(err)
  return c.json({ error: 'internal' }, 500)
})
