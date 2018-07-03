
import { model, Schema, Types } from 'mongoose'
import { Account } from '../models'

const AccountSchema = new Schema({
  users: [{
    type: [Schema.Types.ObjectId],
    ref: 'User',
  }],
  amount: {
    type: Number,
    required: true,
  },
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})

export const Accounts = model('Account', AccountSchema)

export const Actions = {
  findById: async (id: Types.ObjectId) => (await Accounts.findById(id)) as Account,
}
