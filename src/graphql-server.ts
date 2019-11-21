import { ApolloServer } from 'apollo-server-koa'
import * as Koa from 'koa'

import { config } from 'config'
import { getSchema } from 'graph'
import { createContext } from 'services/graphql-context'
import { Log } from 'services/logger'

import { TokenStores } from 'db/models'

import { startUpdater } from 'graph/types/history'

export const generateServer = async (app: Koa, log: Log) => {
  const apolloLogger = log.create('apollo-server')

  const schema = getSchema()
  const engine = config.apollo.apiKey ? { apiKey: config.apollo.apiKey } : false
  const server = new ApolloServer({
    engine,
    schema,
    tracing: true,

    subscriptions: {
      path: '/graphql',
      // onConnect: async (connectionParams: any, websocket, context) => {
      //   const contextResult = {
      //     hello: 'world',
      //     ...await createAuthContext(connectionParams.authorization),
      //   }
      //   console.log(contextResult)
      //   return contextResult
      // },
    },
    context: createContext,
    introspection: true,
    playground: {
      // Force setting, workaround: https://github.com/prisma/graphql-playground/issues/790
      settings: {
        'editor.cursorShape': 'line',
        'editor.fontSize': 20,
      },
    },
  })

  log('Starting history:')
  startUpdater()

  server.applyMiddleware({ app, path: config.path })

  return { server }
}
