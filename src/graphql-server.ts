import { config } from 'config'
import { createContext } from 'services/context'
import { Log } from 'services/logger'

import * as Koa from 'koa'

import { ApolloServer } from 'apollo-server-koa'

import { BaseSchema, createBaseSchemaGenerator, createSchema } from '@raynode/graphql-connector'
import { configuration, DateType, JSONType } from '@raynode/graphql-connector-sequelize'

import { initialized, models } from 'models/init'

import { GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString, printSchema } from 'graphql'

import { eventBaseSchema } from 'functions/event'
import { gapiBaseSchema } from 'functions/gapi'

const joinBaseSchema = <Models>(...schema: Array<BaseSchema<Models>>): BaseSchema<Models> =>
  schema.reduce(
    ({ queryFields, mutationFields, subscriptionFields, getModel }, schema) => ({
      getModel: name => schema.getModel(name) || getModel(name),
      mutationFields: { ...mutationFields, ...schema.mutationFields },
      queryFields: { ...queryFields, ...schema.queryFields },
      subscriptionFields: { ...subscriptionFields, ...schema.subscriptionFields },
    }),
    {
      getModel: name => {
        throw new Error(`model ${name} not found`)
      },
      mutationFields: {},
      queryFields: {},
      subscriptionFields: {},
    },
  )

export const generateServer = async (app: Koa, log: Log) => {
  const apolloLogger = log.create('apollo-server')

  const baseSchema = createBaseSchemaGenerator(configuration)(models)
  const eventSchema = eventBaseSchema()

  const schema = createSchema(joinBaseSchema(baseSchema, eventSchema, gapiBaseSchema()))

  // console.log(printSchema(schema))

  const engine = config.apollo.apiKey ? { apiKey: config.apollo.apiKey } : false
  const server = new ApolloServer({
    engine,
    schema,
    tracing: true,
    subscriptions: {
      path: '/graphql',
    },
    context: createContext,
    introspection: true,
    playground: {
      // Force setting, workaround: https://github.com/prisma/graphql-playground/issues/790
      settings: {
        'editor.theme': 'dark',
        'editor.cursorShape': 'line',
        'editor.fontSize': 20,
      },
    },
  })

  server.applyMiddleware({ app, path: config.path })

  return { server, initialized }
}
