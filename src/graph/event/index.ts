import { GraphQLNonNull, GraphQLObjectType, GraphQLScalarType, GraphQLString } from 'graphql'

import { FieldDefinition } from 'gram'
import { builder } from 'graph/builder'
import { pubsub, withFilter } from 'services/pubsub'

import { create } from 'services/logger'

const log = create('functions:event')

export const eventFieldDefinition = (): FieldDefinition => {
  const EVENT = 'EVENT'

  const EventType = new GraphQLObjectType({
    name: 'Event',
    fields: {
      name: { type: GraphQLNonNull(GraphQLString) },
      data: { type: builder.getScalar('JSON') },
      time: { type: GraphQLNonNull(builder.getScalar('DateTime')) },
      info: { type: GraphQLString },
    },
  })

  return {
    query: {
      event: { type: GraphQLString },
    },
    mutation: {
      triggerEvent: {
        args: {
          name: { type: GraphQLNonNull(GraphQLString) },
          data: { type: builder.getScalar('JSON') },
          info: { type: GraphQLString },
        },
        resolve: (_, args, context) => {
          log('create-event', args)
          return pubsub.publish(EVENT, args)
        },
        type: GraphQLString,
      },
    },
    subscription: {
      eventListener: {
        args: { name: { type: GraphQLString } },
        subscribe: withFilter(
          () => pubsub.asyncIterator([EVENT]),
          (event, variables) => variables.name === '*' || event.name === variables.name,
        ),
        resolve: ({ name, data, info }) => ({ name, data, info, time: new Date() }),
        type: EventType,
      },
    },
  }
}
