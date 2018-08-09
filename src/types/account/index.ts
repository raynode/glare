
import { Document, Types } from 'mongoose'

import { Context } from 'services/context'
import { loadTypeDefs } from 'services/typeDefs'
import { TypeDef } from 'types/def'

import { Account, User } from 'db/models'

import { Accounts } from 'db/accounts'
import { Users } from 'db/users'

import { create } from 'logger'
const log = create('types', 'account')

// query function to find all accounts
const accounts = () => Accounts.find()

export const account: TypeDef<Account> = {
  name: 'Account',
  typeDefs: loadTypeDefs(__dirname)('account'),
  Query: { accounts },
  Resolver: {
    id: account => account._id,
    users : async account => {
      const userIds = account.get('users')
      if(!userIds)
        return null
      return Users.find({
        _id: { $in: userIds.map(Types.ObjectId) },
      })
    },
  },
  Mutation: {},
  Subscription: {},
  joins: [{
    name: 'User',
    Resolver: {
      accounts: async (user: User) => Accounts.find({
        users: [ user._id ],
      }),
    },
  }],
}
