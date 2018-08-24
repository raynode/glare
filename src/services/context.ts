
import { IncomingMessage } from 'http'

import { User, UserInstance } from 'models/user'

import { create } from 'services/logger'
const log = create('services', 'context')

export interface Context {
  user?: UserInstance
  auth: any
}

export const createContext = async (req: any): Promise<Context> => {
  log(req.url, req.body)
  // log(arguments)

  // log(req.headers)
  // log(req.url)
  // log(req.query)
  // log(req.body)
  // const { authorization } = req.headers
  // log(authorization)
  return {
    auth: false,
  }
}
