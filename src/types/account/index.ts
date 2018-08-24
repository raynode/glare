
import { Document, Types } from 'mongoose'

import { Context } from 'services/context'
import { loadTypeDefs } from 'services/typeDefs'
import { TypeDef } from 'types/def'

import { Account, AccountInstance } from 'models/account'

import { create } from 'services/logger'
const log = create('types', 'account')

export const account: TypeDef<AccountInstance> = {
  name: 'Account',
  typeDefs: loadTypeDefs(__dirname)('account'),
  Query: { accounts: () => Account.findAll() },
  Resolver: {
    users : async (account: any) => account.getOwners(),
  },
  Mutation: {},
  Subscription: {},
  joins: [{
    name: 'User',
    Resolver: {
      accounts: async (user: any) => user.getAccount(),
    },
  }],
}
