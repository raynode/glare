
import { config } from 'config'
import { attachSentryTransport, log } from 'services/logger'

import { ApolloServer, gql } from 'apollo-server'
import { initialized, models } from 'models/init'
// import { bindingGenerator } from 'services/sequelize-graphql-binding'
import { convertToModel } from 'services/graphql-binding/convert-to-model'
import { buildGraphQL } from './services/graphql-binding'

import { map } from 'lodash'

import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  printSchema,
} from 'graphql'

const main = async () => {
  await initialized
  // const binding = bindingGenerator()

  const bindings = buildGraphQL(map(models, convertToModel))
  // const bindings = buildGraphQL([
  //   convertToModel(models.User),
  // ])

  console.log(bindings)
  // const schema = null

  // const { type: UserType, queryFields, mutationFields } = binding(models.User)
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

  try {
    console.log('--- === === === printSchema(schema) === === === ---')
    // console.log(printSchema(schema))
  } catch(e) {
    console.log(e)
    console.log(e.stack)
  }

  // process.exit()

  const server = new ApolloServer({
    cors: true,
    schema,
    tracing: true,
    playground: {
      // Force setting, workaround: https://github.com/prisma/graphql-playground/issues/790
      settings: {
        'editor.theme': 'dark',
        'editor.cursorShape': 'line',
      },
    },
    // mocks: {
    //   DateTime: () => new Date(),
    // },
    // context: createContext,
  })

  return initialized
  .then(() => server.listen(config.port))
}

const main2 = async () => {
  process.on('unhandledRejection', rejection => {
    log.error('unhandledRejection', rejection)
  })

  attachSentryTransport()
  .catch(() => log.error('Error while connecting to sentry'))

  const { server } = await import('server')
  server(log)
  .then(serverInfo => {
    log(`🚀 Server running on port ${serverInfo.port}`)
    log(`url: ${serverInfo.url}`)
    log(`subscriptionsUrl: ${serverInfo.subscriptionsUrl}`)
  })
}

main()
.catch(err => log.error('Main threw an error:', err))
