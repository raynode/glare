import { ApolloServer } from 'apollo-server-koa'
import { makeExecutableSchema } from 'graphql-tools'
import * as Koa from 'koa'

import { config } from 'config'
import { builder } from 'graph'
import { eventFieldDefinition } from 'graph/event'
import { Log } from 'services/logger'

export const generateServer = async (app: Koa, log: Log) => {
  const apolloLogger = log.create('apollo-server')
  const build = builder.createBuild()

  eventFieldDefinition(build)

  const { resolvers, typeDefs } = build.toTypeDefs()

  // console.log(typeDefs)

  const schema = makeExecutableSchema({ resolvers, typeDefs })

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
