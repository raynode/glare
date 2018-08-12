
import { FindOrCreate, User } from 'db/models'
import { Document, model, Schema, Types } from 'mongoose'

import { create } from 'services/logger'
const log = create('db', 'user')

const UserSchema = new Schema({
  givenName: {
    type: String,
    // required: true,
  },
  familyName: {
    type: String,
    // required: true,
  },
  nickname: {
    type: String,
    // required: false,
  },
  name: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
    // required: false,
  },
  gender: {
    type: String,
    // required: false,
  },
  locale: {
    type: String,
    // required: false,
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

export interface UserCreateInput {
  name: string
  email: string
  [key: string]: any
}
export interface UserFindInput {
  id: Types.ObjectId
}

export const Actions = {
  users: async () => (await Users.find()) as User[],
  findById: async (id: Types.ObjectId) => (await Users.findById(id)) as User,
  findUserByEmail: async (email: string) => await (Users.findOne({ email })) as User,

  userCreate: async (input: UserCreateInput) => {
    const user = new Users(input)
    log('created user:', user)
    return user.save()
  },

  userFindOrCreate: async (input: FindOrCreate<UserFindInput, UserCreateInput>) => {
    if(input.find)
      return Actions.findById(input.find.id)
    return Actions.userCreate(input.create)
  },
}
