
import getMongoConnection from './mongo'
export { getMongoConnection }

import { Document } from 'mongoose'
export { Accounts, Actions as AccountActions } from './accounts'
export { Articles, Actions as ArticleActions } from './articles'
export { Expenses, Actions as ExpenseActions } from './expenses'
export { Users, Actions as UserActions } from './users'

export type DBResolver<Parent = null, Result = any> = (parent: Parent, args: any, context: any, info: any) => Result
export type DBResolverMap<T = Document> = Record<string, DBResolver<T>>

export const collectionNameToType = (name: string) => {
  switch (name) {
    case 'users': return 'User'
    case 'accounts': return 'Account'
    case 'expenses': return 'Expense'
    case 'articles': return 'Article'
  }
  return null
}
