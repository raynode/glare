import { config } from 'config'
import { Log } from 'services/logger'

import * as Koa from 'koa'

import { ApolloServer } from 'apollo-server-koa'

import { buildGraphQL } from 'services/graphql-binding'
import { convertToModel } from 'services/graphql-binding/convert-to-model'

import { initialized, models } from 'models/init'

import { map } from 'lodash'

import { GraphQLObjectType, GraphQLSchema } from 'graphql'

export const generateServer = async (app: Koa, log: Log) => {
  const apolloLogger = log.create('apollo-server')

  const bindings = buildGraphQL(map(models, convertToModel))

  const { queryFields, mutationFields } = bindings

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: queryFields,
    }),
    mutation: new GraphQLObjectType({
      name: 'Mutation',
      fields: mutationFields,
    }),
  })

  const server = new ApolloServer({
    schema,
    tracing: true,
    playground: {
      // Force setting, workaround: https://github.com/prisma/graphql-playground/issues/790
      settings: {
        'editor.theme': 'dark',
        'editor.cursorShape': 'line',
      },
    },
  })

  server.applyMiddleware({ app, path: config.path })

  return { server, initialized }
}
