import { sql } from 'drizzle-orm'
import { bigint, boolean, index, integer, jsonb, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core'

const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow()

export const users = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  /** Hack Club Auth subject ("ident!...") */
  hcaSub: text('hca_sub').notNull().unique(),
  email: text('email'),
  name: text('name'),
  slackId: text('slack_id'),
  createdAt: createdAt(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }).notNull().defaultNow(),
})

export const sessions = pgTable(
  'sessions',
  {
    /** sha256 of the cookie token; the raw token never touches the database */
    id: text('id').primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index('sessions_user_idx').on(t.userId)],
)

export const attempts = pgTable(
  'attempts',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    qid: text('qid').notNull(),
    correct: boolean('correct').notNull(),
    answer: jsonb('answer').$type<number | string | null>(),
    ms: integer('ms').notNull().default(0),
    mode: text('mode').$type<'practice' | 'test'>().notNull(),
    ts: timestamp('ts', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('attempts_user_ts_idx').on(t.userId, t.ts)],
)

export const bookmarks = pgTable(
  'bookmarks',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    qid: text('qid').notNull(),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.qid] })],
)

export const tests = pgTable(
  'tests',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    id: text('id').notNull(),
    kind: text('kind').notNull(),
    title: text('title').notNull(),
    modules: jsonb('modules').notNull(),
    scoreRw: integer('score_rw'),
    scoreMath: integer('score_math'),
    durationMs: integer('duration_ms').notNull().default(0),
    ts: timestamp('ts', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.id] }), index('tests_user_ts_idx').on(t.userId, t.ts)],
)

/** The one in-progress timed test per user (autosaved). */
export const activeTests = pgTable('active_tests', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  data: jsonb('data').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
