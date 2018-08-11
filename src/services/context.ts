
import { IncomingMessage } from 'http'

import { User } from 'db/models'

import { create } from 'services/logger'
const log = create('services', 'context')

export interface Context {
  user?: User
  auth: any
}

export const createContext = async (req: any): Promise<Context> => {
  // log(req.url, req.body)
  const { authorization } = req.headers
  // log(authorization)
  return {
    auth: false,
  }
}
