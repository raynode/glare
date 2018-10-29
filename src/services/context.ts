import { User, UserInstance } from 'models/user'
import { create } from 'services/logger'

const log = create('services', 'context')

export interface Context {
  user?: UserInstance
  auth: any
}

export const createContext = async (context: any): Promise<Context> => {
  if (context.connection) {
    // subscription context?
    console.log('QUERY:', context.connection.query)
    console.log('AUTH:', context.connection.context.Authentication)
    console.log('auth:', context.connection.context.authentication)
  } else {
    // nor request based
    const { req } = context
    if (req.body.operationName === 'IntrospectionQuery') return context
    console.log('QUERY:', req.body)
    console.log('AUTH:', req.headers.Authentication)
    console.log('auth:', req.headers.authentication)
  }

  // log(req.url, req.body)
  // log(arguments)

  // log(req.url)
  // log(req.query)
  // log(req.body)
  // const { authorization } = req.headers
  // log(authorization)
  return {
    auth: false,
  }
}
