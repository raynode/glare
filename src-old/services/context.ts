import { Context as KoaContext } from 'koa'
import * as koaBody from 'koa-body'
import * as session from 'koa-session'
import { User, UserInstance } from 'models/user'
import { create } from 'services/logger'

const log = create('services', 'context')

export interface Context {
  user?: UserInstance
  auth: any
}

export const createContext = async (context: { ctx: KoaContext; connection: any }): Promise<Context> => {
  if (context.ctx) {
    // request based auth
    const { ctx } = context
    console.log(ctx.session)
  } else {
    // console.log(context.connection)
    // subscription context?
    console.log('QUERY:', context.connection.query)
    console.log('AUTH:', context.connection.context.Authentication)
    console.log('auth:', context.connection.context.authentication)
  }

  return {
    auth: false,
  }
}