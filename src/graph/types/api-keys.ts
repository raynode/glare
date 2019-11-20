import { GQLBuild, GQLSchemaBuilder } from 'graph/builder'

import { ApiKeys, User } from 'db/models'
import { createService } from 'graph/base-service'

export const apiKeyBuild = (build: GQLBuild) => {
  build.addType('ApiKey', {
    fields: {
      key: 'String!',
      service: 'String!',
      User: 'User!',
    },
  })

  build.extendType<User>('User', {
    fields: {
      apiKeys: {
        args: {
          service: 'String',
        },
        type: '[ApiKey!]!',
      },
    },
    resolver: {
      apiKeys: async (user, args, context) =>
        ApiKeys.find(context, {
          where: query => query.where({ ...args, userId: user.id }),
        }),
    },
  })
}
