import * as cors from '@koa/cors'
import * as Koa from 'koa'
import * as koaBody from 'koa-bodyparser' // koa-bodyparser@next
import * as Router from 'koa-router'

import { getMongoConnection } from 'db'
import {
  giqlServer,
  gqlServer,
  subscriptions,
} from 'gql'

import config from 'config'
import injector from 'injector'
import log from 'logger'

process.on('unhandledRejection', rejection => log.error(rejection))

const createApp = async (config, port = 3412) => {
  const app = new Koa()
  const http = new Router()

  const mongo = getMongoConnection()
  .catch(rejection => log.error(rejection))

  // koaBody is needed just for POST.
  http.post('/graphql', koaBody(), gqlServer)
  http.get('/graphql', gqlServer)
  http.get('/graphiql', giqlServer)

  http.get('/*', async ctx => {
    ctx.body = 'Hello World!'
  })

  app.use(async (ctx, next) => {
    log(ctx.req.url)
    await next()
    if(ctx.body)
      log('done:', ctx.body.length)
    else
      log.error('fail:', ctx.status)
  })
  app
    .use(cors())
    .use(http.routes())
    .use(http.allowedMethods())

  const server = app.listen(port)

  subscriptions({
    path: '/graphws',
    server,
  })

  return port
}

createApp(config, 3421)
.then(port => {
  log(`Server running on port ${port}`)
  log(`GraphQL running on http://localhost:${port}/graphql`)
  log(`WebSocket running on http://localhost:${port}/graphws`)
})
