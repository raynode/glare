
import { config } from 'dotenv'

config()

export default {
  auth0: {
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    api: {
      clientId: process.env.AUTH0_API_CLIENT_ID,
      secret: process.env.AUTH0_API_CLIENT_SECRET,
      grant: process.env.AUTH0_API_GRANT_ID,
      audience: 'https://nox.eu.auth0.com/api/v2/',
    },
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
}
