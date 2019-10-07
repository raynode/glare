import * as Boom from '@hapi/boom'
import * as Koa from 'koa'
// import the koa router as it enhances the Request object
import * as koaBody from 'koa-body'
import * as Router from 'koa-router'

import { Assets } from 'db/models/asset'
import { saveToBuffer } from 'services/file'
import { createContext } from 'services/graphql-context'
import { create } from 'services/logger'

const log = create('routes', 'assets')

export const connect = async (router: Router, app: Koa) => {
  log('connecting asset routes')
  router.post('/asset', async (ctx, next) => {
    const file = ctx.request.files.asset
    const buffer = await saveToBuffer(file)
    ctx.type = file.type
    try {
      const assets = await Assets.create(await createContext({ ctx }), {
        data: {
          name: file.name,
          type: file.type,
          mimetype: file.type,
          data: buffer,
        },
      })
      if (!assets || !assets.length) throw new Error(`could not create ${file.name}`)
      const asset = assets[0]
      ctx.body = { id: asset.id, name: asset.name }
    } catch (error) {
      throw Boom.internal(error)
    }
  })

  router.get('/asset/:id', async (ctx, next) => {
    try {
      const assets = await Assets.find(await createContext({ ctx }), {
        where: query => query.where('id', ctx.params.id),
        page: query => query.limit(1),
      })
      if (!assets || !assets.length) throw new Error(`Asset ${ctx.params.id} not found`)
      const asset = assets[0]
      ctx.type = asset.mimetype
      ctx.body = asset.data
    } catch (error) {
      throw Boom.badRequest(error)
    }
  })
}
