
import { Document, Types } from 'mongoose'

import { Context } from 'services/context'
import { loadTypeDefs } from 'services/typeDefs'
import { TypeDef } from 'types/def'

import { User } from 'db/models'
import { Actions } from 'db/users'

import { create } from 'services/logger'
const log = create('types', 'user')

export const user: TypeDef<User> = {
  name: 'User',
  typeDefs: loadTypeDefs(__dirname)('user'),
  Query: {
    findUserByEmail: (obj, args, context) => Actions.findUserByEmail(args.input.email),
    user: (obj, args, context) => Actions.findUserByEmail(args.input.email),
    users: (obj, args, context) => Actions.users(),
    me: async (obj, args, context) => {
      if(context.user)
        return context.user
      if(!context.auth)
        return null
      return context.user = await Actions.findUserByEmail(context.auth.email)
    },
  },
  Resolver: {
    id: user => user._id,
  },
  Mutation: {
    // userLogin: (_, args, context) => {
    //   log(args)
    //   return null
    // },
    userCreate: (_, { input }, context) => Actions.userCreate(input),
  },
  Subscription: {},
  joins: [],
}
