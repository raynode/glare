import { config } from 'config'
import { Log } from 'services/logger'

import * as Koa from 'koa'

import { ApolloServer } from 'apollo-server-koa'

import { BaseSchema, createBaseSchemaGenerator } from '@raynode/graphql-connector'
import { configuration, DateType, JSONType } from '@raynode/graphql-connector-sequelize'

import { initialized, models } from 'models/init'

import { GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString, printSchema } from 'graphql'

import { PubSub, withFilter } from 'graphql-subscriptions'

export const pubsub = new PubSub()

export const createSchema = ({ queryFields, mutationFields, subscriptionFields = null }: BaseSchema) => {
  const query = new GraphQLObjectType({
    name: 'Query',
    fields: queryFields,
  })
  const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: mutationFields,
  })

  const subscription = new GraphQLObjectType({
    name: 'Subscription',
    fields: subscriptionFields,
  })
  return new GraphQLSchema({ query, mutation, subscription })
}

const joinBaseSchema = (...schema: BaseSchema[]): BaseSchema =>
  schema.reduce(
    (result, schema) => {
      result.queryFields = { ...result.queryFields, ...schema.queryFields }
      result.mutationFields = { ...result.mutationFields, ...schema.mutationFields }
      result.subscriptionFields = { ...result.subscriptionFields, ...schema.subscriptionFields }
      return result
    },
    { queryFields: {}, mutationFields: {}, subscriptionFields: {} },
  )

const eventBaseSchema = (): BaseSchema => {
  const EVENT = 'EVENT'

  const EventType = new GraphQLObjectType({
    name: 'Event',
    fields: {
      name: { type: GraphQLNonNull(GraphQLString) },
      data: { type: JSONType },
      time: { type: GraphQLNonNull(DateType) },
    },
  })

  return {
    queryFields: {
      event: { type: GraphQLString },
    },
    mutationFields: {
      triggerEvent: {
        args: {
          name: { type: GraphQLNonNull(GraphQLString) },
          data: { type: JSONType },
        },
        resolve: (_, args, context) => pubsub.publish(EVENT, args),
        type: GraphQLString,
      },
    },
    subscriptionFields: {
      eventListener: {
        args: { name: { type: GraphQLString } },
        subscribe: withFilter(
          () => pubsub.asyncIterator([EVENT]),
          (event, variables) => variables.name === '*' || event.name === variables.name,
        ),
        resolve: ({ name, data }) => ({ name, data, time: new Date() }),
        type: EventType,
      },
    },
  }
}

export const generateServer = async (app: Koa, log: Log) => {
  const apolloLogger = log.create('apollo-server')

  const baseSchema = createBaseSchemaGenerator(configuration)(models)
  const eventSchema = eventBaseSchema()

  const schema = createSchema(joinBaseSchema(baseSchema, eventSchema))

  console.log(printSchema(schema))

  const server = new ApolloServer({
    schema,
    tracing: true,
    subscriptions: {
      path: '/graphql',
    },
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
