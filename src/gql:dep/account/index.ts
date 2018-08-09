
import { loadTypeDefs } from 'gql/utils/typeDefs'
import { create } from 'logger'
import { Document, Types } from 'mongoose'

import config from 'config'
import { Accounts } from 'db/accounts'
import { Users } from 'db/users'

const log = create('db', 'model', 'account')
export const typeDefs = loadTypeDefs(__dirname)('account')

// fetches all users from the mongo database
const accounts = () => Accounts.find()
const findAccountByUserId = (userId: string) => null // Users.findOne({ email })
const findAccountByExpenseId = (expenseId: string) => null // Users.findOne({ email })

// a resolver is expected to export these four fields:
// Mutations { [string]: Resolver<User> }
// Query { [string]: Resolver<User> }
// Resolver { [string]: Resolver<User-fields> }
// Attachments { [other: Resolver]: { [string]: Resolver<User> } }

export const Mutations = {}

export const Query = {
  accounts,
}

export const Resolver = {
  // id needs to be mapped to the mongodb-id
  id: (account: Document): Types.ObjectId => account._id,
  users : async (account: Document) => {
    const userIds = account.get('users')
    if(!userIds)
      return null
    return Users.find({
      _id: { $in: userIds.map(Types.ObjectId) },
    })
  },
}

export const AccountUserResolver = {
  accounts: async (user: Document) => Accounts.find({
    users: [ user._id ],
  }),
}
