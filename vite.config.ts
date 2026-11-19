import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { getRequestListener } from '@hono/node-server'
import { defineConfig, loadEnv, type Plugin } from 'vite'

/**
 * Serves the Hono backend (server/app.ts) from the Vite dev server, so `npm run dev`
 * runs frontend + API + auth in one process. Server code hot-reloads on save.
 */
function backend(): Plugin {
  const BACKEND = /^\/(api|auth)(\/|$)|^\/healthz$/
  return {
    name: 'satori-backend',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!BACKEND.test(req.url?.split('?')[0] ?? '')) return next()
        try {
          const mod = await server.ssrLoadModule('/server/app.ts')
          await getRequestListener(mod.app.fetch)(req, res)
        } catch (err) {
          server.ssrFixStacktrace(err as Error)
          next(err)
        }
      })
    },
  }
}

export default defineConfig(({ command, mode }) => {
  if (command === 'serve') {
    // Make .env available to the server code (process.env), without overriding real env vars
    for (const [k, v] of Object.entries(loadEnv(mode, process.cwd(), ''))) process.env[k] ??= v
  }
  return {
    plugins: [react(), tailwindcss(), backend()],
    resolve: { alias: { '@': path.resolve(__dirname, './src') } },
    build: { chunkSizeWarningLimit: 900 },
  }
})
