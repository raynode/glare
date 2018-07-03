
import { Document, model, Schema, Types } from 'mongoose'
import { User } from '../models'

const UserSchema = new Schema({
  auth0UserId: {
    type: String,
    required: true,
  },
  givenName: {
    type: String,
    required: true,
  },
  familyName: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
    required: false,
  },
  gender: {
    type: String,
    required: false,
  },
  locale: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    index: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})

export const Users = model('User', UserSchema)

export const Actions = {
  users: async () => (await Users.find()) as User[],
  findById: async (id: Types.ObjectId) => (await Users.findById(id)) as User,
  findUserByEmail: async (email: string) => await (Users.findOne({ email })) as User,
}
