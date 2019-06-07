import { ApolloServer, PlaygroundConfig } from 'apollo-server-koa'
import { FieldDefinition } from 'gram'
import { createSchema } from 'gram/lib/schemaBuilder'
import { GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString, printSchema } from 'graphql'
import { addMockFunctionsToSchema } from 'graphql-tools'
import * as Koa from 'koa'

import { config } from 'config'
import { builder } from 'graph'
import { Log } from 'services/logger'

// import { createContext } from 'services/context'
// import { BaseSchema, createBaseSchemaGenerator, createSchema } from '@raynode/graphql-connector'

import { eventFieldDefinition } from 'graph/event'
// import { gapiBaseSchema } from 'functions/gapi'
// import { iftttNotificationBaseSchema } from 'functions/ifttt-notification'

const joinFieldDefinitions = <Models>(...schema: FieldDefinition[]): FieldDefinition =>
  schema.reduce(
    ({ query, mutation, subscription }, schema) => ({
      mutation: { ...mutation, ...schema.mutation },
      query: { ...query, ...schema.query },
      subscription: { ...subscription, ...schema.subscription },
    }),
    {
      mutation: {},
      query: {},
      subscription: {},
    },
  )

export const generateServer = async (app: Koa, log: Log) => {
  const apolloLogger = log.create('apollo-server')

  // const baseSchema = createBaseSchemaGenerator(configuration)(models)
  // const eventSchema = eventBaseSchema()
  // const iftttNotificationSchema = iftttNotificationBaseSchema()
  // , eventSchema, iftttNotificationSchema, gapiBaseSchema()

  const fieldDefinition = joinFieldDefinitions(eventFieldDefinition(), builder.fields('admin'))
  console.log(fieldDefinition)
  const schema = createSchema(fieldDefinition)
  // const schema = builder.build(x)
  console.log(printSchema(schema))

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
