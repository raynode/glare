import { Accounts } from 'db/accounts'
import { Account, User } from 'db/models'
import { Users } from 'db/users'
import { Document, Types } from 'mongoose'
import { Context } from 'services/context'
import { create } from 'services/logger'
import { loadTypeDefs } from 'services/typeDefs'
import { TypeDef } from 'types/def'

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
