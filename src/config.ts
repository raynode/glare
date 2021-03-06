import { LogLevel } from '@raynode/nx-logger'
import { config as dotEnv } from 'dotenv'

dotEnv()

const sessionKeys = Object.keys(process.env)
  .filter(name => name.startsWith('GLARE_SESSION_KEY'))
  .map(name => process.env[name])

export const config = {
  apollo: {
    apiKey: process.env.ENGINE_API_KEY,
  },
  host: process.env.HOSTNAME,
  port: process.env.GLARE_PORT || 3421,
  path: '/',
  session: {
    key: 'glare',
    keys: sessionKeys.length ? sessionKeys : ['9f373758-f965-11e8-8eb2-f2801f1b9fd1'],
  },
  sentry: {
    active: process.env.SENTRY || false,
    environment: process.env.NODE_ENV,
    dsn: process.env.SENTRY_GLARE_DNS,
  },
  google: {
    clientId: process.env.GLARE_GOOGLE_CLIENT_ID,
    secret: process.env.GLARE_GOOGLE_SECRET,
    redirectUri: process.env.GLARE_GOOGLE_REDIRECT_URI,
  },
  ifttt: {
    webhook: process.env.IFTTT_WEBHOOK_KEY,
  },
}
