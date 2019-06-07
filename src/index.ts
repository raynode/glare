import { config } from 'config'
import { attachSentryTransport, create } from 'services/logger'

import * as koaCors from '@koa/cors'
import * as Koa from 'koa'
import * as koaBody from 'koa-body'
import * as Router from 'koa-router'

import * as Boom from '@hapi/boom'

import { connect } from 'routes'

export const log = create({ enabled: true, transport: (c, msg) => console.log(...msg) })

const main = async () => {
  process.on('unhandledRejection', rejection => {
    log.error('unhandledRejection', rejection)
  })

  if (config.sentry.active) attachSentryTransport().catch(() => log.error('Error while connecting to sentry'))

  const { generateServer } = await import('graphql-server')

  const app = new Koa()
  const router = new Router()

  connect(
    router,
    app,
  )

  app
    .use(async (ctx, next) => {
      try {
        await next()
      } catch (error) {
        if (Boom.isBoom(error)) {
          const {
            output: { statusCode, payload },
          } = error
          ctx.status = statusCode
          ctx.body = payload
          return ctx
        }
        throw error
      }
    })
    .use(koaCors())
    .use(
      koaBody({
        formLimit: '10mb',
        jsonLimit: '10mb',
        textLimit: '10mb',
        multipart: true,
      }),
    )
    .use(router.routes())
    .use(
      router.allowedMethods({
        throw: true,
        notImplemented: () => Boom.notImplemented(),
        methodNotAllowed: () => Boom.methodNotAllowed(),
      }),
    )

  const { server } = await generateServer(app, log)

  log('Starting http server now')
  const httpServer = await app.listen(config.port)

  log(`🚀 Server ready at http://localhost:${config.port}${server.graphqlPath}`)
  try {
    server.installSubscriptionHandlers(httpServer)
    log(`🚀 Subscriptions ready at ws://localhost:${config.port}${server.subscriptionsPath}`)
  } catch (err) {
    log('No subscriptions due to: ', err)
  }
}

main().catch(err => log.error('Main threw an error:', err))
