import { Account, AccountInstance, Actions } from 'models/account'
import { User, UserInstance } from 'models/user'
import { Document, Types } from 'mongoose'
import { Context } from 'services/context'
import { create } from 'services/logger'
import { loadTypeDefs } from 'services/typeDefs'
import { TypeDef } from 'types/def'

const log = create('types', 'account')

export const account: TypeDef<AccountInstance> = {
  name: 'Account',
  typeDefs: loadTypeDefs(__dirname)('account'),
  Query: {
    accounts: () => Account.findAll(),
  },
  Resolver: {
    users: async account => account.getOwners(),
  },
  Mutation: {},
  Subscription: {},
  joins: [
    {
      name: 'User',
      Resolver: {
        accounts: Actions.findByUser,
      },
    },
  ],
}
