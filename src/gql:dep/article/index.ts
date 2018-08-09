
import { loadTypeDefs } from 'gql/utils/typeDefs'
import { create } from 'logger'
import { Document, Types } from 'mongoose'

import config from 'config'
import { ArticleActions, Articles, DBResolverMap } from 'db'
import { Article } from 'db/models'

import { createSubscritionResolver, pubsub, Subscriptions } from 'services/pubsub'

const log = create('db', 'model', 'article')
export const typeDefs = loadTypeDefs(__dirname)('article')

// fetches all articles from the mongo database
const articles = () => Articles.find()

// a resolver is expected to export these four fields:
// Mutations { [string]: Resolver<User> }
// Query { [string]: Resolver<User> }
// Resolver { [string]: Resolver<User-fields> }
// Attachments { [other: Resolver]: { [string]: Resolver<User> } }

export const Mutations = {
  createArticle: (_, args) => {
    console.log(args)
  },
}

export const Query: DBResolverMap = {
  articles: ArticleActions.articles,
}

export const Subscription = {
  createdArticle: createSubscritionResolver(Subscriptions.CreatedArticle),
}

export const Resolver: DBResolverMap<Article> = {
  // id needs to be mapped to the mongodb-id
  id: article => article._id,
  from: article => article.datetime,
}
