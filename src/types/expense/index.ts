
import { loadTypeDefs } from 'services/typeDefs'
import { TypeDef } from 'types/def'

import { Expense, ExpenseInstance } from 'models/expense'

import { create } from 'services/logger'

const log = create('db', 'model', 'expenses')
export const typeDefs = loadTypeDefs(__dirname)('expense')

export const expense: TypeDef<ExpenseInstance> = {
  name: 'Expense',
  typeDefs: loadTypeDefs(__dirname)('expense'),
  Query: {
  },
  Resolver: {
    account : (expense: any) => expense.getAccount(),
    user : (expense: any) => expense.getUser(),
  },
  Mutation: {},
  Subscription: {},
  joins: [{
    name: 'User',
    Resolver: {
      // expenses: user => ExpenseActions.findExpensesByUserId(user._id),
    },
  }, {
    name: 'Account',
    Resolver: {
      // expenses: account => ExpenseActions.findExpensesByAccountId(account._id),
    },
  }],
}
