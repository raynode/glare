import { Articles } from 'db/articles'
import { Article } from 'db/models'
import { Document, Types } from 'mongoose'
import { Context } from 'services/context'
import { create } from 'services/logger'
import { loadTypeDefs } from 'services/typeDefs'
import { TypeDef } from 'types/def'

const log = create('types', 'article')

// query function to find all articles
const articles = () => Articles.find()

export const article: TypeDef<Article> = {
  name: 'Article',
  typeDefs: loadTypeDefs(__dirname)('article'),
  Query: { articles },
  Resolver: {
    id: article => article._id,
  },
  Mutation: {},
  Subscription: {},
}
