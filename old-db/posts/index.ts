
import { Post, Tag, User } from 'db/models'
import { Document, model, Schema, Types } from 'mongoose'

import { create } from 'services/logger'
const log = create('db', 'post')

const PostSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  content: {
    type: [Schema.Types.ObjectId],
    ref: 'Widget',
  },
  tags: {
    type: [Schema.Types.ObjectId],
    ref: 'Tag',
  },
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})

export const Posts = model('Post', PostSchema)

export interface PostCreateInput {
  name: string
  email: string
  [key: string]: any
}

export const Actions = {
  posts: async () => (await Posts.find()) as Post[],

  findPostById: async (id: Types.ObjectId) => (await Posts.findById(id)) as Post,

  findPostByName: async (name: string) => {
    const posts = await Posts.find({ name })
    if(posts)
      return posts[0] as Post
    return null
  },

  findPostsByTag: async (tag: Tag) =>
    (await Posts.find({ tags: tag._id })) as Post[],

  findPostsByAuthor: async (author: User) =>
    (await Posts.find({ author: author._id })) as Post[],

  createPost: async (input: PostCreateInput) => {
    const post = new Posts(input)
    log('created post:', post)
    return post.save()
  },
}
