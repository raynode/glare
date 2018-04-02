
import { model, Schema } from 'mongoose'

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

export default model('User', UserSchema)
