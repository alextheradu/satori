# Satori: SAT Prep

Digital SAT practice platform. Sign in with **Hack Club Auth**; progress is stored in **PostgreSQL 17/18**.

## Features

- **Practice**: untimed drills filtered by section, domain, difficulty, new/missed. Instant feedback and explanations, answer eliminator, bookmarks, keyboard shortcuts (A–D, Enter).
- **Smart practice**: missed questions first, then unseen.
- **Timed tests**: diagnostic, RW section, Math section, full-length. Module 2 adapts to Module 1. Timer with pause/hide, question navigator, mark for review, reference sheet, Desmos link. In-progress tests autosave to the server and resume on any device.
- **Results**: estimated 200–800 section scores, domain breakdown, per-question review.
- **Home**: score estimate, accuracy by domain, streak, weakest skills.
- **Review**: missed / saved / full history.
- **Account**: profile picture from your Hack Club Slack (via Cachet), reset progress from the account menu.
- 13,672 original SAT-style questions covering every Digital SAT domain and skill, with KaTeX math. Includes 9,728 numerical math variants from 152 problem families, 784 additional individually written Reading and Writing questions, 512 table-evidence variants from 16 reading families, 1,536 grammar variants from 24 rule families, 512 Expression of Ideas variants from 16 task patterns, and 88 additional conceptual statistics questions. Light/dark themes.

Score estimates are rough approximations, not official College Board scoring.

## Architecture

```
browser ──► Node server (Hono)
             ├─ /auth/*  Hack Club Auth OAuth (authorization code flow), server-side sessions
             ├─ /api/*   JSON API (progress, bookmarks, tests, autosave)
             └─ /*       built React SPA (dist/)
                 │
                 ▼
            PostgreSQL 17/18 (Drizzle ORM, migrations in drizzle/ run automatically on boot)
```

- Frontend: React 19, Vite, Tailwind v4, [shadcn/ui](https://ui.shadcn.com) (`src/components/ui`), [React Bits](https://reactbits.dev) (`src/components/reactbits`). Pages in `src/pages`, app components in `src/components/app`, logic in `src/lib`.
- Backend: `server/` (Hono on Node 24, Drizzle, postgres.js, zod). `server/app.ts` holds the routes; `server/index.ts` is the production entry that also serves `dist/`. Sessions are random 256-bit tokens in an HttpOnly cookie, stored hashed (SHA-256) in Postgres, 30-day sliding expiry. State-changing API calls require a same-origin `Origin` header.
- The question bank ships with the frontend (`src/data/questions/*.json`); the server stores only user progress.

### Database tables

`users`, `sessions`, `attempts`, `bookmarks`, `tests`, `active_tests`. See `server/db/schema.ts`. Change the schema, then run `npm run db:generate` to create a new migration.

## 1. Create a Hack Club Auth app

1. Go to <https://auth.hackclub.com/developer_apps> and create an app.
2. Redirect URI: `https://YOUR-DOMAIN/auth/callback` (and `http://localhost:5173/auth/callback` for local dev).
3. Scopes: `openid profile email`.
4. Copy the **Client ID** and **Client Secret**.

New apps are "community, untrusted" and show users a stronger consent warning; ask Hack Club to mark the app trusted when you go live.

## 2. Local development

Needs Node 24 and Docker (for the database).

```bash
cp .env.example .env           # fill in HCA_CLIENT_ID, HCA_CLIENT_SECRET
npm install
npm run db:up                  # Postgres 18 only, on localhost:5433 (docker-compose.dev.yml)
npm run dev                    # frontend + API + auth on http://localhost:5173 (one process)
```

`npm run dev` runs Vite with a small plugin (`vite.config.ts`) that hands `/api/*`, `/auth/*` and `/healthz` to the Hono app in `server/app.ts`. Server code hot-reloads on save and migrations run automatically on the first request.

Database helpers: `npm run db:psql` (shell), `npm run db:logs`, `npm run db:down` (stops it; data persists in the `satori-dev_pgdata` volume). To wipe local data: `docker compose -f docker-compose.dev.yml down -v`. Set `SATORI_DB_PORT` to use a different host port.

Open <http://localhost:5173>. Other scripts: `npm run validate` (question bank), `npm run build` (validate + type-check + frontend + server), `npm start` (production server).

## 3. Deploy on Dokploy

### Option A: Application + Dokploy Postgres (recommended)

1. **Create the database**: in your Dokploy project, *Create Service → Database → PostgreSQL*. Set the Docker image to `postgres:18` (or `postgres:17`). Deploy it and copy the **Internal Connection URL**.
2. **Create the app**: *Create Service → Application*, source = this Git repo, **Build Type: Dockerfile**.
3. **Environment** (app's Environment tab):
   ```
   DATABASE_URL=<internal connection URL from step 1>
   APP_URL=https://sat.example.com
   HCA_CLIENT_ID=...
   HCA_CLIENT_SECRET=...
   ```
4. **Domains**: add your domain, container port **3000**, enable HTTPS.
5. Deploy. Migrations run on start; health check is `/healthz` (checks the DB too).

### Option B: Compose

Create a *Compose* service pointing at `docker-compose.yml` (app + `postgres:18` with a persistent volume). Set `APP_URL`, `HCA_CLIENT_ID`, `HCA_CLIENT_SECRET`, and a strong `POSTGRES_PASSWORD` in the Environment tab, then attach your domain to the `app` service on port 3000.

### Environment variables

| Variable | Required | Default | Notes |
|---|---|---|---|
| `DATABASE_URL` | yes | | Postgres 17/18 connection string |
| `APP_URL` | yes | `http://localhost:5173` | Public URL; must match the redirect URI host. `https://` enables secure `__Host-` cookies |
| `HCA_CLIENT_ID` / `HCA_CLIENT_SECRET` | yes | | From Hack Club Auth |
| `HCA_ISSUER` | no | `https://auth.hackclub.com` | |
| `HCA_SCOPES` | no | `openid profile email slack_id` | `slack_id` powers profile pictures; enable it on your HCA app |
| `HCA_USE_PKCE` | no | `false` | Hack Club Auth's docs don't mention PKCE; turn on once confirmed |
| `PORT` | no | `3000` | |
| `SESSION_DAYS` | no | `30` | |
| `DB_POOL_MAX` | no | `10` | |

## Adding questions

Add a JSON array to `src/data/questions/*.json` following `src/data/types.ts`. Text supports `$LaTeX$`, `**bold**`, `_underline_`, `______` blanks, `- ` bullets and pipe tables. MC: `choices` (4) + `answer` index. Grid-in: omit `choices`; `answer` is a list like `["3/4", ".75"]`. Run `npm run validate`.

The [question bank report and source directory](docs/question-bank-sources.md) records counts, provenance, coverage, and 70 external practice resources. Regenerate additions with `npm run questions:generate`; `npm run validate` also verifies their reproducibility and numerical consistency. After building, run `npm run questions:runtime` to exercise production-bank loading, grading, markup rendering, and module selection.

All bundled questions are original. College Board questions are copyrighted and aren't included; the app links to the free official [SAT Suite Question Bank](https://satsuiteeducatorquestionbank.collegeboard.org/digital/search) and [Bluebook](https://bluebook.collegeboard.org).

SAT® is a trademark of the College Board, which is not affiliated with this project.
