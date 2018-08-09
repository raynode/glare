
import { ApolloServer, gql } from 'apollo-server'

import config from 'config'
import log from 'logger'

import { getMongoConnection } from 'db'
import { resolvers } from 'types'

process.on('unhandledRejection', rejection => log.error(rejection))

const server = new ApolloServer({
  typeDefs: gql(resolvers.typeDefs.join('')),
  resolvers: {
    Query: resolvers.Query,
    Mutation: resolvers.Mutation,
    Subscription: resolvers.Subscription,
  },
  mocks: {
    DateTime: () => new Date(),
  },
})

server.listen(config.port)
.then(serverInfo => {
  log(`🚀 Server running on port ${serverInfo.port}`)
  log(`url: ${serverInfo.url}`)
  log(`subscriptionsUrl: ${serverInfo.subscriptionsUrl}`)
})

// const createApp = async (config, port = 3412) => {
//   const app = new Koa()
//   const http = new Router()

//   const mongo = getMongoConnection()
//   .catch(rejection => log.error(rejection))

//   // koaBody is needed just for POST.
//   http.post('/graphql', koaBody(), gqlServer)
//   http.get('/graphql', gqlServer)
//   http.get('/graphiql', giqlServer)

//   http.get('/*', async ctx => {
//     ctx.body = 'Hello World!'
//   })

//   app.use(async (ctx, next) => {
//     log(ctx.req.url)
//     await next()
//     if(ctx.body)
//       log('done:', ctx.body.length)
//     else
//       log.error('fail:', ctx.status)
//   })
//   app
//     .use(cors())
//     .use(http.routes())
//     .use(http.allowedMethods())

//   const server = app.listen(port)

//   subscriptions({
//     path: '/graphws',
//     server,
//   })

//   return port
// }
