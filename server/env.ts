function required(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing required environment variable ${name}`)
  return v
}

const appUrl = (process.env.APP_URL ?? 'http://localhost:5173').replace(/\/$/, '')

export const env = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: required('DATABASE_URL'),
  /** Public URL users reach the app at, e.g. https://sat.example.com */
  appUrl,
  secureCookies: appUrl.startsWith('https://'),
  hca: {
    issuer: (process.env.HCA_ISSUER ?? 'https://auth.hackclub.com').replace(/\/$/, ''),
    clientId: required('HCA_CLIENT_ID'),
    clientSecret: required('HCA_CLIENT_SECRET'),
    scopes: process.env.HCA_SCOPES ?? 'openid profile email',
    /** Hack Club Auth's docs don't mention PKCE; enable once confirmed. */
    usePkce: process.env.HCA_USE_PKCE === 'true',
  },
  sessionDays: Number(process.env.SESSION_DAYS ?? 30),
  staticDir: process.env.STATIC_DIR ?? 'dist',
  isProd: process.env.NODE_ENV === 'production',
}
