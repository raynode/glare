import { Build } from 'gram'

import { builder } from 'graph/builder'
import { create, resolveLogger } from 'services/logger'
import { pubsub, withFilter } from 'services/pubsub'

const log = create('functions:event')
const resolveLog = resolveLogger(log)

export interface EventSubscriptionArgs {
  name: string
  data: any
  info: any
}

export interface EventSubscriptionArguments {
  name?: string
}

export const eventFieldDefinition = <BuildMode, Context>(build: Build<BuildMode, Context>) => {
  const EVENT = 'EVENT'

  pubsub.subscribe(EVENT, (...args) => log.debug('EVENT', args))

  build.addType('Event', {
    fields: {
      name: 'String!',
      data: 'JSON',
      time: 'DateTime!',
      info: 'String',
    },
  })

  build.addMutation<never, EventSubscriptionArgs>('triggerEvent', 'String', {
    args: {
      name: 'String!',
      data: 'JSON',
      info: 'String',
    },
    resolver: resolveLog.on((_, args, context) => pubsub.publish(EVENT, args)),
  })

  build.addSubscription<EventSubscriptionArgs>('eventListener', 'Event', {
    args: { name: 'String' },
    subscribe: withFilter(
      () => pubsub.asyncIterator([EVENT]),
      (event: EventSubscriptionArgs, variables: EventSubscriptionArguments) =>
        ['*', event.name].includes(variables.name || '*'),
    ),
    resolve: ({ name, data, info }) => ({ name, data, info, time: new Date() }),
  })
}
