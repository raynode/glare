
import { loadTypeDefs } from 'services/typeDefs'
import { TypeDef } from 'types/def'

import { Widget } from 'db/models'
import { Widgets } from 'db/widgets'

import { create } from 'logger'
const log = create('types', 'widget')

// query function to find all accounts
const store = [
]

export const widget: TypeDef<Widget> = {
  name: 'Widget',
  typeDefs: loadTypeDefs(__dirname)('widget'),
  Query: {
    widgets: () => store,
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
