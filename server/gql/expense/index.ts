
import { loadTypeDefs } from 'gql/utils/typeDefs'
import { create } from 'logger'
import { Document, Types } from 'mongoose'

import config from 'config'

import {
  AccountActions,
  Accounts,
  DBResolverMap,
  ExpenseActions,
  Expenses,
  UserActions,
  Users,
} from 'db'

import { Account, Expense, User } from 'db/models'

const log = create('db', 'model', 'expenses')
export const typeDefs = loadTypeDefs(__dirname)('expense')

// a resolver is expected to export these four fields:
// Mutations { [string]: Resolver<User> }
// Query { [string]: Resolver<User> }
// Resolver { [string]: Resolver<User-fields> }
// Attachments { [other: Resolver]: { [string]: Resolver<User> } }

export const Mutations = {}

export const Query = {}

export const Resolver: DBResolverMap<Expense> = {
  // id needs to be mapped to the mongodb-id
  id: expense => expense._id,
  account : expense => AccountActions.findById(expense.get('account')),
  user : expense => UserActions.findById(expense.get('user')),
}

export const ExpenseUserResolver: DBResolverMap<User> = {
  expenses: user => ExpenseActions.findExpensesByUserId(user._id),
}

export const ExpenseAccountResolver: DBResolverMap<Account> = {
  expenses: account => ExpenseActions.findExpensesByAccountId(account._id),
}
