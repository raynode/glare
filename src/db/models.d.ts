
import { Document, Types } from 'mongoose'

export interface Node extends Document {
  id: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export interface Account extends Node {
  users: Types.ObjectId[]
  amount: number
}

export interface Expense extends Node {
  amount: number
  user: Types.ObjectId
  account: Types.ObjectId
}

export interface Article extends Node {
  owner?: Types.ObjectId
  title: string
  datetime: Date
  link: string
  content?: string
}

export interface User extends Node {
  givenName: string
  familyName: string
  nickname: string
  name: string
  picture: string
  gender: string
  locale: string
  email: string
  emailVerified: boolean
}

export interface Widget extends Node {
  name: string
}
