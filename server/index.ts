// Production entry: API + auth + the built frontend from one Node process.
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { app } from './app.js'
import { purgeExpiredSessions } from './auth.js'
import { ensureMigrated, sql } from './db/index.js'
import { env } from './env.js'

const root = path.resolve(env.staticDir)

// Caching is disabled in app.ts (Cache-Control: no-store on every response).
app.use('*', serveStatic({ root }))
let indexHtml: string | null = null
app.get('*', async (c) => {
  indexHtml ??= await readFile(path.join(root, 'index.html'), 'utf8').catch(() => null)
  if (!indexHtml) return c.text('Frontend not built. Run `npm run build`.', 500)
  return c.html(indexHtml)
})

await ensureMigrated()
setInterval(() => purgeExpiredSessions().catch(() => {}), 6 * 3600_000).unref()

const server = serve({ fetch: app.fetch, port: env.port }, (info) => {
  console.log(`[satori] listening on :${info.port} (${env.appUrl})`)
})

for (const sig of ['SIGINT', 'SIGTERM'] as const) {
  process.on(sig, () => {
    server.close()
    sql.end({ timeout: 5 }).finally(() => process.exit(0))
  })
}
