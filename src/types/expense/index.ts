
import { loadTypeDefs } from 'services/typeDefs'
import { TypeDef } from 'types/def'

import { Account } from 'models/account'
import { Actions, Expense, ExpenseInstance } from 'models/expense'
import { User } from 'models/user'

import { create } from 'services/logger'

const log = create('db', 'model', 'expenses')
export const typeDefs = loadTypeDefs(__dirname)('expense')

export const expense: TypeDef<ExpenseInstance> = {
  name: 'Expense',
  typeDefs: loadTypeDefs(__dirname)('expense'),
  Query: {
  },
  Resolver: {
    account : expense => Account.findOne({ where: { id: expense.accountId }}),
    user : expense => User.findOne({ where: { id: expense.userId }}),
  },
  Mutation: {},
  Subscription: {},
  joins: [{
    name: 'User',
    Resolver: {
      expenses: Actions.findByUser,
    },
  }, {
    name: 'Account',
    Resolver: {
      expenses: Actions.findByAccount,
    },
  }],
}
