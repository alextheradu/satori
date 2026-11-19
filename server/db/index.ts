import path from 'node:path'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import { env } from '../env.js'
import * as schema from './schema.js'

// In dev the server module is reloaded on every edit; keep one pool and one migration run per process.
const g = globalThis as unknown as { __satoriSql?: postgres.Sql; __satoriMigrated?: Promise<void> }

export const sql = (g.__satoriSql ??= postgres(env.databaseUrl, { max: Number(process.env.DB_POOL_MAX ?? 10), onnotice: () => {} }))
export const db = drizzle(sql, { schema })

/** Applies pending migrations once per process. */
export function ensureMigrated(): Promise<void> {
  g.__satoriMigrated ??= migrate(db, { migrationsFolder: path.resolve(process.env.MIGRATIONS_DIR ?? 'drizzle') }).then(
    () => console.log('[db] migrations up to date'),
    (err) => {
      g.__satoriMigrated = undefined // retry on the next request
      throw err
    },
  )
  return g.__satoriMigrated
}
