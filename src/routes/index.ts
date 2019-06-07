import * as Koa from 'koa'
import * as logger from 'koa-logger'
import * as Router from 'koa-router'
// import { connect as connectAssets } from 'routes/assets'
// import { connect as connectAuth } from 'routes/auth'

export const connect = (router: Router, app: Koa) => {
  app.use(logger())
  return Promise.all(
    [
      // connectAssets,
      // connectAuth,
    ].map(connect =>
      connect(
        router,
        app,
      ),
    ),
  )
}
