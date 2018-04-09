
import { graphqlKoa } from 'apollo-server-koa'
import { AuthResponse, verifyToken } from 'authorization'
import config from 'config'
import { execute, subscribe } from 'graphql'
import { PubSub, withFilter } from 'graphql-subscriptions'
import { addMockFunctionsToSchema, makeExecutableSchema } from 'graphql-tools'
import { create, Log } from 'logger'
import { SubscriptionServer } from 'subscriptions-transport-ws'

import { v4 } from 'uuid'
import { ServerOptions } from 'ws'

import { loadTypeDefs } from 'gql/utils/typeDefs'

import {
  Mutations as userMutations,
  Query as userQuery,
  Resolver as userResolver,
  typeDefs as userTypeDefs,
} from './user'

const log = create('graphql')
const logWs = log.create('subscription')

const resolvers = {
  User: userResolver,

  Query: {
    uptime: () => process.uptime(),
    ...userQuery,
  },

  Mutation: {
    ...userMutations,
  },
}

const typeDefs = [
  loadTypeDefs(__dirname)('root'),
  userTypeDefs,
  // ...ResolverTypeDefs,
]

const schema = makeExecutableSchema({ typeDefs, resolvers })

addMockFunctionsToSchema({
  // mocks: Mocks,
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
  onConnect: (connectionParams, socket: WebSocket) => {
    logWs(connectionParams)
    try {
      // const { user } = jwt.verify(connectionParams.authToken, env('AUTH_SECRET'))
      // const jwtData = jwtDecode(connectionParams.authToken)
      // const timeout = jwtData.exp * 1000 - Date.now()
      // debugPubSub('authenticated', jwtData)
      // debugPubSub('set connection timeout', timeout)
      // setTimeout(() => {
      //   // let the client reconnect
      //   socket.close()
      // }, timeout)
      return { subscriptionUser: null }
    } catch (error) {
      // debugPubSub('authentication failed', error.message)
      return { subscriptionUser: null }
    }
  },
  onOperation(message: string, params: any) {
    console.log(message, params)
    // setTimeout(() => {
    //   R.forEach((todo: Todo) => {
    //     pubsub.publish(TODO_UPDATED_TOPIC, { todoUpdated: todo })
    //     debugPubSub('publish', TODO_UPDATED_TOPIC, todo)
    //   }, todos)
    // }, 0)
    // return Promise.resolve(params)
  },
}, options)

// export const graphqlInstance = graphqlExpress((req: GQLRequest) => ({
//   context: req.context,
//   schema,
// }))
