
import { Document, Types } from 'mongoose'

import { collectionNameToType, getMongoConnection } from 'db'

import { Context } from 'services/context'
import { loadTypeDefs } from 'services/typeDefs'
import { TypeDef } from 'types/def'

import { createSubscritionResolver, pubsub, Subscriptions } from 'services/pubsub'

import { create } from 'logger'
const log = create('types', 'root')

const resolveNode = async <T>(_, { id }): Promise<T> => {
  const nodeId = Types.ObjectId(id)
  const collections = await (await getMongoConnection()).db.collections()
  if(!collections.length)
    return null
  const results = await Promise.all(collections.map(async collection => ({
    name: collection.collectionName,
    result: await collection.findOne({ _id: nodeId }),
    collection,
  })))
  const result = results.find(({ name, result }) => {
    log(result, name)
    return result
  })
  if(!result) {
    log('no result found')
    return null
  }
  const res: T = {
    ...result.result,
    __typename: collectionNameToType(result.name),
  }
  return res
}

let num = 0

export const root: TypeDef<Document> = {
  name: 'Node',
  typeDefs: loadTypeDefs(__dirname)('root'),
  Query: {
    uptime: () => process.uptime(),
    node: resolveNode,
    getNumber: () => num,
  },
  Resolver: {
    id: node => node._id,
  },
  Mutation: {
    setNumber: (node, { n }, ctx) => {
      if(!ctx.user)
        return new Error('Not authenticated to use this method')
      num = n
      pubsub.publish(Subscriptions.ChangedNumber, num)
      return num
    },
  },
  Subscription: {
    numberChanged: createSubscritionResolver(Subscriptions.ChangedNumber),
  },
  joins: [],
}
