
import { Document, Types } from 'mongoose'

import { Context } from 'services/context'
import { loadTypeDefs } from 'services/typeDefs'
import { TypeDef } from 'types/def'

import { Tag } from 'db/models'

import { Actions, Tags } from 'db/tags'

import { create } from 'services/logger'
const log = create('types', 'tag')

export const tag: TypeDef<Tag> = {
  name: 'Tag',
  typeDefs: loadTypeDefs(__dirname)('tag'),
  Query: { tags: Actions.tags },
  Resolver: {
    id: tag => tag._id,
  },
  Mutation: {
    createTag: (_, { input }) => Actions.createTag(input),
  },
  Subscription: {},
}
