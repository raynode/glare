import { Document, Types } from 'mongoose'

import { Context } from 'services/context'
import { loadTypeDefs } from 'services/typeDefs'
import { TypeDef } from 'types/def'

import { Account, User } from 'db/models'

import { Accounts } from 'db/accounts'
import { Users } from 'db/users'

import { create } from 'services/logger'
const log = create('types', 'widget-group')

// query function to find all accounts
const store = []

export const widgetGroup: TypeDef<Account> = {
  name: 'WidgetGroup',
  typeDefs: loadTypeDefs(__dirname)('widget-group'),
  Query: {
    widgetGroups: () => store,
  },
  Resolver: {
    //     id: account => account._id,
    //     users : async account => {
    //       const userIds = account.get('users')
    //       if(!userIds)
    //         return null
    //       return Users.find({
    //         _id: { $in: userIds.map(Types.ObjectId) },
    //       })
    //     },
  },
  Mutation: {},
  Subscription: {},
  joins: [],
}
