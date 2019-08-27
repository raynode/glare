import { GQLBuild, GQLSchemaBuilder } from 'graph/builder'
import { GraphQLBoolean, GraphQLEnumType, GraphQLString } from 'graphql'

import { single } from 'db'
import { Users } from 'db/models'
import { createService } from 'graph/base-service'

export default (builder: GQLSchemaBuilder) => {
  const user = builder.model('User', createService(Users))
  user.resolve(() => ({
    createdAt: user => user.created_at,
    updatedAt: user => user.updated_at,
  }))

  user.attr('email', GraphQLString)
  user.attr('emailVerified', GraphQLBoolean)
  user.attr('familyName', GraphQLString)
  user.attr('gender', GraphQLString)
  user.attr('givenName', GraphQLString)
  user.attr('googleID', GraphQLString)
  user.attr('locale', GraphQLString)
  user.attr('name', GraphQLString)
  user.attr('nickname', GraphQLString)
  user.attr('picture', GraphQLString)
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

export const userBuild = (build: GQLBuild) => {
  build.addQuery('me', 'User', { resolver: (_1, _2, context) => (context.auth ? context.user : null) })
}
