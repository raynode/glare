
import { model, Schema, Types } from 'mongoose'
import { Expense } from '../models'

const ExpenseSchema = new Schema({
  amount: {
    type: Number,
    required: true,
  },
  user: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
  },
  account: {
    type: [Schema.Types.ObjectId],
    ref: 'Account',
  },
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})

export const Expenses = model('Expense', ExpenseSchema)

export const Actions = {
  findExpensesByAccountId: async (accountId: Types.ObjectId) =>
    (await Expenses.find({ account: accountId })) as Expense[],

  findExpensesByUserId: async (userId: Types.ObjectId) =>
    (await Expenses.find({ user: userId })) as Expense[],
}
