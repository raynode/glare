import { GraphQLNonNull, GraphQLObjectType, GraphQLScalarType, GraphQLString } from 'graphql'

import { Build } from 'gram/lib/createBuild/types'
import { builder } from 'graph/builder'
import { pubsub, withFilter } from 'services/pubsub'

import { create } from 'services/logger'

const log = create('functions:event')

export const eventFieldDefinition = <BuildMode, Context>(build: Build<BuildMode, Context>) => {
  const EVENT = 'EVENT'

  build.addType('Event', 'type', {
    fields: {
      name: 'String!',
      data: 'JSON',
      time: 'DateTime!',
      info: 'String',
    },
  })

  build.addMutation('triggerEvent', 'String', {
    args: {
      name: 'String!',
      data: 'JSON',
      info: 'String',
    },
    resolver: (_, args, context) => {
      log('create-event', args)
      return pubsub.publish(EVENT, args)
    },
  })

  build.addSubscription('eventListener', 'Event', {
    args: { name: 'String' },
    subscribe: withFilter(
      () => pubsub.asyncIterator([EVENT]),
      (event, variables) => variables.name === '*' || event.name === variables.name,
    ),
    resolve: ({ name, data, info }) => ({ name, data, info, time: new Date() }),
  })
}
