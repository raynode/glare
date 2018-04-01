
import { graphqlKoa } from 'apollo-server-koa'
import { AuthResponse, verifyToken } from 'authorization'
import config from 'config'
import { addMockFunctionsToSchema, makeExecutableSchema } from 'graphql-tools'
import { create, Log } from 'logger'
import { v4 } from 'uuid'

import { loadTypeDefs } from 'gql/utils/typeDefs'

import { typeDefs as userTypeDefs } from './user'

const log = create('graphql')

const resolvers = {
  Query: {
    uptime: () => process.uptime(),
  },
}

const typeDefs = [
  loadTypeDefs(__dirname)('root'),
  userTypeDefs,
  // ...ResolverTypeDefs,
]

const schema = makeExecutableSchema({ typeDefs, resolvers })

// addMockFunctionsToSchema({
//   // mocks: Mocks,
//   preserveResolvers: true,
//   schema,
// })

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

// export const graphqlInstance = graphqlExpress((req: GQLRequest) => ({
//   context: req.context,
//   schema,
// }))
