import { config } from 'config'
import { Log } from 'services/logger'

import * as Koa from 'koa'

import { ApolloServer } from 'apollo-server-koa'

import { createBaseSchemaGenerator, createSchema } from '@raynode/graphql-connector'
import { configuration } from '@raynode/graphql-connector-sequelize'

import { initialized, models } from 'models/init'

import { printSchema } from 'graphql'

export const generateServer = async (app: Koa, log: Log) => {
  const apolloLogger = log.create('apollo-server')

  const schema = createSchema(createBaseSchemaGenerator(configuration)(models))

  console.log(printSchema(schema))

  const server = new ApolloServer({
    schema,
    tracing: true,
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
