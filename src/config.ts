
import { config as dotEnv } from 'dotenv'

dotEnv()

export const config = {
  port: process.env.GLARE_PORT || 3421,
  showSQL: false,
  sentry: {
    environment: process.env.NODE_ENV,
    dsn: process.env.SENTRY_GLARE_DNS,
  },
  mongo: {
    uri: process.env.MONGO_URI,
  },
  google: {
    clientId: process.env.GLARE_GOOGLE_CLIENT_ID,
    secret: process.env.GLARE_GOOGLE_SECRET,
    mapsAPI: process.env.GLARE_GOOGLE_MAPS_API,
    redirectUri: 'localhost:3003/settings',
  },
  sequelize: {
    development: {
      use_env_variable: 'PGHOST_GLARE',
      dialect: 'postgres',
    },
    test: {
      use_env_variable: 'PGHOST_GLARE_TEST',
      dialect: 'postgres',
    },
    production: {
      use_env_variable: 'PGHOST_GLARE',
      dialect: 'postgres',
    },
  },
}
