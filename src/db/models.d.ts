
import { Document, Types } from 'mongoose'

export interface FindOrCreate<Find, Create> {
  find: Find
  create: Create
}

type Image = string

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
  type: string
}

export interface Tag extends Node {
  tag: string
}

export interface Post extends Widget {
  type: 'Post'
  title: string
  author: Types.ObjectId
  image: Image
  content: Widget[]
  tags: Tag[]
}

export interface Markdown extends Widget {
  type: 'Markdown'
  text: string
}
