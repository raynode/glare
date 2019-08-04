import { ApolloServer } from 'apollo-server-koa'
import * as Koa from 'koa'

import { config } from 'config'
import { getSchema } from 'graph'
import { Log } from 'services/logger'

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
    },
    // context: createContext,
    introspection: true,
    playground: {
      // Force setting, workaround: https://github.com/prisma/graphql-playground/issues/790
      settings: {
        'editor.cursorShape': 'line',
        'editor.fontSize': 20,
      },
    },
  })

  server.applyMiddleware({ app, path: config.path })

  return { server }
}
