# ---- build ----
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Vite inlines VITE_* vars into the frontend bundle at build time
ARG VITE_DESMOS_API_KEY=
ENV VITE_DESMOS_API_KEY=$VITE_DESMOS_API_KEY
RUN npm run build && npm prune --omit=dev

# ---- runtime ----
FROM node:24-alpine
ENV NODE_ENV=production \
    PORT=3000
WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server
COPY --from=build /app/drizzle ./drizzle
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s CMD wget -qO- http://127.0.0.1:3000/healthz || exit 1
# Runs pending database migrations, then serves the API + built frontend
CMD ["node", "dist-server/index.js"]
