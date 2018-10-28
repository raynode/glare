
import { LogLevel } from '@raynode/nx-logger'
import { config as dotEnv } from 'dotenv'

dotEnv()

export const config = {
  host: process.env.HOSTNAME,
  port: process.env.GLARE_PORT || 3421,
  path: '/',
  sentry: {
    active: process.env.SENTRY || false,
    environment: process.env.NODE_ENV,
    dsn: process.env.SENTRY_GLARE_DNS,
  },
  google: {
    clientId: process.env.GLARE_GOOGLE_CLIENT_ID,
    secret: process.env.GLARE_GOOGLE_SECRET,
    mapsAPI: process.env.GLARE_GOOGLE_MAPS_API,
    redirectUri: 'localhost:3003/settings',
  },
  sequelize: {
    logLevel: false, // 'debug', // LogLevel
    development: {
      username: process.env.DEV_DB_USERNAME,
      password: process.env.DEV_DB_PASSWORD,
      database: process.env.DEV_DB_NAME,
      host: '127.0.0.1',
      dialect: 'postgres',
    },
    test: {
      username: process.env.CI_DB_USERNAME,
      password: process.env.CI_DB_PASSWORD,
      database: process.env.CI_DB_NAME,
      host: '127.0.0.1',
      dialect: 'postgres',
    },
    production: {
      username: process.env.PROD_DB_USERNAME,
      password: process.env.PROD_DB_PASSWORD,
      database: process.env.PROD_DB_NAME,
      host: '127.0.0.1',
      dialect: 'postgres',
    },
  },
}
