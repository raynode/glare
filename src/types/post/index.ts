
import { Document, Types } from 'mongoose'

import { Context } from 'services/context'
import { loadTypeDefs } from 'services/typeDefs'
import { TypeDef } from 'types/def'

import { Post } from 'db/models'

import { Actions } from 'db/posts'
import { Actions as TagActions } from 'db/tags'
import { Actions as UserActions } from 'db/users'

import { user } from 'types/user'

import { create } from 'services/logger'
const log = create('types', 'post')

export const post: TypeDef<Post> = {
  name: 'Post',
  typeDefs: loadTypeDefs(__dirname)('post'),
  Query: { posts: Actions.posts },
  Resolver: {
    id: post => post._id,
    author: post => UserActions.findById(post.author),
    tags: async post => [],
  },
  Mutation: {
    createPost: async (_, { input }) => {
      const { author: authorData, tags: tagsData, ...data } = input
      const tags = await Promise.all(tagsData.map(TagActions.createTag))
      const author = await UserActions.userFindOrCreate(authorData)
      return Actions.createPost({ ...data, author, tags })
    },
    updatePost: async (_, { input }) => {
      const { id, tags, author, ...updateData } = input
      const post = await Actions.findPostById(id)
      if(!post) {
        log(`could not update post, it does not exist: ${id}`)
        return null
      }
      const updates: Record<string, any> = updateData
      if(tags)
        updates.tags = await Promise.all(tags.map(TagActions.createTag))
      if(author)
        updates.author = await UserActions.findUserByEmail(author)
      log(`updating ${post._id} with`, updates)
      await post.update(updates)
      return post
    },
  },
  Subscription: {},
  joins: [{
    name: 'User',
    Resolver: {
      posts: Actions.findPostsByAuthor,
    },
  }, {
    name: 'Tag',
    Resolver: {
      posts: Actions.findPostsByTag,
    },
  }],
}
