import { Tag, TagInstance } from 'models/tag'
import { Document, Types } from 'mongoose'
import { Context } from 'services/context'
import { create } from 'services/logger'
import { loadTypeDefs } from 'services/typeDefs'
import { TypeDef } from 'types/def'

const log = create('types', 'tag')

export const tag: TypeDef<TagInstance> = {
  name: 'Tag',
  typeDefs: loadTypeDefs(__dirname)('tag'),
  Query: { tags: () => Tag.findAll() },
  Mutation: {
    createTag: (_, { input }) => {
      log('create Tag', input)
      Tag.create(input)
    },
  },
  Resolver: {
    accounts: tag => tag.getAccounts(),
    expenses: tag => tag.getExpenses(),
    posts: tag => tag.getPosts(),
    users: tag => tag.getUsers(),
  },
  joins: [
    {
      name: 'User',
      Resolver: {
        tags: user => user.getTags(),
      },
    },
  ],
}
