# syntax=docker/dockerfile:1

# ---- all deps (for building) ----
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

# ---- runtime deps only (server: hono, drizzle, postgres, zod) ----
# Separate stage: cached until the lockfile changes, so the runtime node_modules
# layer is reused across deploys instead of being rebuilt + re-exported every time.
FROM node:24-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev --no-audit --no-fund

# ---- build ----
FROM deps AS build
COPY . .
# Vite inlines VITE_* vars into the frontend bundle at build time
ARG VITE_DESMOS_API_KEY=
ENV VITE_DESMOS_API_KEY=$VITE_DESMOS_API_KEY
RUN npm run build

# ---- runtime ----
FROM node:24-alpine
ENV NODE_ENV=production \
    PORT=3000
WORKDIR /app
COPY package.json ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY drizzle ./drizzle
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s CMD wget -qO- http://127.0.0.1:3000/healthz || exit 1
# Runs pending database migrations, then serves the API + built frontend
CMD ["node", "dist-server/index.js"]
