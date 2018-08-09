
import { config } from 'dotenv'

config()

export default {
  port: process.env.GLARE_PORT || 3421,
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
