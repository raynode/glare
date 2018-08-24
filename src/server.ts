
import { config } from 'config'
import { Log } from 'services/logger'

import { ApolloServer, gql } from 'apollo-server'
import { makeExecutableSchema } from 'graphql-tools'

import { createContext } from 'services/context'

import { initialized } from 'models/init'

import { resolvers } from 'types'

import { IncomingMessage, ServerResponse } from 'http'
// ContextConnection is a interface for the context method
interface ContextConnection {
  req: IncomingMessage
  res: ServerResponse
}

export const server = async (log: Log) => {
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

  return initialized
  .then(() => server.listen(config.port))
}
