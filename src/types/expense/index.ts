
import { loadTypeDefs } from 'services/typeDefs'
import { TypeDef } from 'types/def'

import { Expense } from 'db/models'

import { Actions as AccountActions  } from 'db/accounts'
import { Actions as ExpenseActions } from 'db/expenses'
import { Actions as UserActions } from 'db/users'

import { create } from 'logger'

const log = create('db', 'model', 'expenses')
export const typeDefs = loadTypeDefs(__dirname)('expense')

export const expense: TypeDef<Expense> = {
  name: 'Expense',
  typeDefs: loadTypeDefs(__dirname)('expense'),
  Query: {
  },
  Resolver: {
    id: expense => expense._id,
    account : expense => AccountActions.findById(expense.get('account')),
    user : expense => UserActions.findById(expense.get('user')),
  },
  Mutation: {},
  Subscription: {},
  joins: [{
    name: 'User',
    Resolver: {
      expenses: user => ExpenseActions.findExpensesByUserId(user._id),
    },
  }, {
    name: 'Account',
    Resolver: {
      expenses: account => ExpenseActions.findExpensesByAccountId(account._id),
    },
  }],
}
