import { Build, SchemaBuilder } from 'gram'
import { GraphQLBoolean, GraphQLEnumType, GraphQLString } from 'graphql'

import { single } from 'db'
import { Users } from 'db/models'
import { createService } from 'graph/base-service'

export default <Context, QueryContext>(builder: SchemaBuilder<Context, QueryContext>) => {
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

export const userBuild = <BuildMode, Context>(build: Build<BuildMode, Context>) => {
  build.addQuery('me', 'User', () => single(Users.find()))
}
