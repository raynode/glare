
import { Document, Types } from 'mongoose'

import { Context } from 'services/context'
import { loadTypeDefs } from 'services/typeDefs'
import { TypeDef } from 'types/def'

import { User, UserInstance } from 'models/user'

import { create } from 'services/logger'
const log = create('types', 'user')

export const user: TypeDef<UserInstance> = {
  name: 'User',
  typeDefs: loadTypeDefs(__dirname)('user'),
  Query: {
    findUserByEmail: (obj, args, context) => User.findOne({ where: { email: args.input.email }}),
    user: (obj, args, context) => User.findOne({ where: { email: args.input.email }}),
    users: (obj, args, context) => User.findAll(),
    me: async (obj, args, context) => {
      if(context.user)
        return context.user
      if(!context.auth)
        return null
      return context.user = await User.findOne({ where: { email: context.auth.email }})
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
