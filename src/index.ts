
import { ApolloServer, gql } from 'apollo-server'
import { makeExecutableSchema } from 'graphql-tools'

import config from 'config'
import { log } from 'services/logger'
import { createContext } from 'services/context'

import { getMongoConnection } from 'db'
import { resolvers } from 'types'

import { IncomingMessage, ServerResponse } from 'http'
// ContextConnection is a interface for the context method
interface ContextConnection {
  req: IncomingMessage
  res: ServerResponse
}

process.on('unhandledRejection', rejection => log.error(rejection))

const schema = makeExecutableSchema({
  typeDefs: gql(resolvers.typeDefs.join('')),
  resolvers: {
    Query: resolvers.Query,
    Mutation: resolvers.Mutation,
    Subscription: resolvers.Subscription,
    ...resolvers.Resolver,
  },
  logger: log.create('graphql'), // optional
  allowUndefinedInResolve: false, // optional
  resolverValidationOptions: {
    requireResolversForResolveType: false,
  }, // optional
  // directiveResolvers = null, // optional
  // schemaDirectives = null,  // optional
  // parseOptions = {},  // optional
  // inheritResolversFromInterfaces = false  // optional
})

const server = new ApolloServer({
  cors: false,
  schema,
  // mocks: {
  //   DateTime: () => new Date(),
  // },
  context: async ({ req }: ContextConnection) => createContext(req),
})

const mongo = getMongoConnection()
.catch(rejection => log.error(rejection))

server.listen(config.port)
.then(serverInfo => {
  log(`🚀 Server running on port ${serverInfo.port}`)
  log(`url: ${serverInfo.url}`)
  log(`subscriptionsUrl: ${serverInfo.subscriptionsUrl}`)
})
