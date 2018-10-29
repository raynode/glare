import { Document, Types } from 'mongoose'

import { Context } from 'services/context'
import { loadTypeDefs } from 'services/typeDefs'
import { TypeDef } from 'types/def'

import { Post, PostAttributes, PostInstance } from 'models/post'
import { User } from 'models/user'

import { user } from 'types/user'

import { create } from 'services/logger'
const log = create('types', 'post')

import { createBaseType } from 'services/baseType'
// ...createBaseType('Post', Post),

export const post: TypeDef<PostInstance> = {
  name: 'Post',
  typeDefs: loadTypeDefs(__dirname)('post'),
  Query: { posts: () => Post.findAll() },
  Resolver: {
    author: post => post.getAuthor(),
    tags: post => post.getTags(),
  },
  Mutation: {
    createPost: async (_, { input }) => {
      // const { author: authorData, tags: tagsData, ...data } = input
      // const tags = await Promise.all(tagsData.map(TagActions.createTag))
      // const author = await UserActions.userFindOrCreate(authorData)
      // return Actions.createPost({ ...data, author, tags })
    },
    updatePost: async (_, { input }) => {
      // const { id, tags, author, ...updateData } = input
      // const post = await Actions.findPostById(id)
      // if(!post) {
      //   log(`could not update post, it does not exist: ${id}`)
      //   return null
      // }
      // const updates: Record<string, any> = updateData
      // if(tags)
      //   updates.tags = await Promise.all(tags.map(TagActions.createTag))
      // if(author)
      //   updates.author = await UserActions.findUserByEmail(author)
      // log(`updating ${post._id} with`, updates)
      // await post.update(updates)
      // return post
    },
  },
  Subscription: {},
  joins: [
    {
      name: 'User',
      Resolver: {
        posts: user => Post.findAll({ where: { userId: user.id } }),
      },
    },
  ],
}
