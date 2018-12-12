import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql'

import { BaseSchema } from '@raynode/graphql-connector'
import { DateType, JSONType } from '@raynode/graphql-connector-sequelize'
import { pubsub, withFilter } from 'services/pubsub'

export const eventBaseSchema = (): BaseSchema<any> => {
  const EVENT = 'EVENT'

  const EventType = new GraphQLObjectType({
    name: 'Event',
    fields: {
      name: { type: GraphQLNonNull(GraphQLString) },
      data: { type: JSONType },
      time: { type: GraphQLNonNull(DateType) },
    },
  })

  return {
    getModel: () => null,
    queryFields: {
      event: { type: GraphQLString },
    },
    mutationFields: {
      triggerEvent: {
        args: {
          name: { type: GraphQLNonNull(GraphQLString) },
          data: { type: JSONType },
        },
        resolve: (_, args, context) => pubsub.publish(EVENT, args),
        type: GraphQLString,
      },
    },
    subscriptionFields: {
      eventListener: {
        args: { name: { type: GraphQLString } },
        subscribe: withFilter(
          () => pubsub.asyncIterator([EVENT]),
          (event, variables) => variables.name === '*' || event.name === variables.name,
        ),
        resolve: ({ name, data }) => ({ name, data, time: new Date() }),
        type: EventType,
      },
    },
  }
}
