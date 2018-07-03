
import { graphiqlKoa, graphqlKoa } from 'apollo-server-koa'
import { AuthResponse, verifyToken } from 'authorization'
import config from 'config'
import { execute, subscribe } from 'graphql'
import { addMockFunctionsToSchema, makeExecutableSchema } from 'graphql-tools'
import { create, Log } from 'logger'
import { SubscriptionServer } from 'subscriptions-transport-ws'

import { collectionNameToType, getMongoConnection } from 'db'
import { Types } from 'mongoose'

import { createSubscritionResolver, pubsub, Subscriptions } from 'services/pubsub'
import { v4 } from 'uuid'
import { ServerOptions } from 'ws'

import { loadTypeDefs } from 'gql/utils/typeDefs'

import {
  Mutations as userMutations,
  Query as userQuery,
  Resolver as userResolver,
  typeDefs as userTypeDefs,
} from './user'

import {
  AccountUserResolver,
  Mutations as accountMutations,
  Query as accountQuery,
  Resolver as accountResolver,
  typeDefs as accountTypeDefs,
} from './account'

import {
  ExpenseAccountResolver,
  ExpenseUserResolver,
  Mutations as expenseMutations,
  Query as expenseQuery,
  Resolver as expenseResolver,
  typeDefs as expenseTypeDefs,
} from './expense'

import {
  Mutations as articleMutations,
  Query as articleQuery,
  Resolver as articleResolver,
  Subscription as articleSubscription,
  typeDefs as articleTypeDefs,
} from './article'

const log = create('graphql')
const logWs = log.create('subscription')

const resolveNode = async <T>(_, { id }): Promise<T> => {
  const nodeId = Types.ObjectId(id)
  const collections = await (await getMongoConnection()).db.collections()
  if(!collections.length)
    return null
  const results = await Promise.all(collections.map(async collection => ({
    name: collection.collectionName,
    result: await collection.findOne({ _id: nodeId }),
    collection,
  })))
  const result = results.find(({ name, result }) => {
    console.log(result, name)
    return result
  })
  if(!result)
    return null
  const res: T = {
    ...result.result,
    __typename: collectionNameToType(result.name),
  }
  return res
}

let num = 0

const resolvers = {
  Account: { ...accountResolver, ...ExpenseAccountResolver },
  User: { ...userResolver, ...AccountUserResolver, ...ExpenseUserResolver },
  Expense: { ...expenseResolver },
  Article: { ...articleResolver },

  Query: {
    uptime: () => process.uptime(),
    node: resolveNode,
    getNumber: () => num,
    ...userQuery,
    ...accountQuery,
    ...expenseQuery,
    ...articleQuery,
  },

  Mutation: {
    setNumber: (_, { n }) => {
      num = n
      pubsub.publish(Subscriptions.ChangedNumber, num)
      return num
    },
    ...userMutations,
    ...accountMutations,
    ...expenseMutations,
    ...articleMutations,
  },

  Subscription: {
    numberChanged: createSubscritionResolver(Subscriptions.ChangedNumber),
    ...articleSubscription,
  },
}

const typeDefs = [
  loadTypeDefs(__dirname)('root'),
  userTypeDefs,
  accountTypeDefs,
  expenseTypeDefs,
  articleTypeDefs,
  // ...ResolverTypeDefs,
]

const schema = makeExecutableSchema({ typeDefs, resolvers })

const Mocks = {
  DateTime: () => new Date(),
}

addMockFunctionsToSchema({
  mocks: Mocks,
  preserveResolvers: true,
  schema,
})

const getUserInformation = async (authHeader: any): Promise<AuthResponse | null> => {
  if(!authHeader || typeof authHeader !== 'string')
    return null
  const parts = authHeader.split(' ')
  if(!parts.length)
    return null
  if(parts.length === 1)
    return verifyToken(parts[0])
  if(parts[0].toLowerCase() === 'bearer')
    return verifyToken(parts[1])
  return null
}

const makeLogger = (user: AuthResponse | string) => {
  if(!user)
    return log.create()
}

export const giqlServer = graphiqlKoa({
  endpointURL: '/graphql',
})

export const gqlServer = graphqlKoa(async ctx => {
  const tokenString = ctx.req.headers && ctx.req.headers.authorization

  const user = await getUserInformation(tokenString)
  .catch(() => null)

  log('creating context', user)

  const context = {
    log,
    user,
  }
  return {
    schema,
    context,
  }
})

export const subscriptions = (options: ServerOptions) => SubscriptionServer.create({
  schema,
  execute,
  subscribe,
  // onConnect: (connectionParams, socket: WebSocket) => {
  //   logWs(connectionParams)
  //   try {
  //     // const { user } = jwt.verify(connectionParams.authToken, env('AUTH_SECRET'))
  //     // const jwtData = jwtDecode(connectionParams.authToken)
  //     // const timeout = jwtData.exp * 1000 - Date.now()
  //     // debugPubSub('authenticated', jwtData)
  //     // debugPubSub('set connection timeout', timeout)
  //     // setTimeout(() => {
  //     //   // let the client reconnect
  //     //   socket.close()
  //     // }, timeout)
  //     return { subscriptionUser: null }
  //   } catch (error) {
  //     // debugPubSub('authentication failed', error.message)
  //     return { subscriptionUser: null }
  //   }
  // },
  // onOperation(message: string, params: any) {
  //   console.log(message, params)
  //   // setTimeout(() => {
  //   //   R.forEach((todo: Todo) => {
  //   //     pubsub.publish(TODO_UPDATED_TOPIC, { todoUpdated: todo })
  //   //     debugPubSub('publish', TODO_UPDATED_TOPIC, todo)
  //   //   }, todos)
  //   // }, 0)
  //   // return Promise.resolve(params)
  // },
}, options)

// export const graphqlInstance = graphqlExpress((req: GQLRequest) => ({
//   context: req.context,
//   schema,
// }))
