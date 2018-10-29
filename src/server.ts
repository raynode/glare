
import { config } from 'config'
import { Log } from 'services/logger'

import * as koaCors from '@koa/cors'
import * as Koa from 'koa'
import * as koaBody from 'koa-body'
import * as Router from 'koa-router'

import { ApolloServer } from 'apollo-server-koa'

import { buildGraphQL } from 'services/graphql-binding'
import { convertToModel } from 'services/graphql-binding/convert-to-model'

import { initialized, models } from 'models/init'

import { map } from 'lodash'

import { File } from 'formidable'
import * as fs from 'fs'

import {
  GraphQLObjectType,
  GraphQLSchema,
} from 'graphql'

export const server = async (log: Log) => {
  const apolloLogger = log.create('apollo-server')

  const bindings = buildGraphQL(map(models, convertToModel))

  const { queryFields, mutationFields } = bindings

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: queryFields,
    }),
    mutation: new GraphQLObjectType({
      name: 'Mutation',
      fields: mutationFields,
    }),
  })

  const server = new ApolloServer({
    schema,
    tracing: true,
    playground: {
      // Force setting, workaround: https://github.com/prisma/graphql-playground/issues/790
      settings: {
        'editor.theme': 'dark',
        'editor.cursorShape': 'line',
      },
    },
  })

  const app = new Koa()
  const router = new Router()

  const saveToBuffer = (file: File) => new Promise((resolve, reject) => {
    const buffer = []
    const reader = fs.createReadStream(file.path)
    reader.on('data', data => buffer.push(data))
    reader.on('end', () => resolve(Buffer.concat(buffer)))
    reader.on('error', reject)
  })

  router.post('/asset', async (ctx, next) => {
    const file = ctx.request.files.asset
    const buffer = await saveToBuffer(file)
    ctx.type = file.type
    const asset = await models.Asset.create({
      name: file.name,
      type: file.type,
      mimetype: file.type,
      data: buffer,
    } as any)
    ctx.body = { id: asset.id, name: asset.name }
  })

  router.get('/asset/:id', async (ctx, next) => {
    const asset = await models.Asset.findById(ctx.params.id)
    ctx.type = asset.mimetype
    ctx.body = asset.data
  })

  app
  .use(koaCors())
  .use(koaBody({
    formLimit: '10mb',
    jsonLimit: '10mb',
    textLimit: '10mb',
    multipart: true,
  }))
  .use(router.routes())
  .use(router.allowedMethods())

  server.applyMiddleware({ app, path: config.path })

  return initialized
  .then(() => app.listen(config.port))
  .then(() => ({
    app,
    server,
    port: config.port,
    url: config.path,
    subscriptionsUrl: config.path,
  }))
}
