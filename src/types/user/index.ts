import { Document, Types } from 'mongoose'

import { Context } from 'services/context'
import { loadTypeDefs } from 'services/typeDefs'
import { TypeDef } from 'types/def'

import { Actions, User, UserInstance } from 'models/user'

import { create } from 'services/logger'
const log = create('types', 'user')

export const user: TypeDef<UserInstance> = {
  name: 'User',
  typeDefs: loadTypeDefs(__dirname)('user'),
  Query: {
    findUserByEmail: (obj, args, context) => Actions.findByEmail(args.input.email),
    user: (obj, { input }, context) => (input.id ? Actions.findById(input.id) : Actions.findByEmail(input.email)),
    users: (obj, args, context) => Actions.findAll(),
    me: async (obj, args, context) => {
      if (context.user) return context.user
      if (!context.auth) return null
      return (context.user = await Actions.findByEmail(context.user.email))
    },
  },
  Mutation: {
    // userLogin: (_, args, context) => {
    //   log(args)
    //   return null
    // },
    userCreate: (_, { input }, context) => {
      log('Creating new user: ', input)
      return User.create(input)
    },
  },
  Subscription: {},
  joins: [],
}
