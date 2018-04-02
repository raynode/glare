import * as Koa from 'koa'
import * as koaBody from 'koa-bodyparser' // koa-bodyparser@next
import * as Router from 'koa-router'

import { getMongoConnection } from 'db'
import { gqlServer } from 'gql'

import config from 'config'
import injector from 'injector'
import log from 'logger'

process.on('unhandledRejection', rejection => log.error(rejection))

const createApp = async (config, port = 3000) => {
  log(config)
  const app = new Koa()
  const router = new Router()

  const mongo = getMongoConnection()
  .catch(rejection => log.error(rejection))

  // koaBody is needed just for POST.
  router.post('/graphql', koaBody(), gqlServer)
  router.get('/graphql', gqlServer)

  router.get('/*', async ctx => {
    ctx.body = 'Hello World!'
  })

  app.use(async (ctx, next) => {
    log(ctx.req.url)
    await next()
    log('done:', ctx.body.length)
  })
  app.use(router.routes())
  app.use(router.allowedMethods())

  app.listen(port)

  return port
}

createApp(config, 3000)
.then(port => log('running on port', port))
