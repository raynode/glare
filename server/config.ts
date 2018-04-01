
import { config } from 'dotenv'

config()

export default {
  auth0: {
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
  },
  mongo: {
    uri: process.env.MONGO_URI,
  },
}
