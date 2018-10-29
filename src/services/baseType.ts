import { Instance, Model } from 'services/db'
import { createSubscritionResolver, pubsub } from 'services/pubsub'

export const createBaseType = <Attr, Inst extends Instance<Attr> & Attr>(
  type: string,
  model: Model<Inst & Attr, Attr>,
) => {
  const events = {
    created: `created${type}`,
    updated: `updated${type}`,
    deleted: `deleted${type}`,
  }
  const createType = async (_, { input }) => {
    const instance = await model.create(input)
    pubsub.publish(events.created, instance)
    return instance
  }
  const updateType = async (_, { input }) => {
    const instance = await model.update(input)
    pubsub.publish(events.updated, instance)
    return instance
  }
  const findOneOfType = (_, { input }) => model.findOne({ where: input })
  const findAllOfType = (_, { input }) => model.findAll({ where: input })
  const removeOneOfType = async (_, { input }) => {
    const instance = await findOneOfType(_, { input })
    await instance.destroy()
    pubsub.publish(events.deleted, instance)
    return instance
  }
  const removeAllOfType = async (_, { input }) => {
    const instances = await findAllOfType(_, { input })
    await Promise.all(
      instances.map(async instance => {
        await instance.destroy()
        pubsub.publish(events.deleted, instance)
      }),
    )
    return instances
  }
  return {
    Mutation: {
      [`create${type}`]: createType,
      [`update{type}`]: updateType,
      [`removeOneOf${type}`]: removeOneOfType,
      [`removeAllOf${type}`]: removeAllOfType,
    },
    Query: {
      [`findOneOf${type}`]: findOneOfType,
      [`findAllOf${type}`]: findAllOfType,
    },
    Subscription: {
      [events.created]: createSubscritionResolver(events.created),
      [events.updated]: createSubscritionResolver(events.updated),
      [events.deleted]: createSubscritionResolver(events.deleted),
    },
  }
}
