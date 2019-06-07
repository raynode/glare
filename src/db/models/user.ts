import { NodeType } from 'gram'
import { createModel, deletedAtModelModifier } from '../base-model'

export interface User extends NodeType {
  givenName: string
  familyName: string
  nickname: string
  name: string
  picture: string
  gender: string
  state: 'admin' | 'member' | 'guest' // admin, verified, unverified
  locale: string
  email: string
  googleID: string
  emailVerified: boolean
}

export interface CreateUser extends Partial<UpdateUser> {
  name: string
  email: string
}

export type UpdateUser = Pick<
  User,
  | 'givenName'
  | 'familyName'
  | 'nickname'
  | 'name'
  | 'picture'
  | 'gender'
  | 'state'
  | 'locale'
  | 'email'
  | 'googleID'
  | 'emailVerified'
>

export const Users = createModel<User, CreateUser, Partial<UpdateUser>>('Users', deletedAtModelModifier)
