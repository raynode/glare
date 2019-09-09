import { GQLBuild, GQLSchemaBuilder } from 'graph/builder'
import { GraphQLEnumType } from 'graphql'

import { single } from 'db'
import { TokenStore, TokenStores, User, Users } from 'db/models'
import { createService } from 'graph/base-service'

export default (builder: GQLSchemaBuilder) => {
  const user = builder.model('User', createService(Users))
  user.resolve(() => ({
    createdAt: user => user.created_at,
    updatedAt: user => user.updated_at,
  }))

  user.attr('email', 'String')
  user.attr('emailVerified', 'Boolean')
  user.attr('familyName', 'String')
  user.attr('gender', 'String')
  user.attr('givenName', 'String')
  user.attr('googleID', 'String')
  user.attr('locale', 'String')
  user.attr('name', 'String')
  user.attr('nickname', 'String')
  user.attr('picture', 'String')
  user.attr(
    'state',
    new GraphQLEnumType({
      name: 'UserState',
      values: {
        admin: { value: 'admin' },
        guest: { value: 'guest' },
        member: { value: 'member' },
      },
      description: 'Possible user states',
    }),
  )
}

export const userBuild = async (build: GQLBuild) => {
  // const t = (await TokenStores.find())[0]

  build.addType('Token', {
    fields: {
      id: 'ID!',
      data: 'JSON!',
      service: 'String!',
    },
  })

  build.addQuery('me', 'User', { resolver: (_1, _2, context) => (context.auth ? context.user : null) })
  build.extendType<User>('User', {
    fields: {
      tokens: {
        args: {
          service: 'String',
        },
        type: '[Token!]!',
      },
    },
    resolver: {
      tokens: async (user, args, context) => {
        return {}
      },
    },
  })
}
