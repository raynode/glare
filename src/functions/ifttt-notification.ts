import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql'

import { BaseSchema } from '@raynode/graphql-connector'
import { DateType, JSONType } from '@raynode/graphql-connector-sequelize'
import { pubsub, withFilter } from 'services/pubsub'

import { webhook } from 'services/ifttt-webhook'
import { create } from 'services/logger'

const log = create('functions:ifttt:webhook')

export const iftttNotificationBaseSchema = (): BaseSchema<any> => {
  const NotificationType = new GraphQLObjectType({
    name: 'Notifcation',
    fields: {
      title: { type: GraphQLNonNull(GraphQLString) },
      message: { type: JSONType },
      image: { type: GraphQLString },
    },
  })

  return {
    getModel: () => null,
    queryFields: {
      event: { type: GraphQLString },
    },
    mutationFields: {
      sendNotification: {
        args: {
          title: { type: GraphQLNonNull(GraphQLString) },
          message: { type: JSONType },
          image: { type: GraphQLString },
        },
        resolve: (_, { title, message, image = null }, context) => {
          log('send notification', title, message, image)
          webhook({
            event: 'notification',
            value1: title,
            value2: message,
            value3: image,
          })
          return { title, message, image }
        },
        type: NotificationType,
      },
    },
  }
}
