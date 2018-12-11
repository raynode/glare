import * as Koa from 'koa'
// import the koa router as it enhances the Request object
import * as koaBody from 'koa-body'
import * as Router from 'koa-router'

import { Asset } from 'models/asset'
import { saveToBuffer } from 'services/file'
import { create } from 'services/logger'

const log = create('routes', 'assets')

export const connect = async (router: Router, app: Koa) => {
  log('connecting asset routes')
  router.post('/asset', async (ctx, next) => {
    const file = ctx.request.files.asset
    const buffer = await saveToBuffer(file)
    ctx.type = file.type
    const asset = await Asset.create({
      name: file.name,
      type: file.type,
      mimetype: file.type,
      data: buffer,
    } as any)
    ctx.body = { id: asset.id, name: asset.name }
  })

  router.get('/asset/:id', async (ctx, next) => {
    const asset = await Asset.findById(ctx.params.id)
    ctx.type = asset.mimetype
    ctx.body = asset.data
  })
}
