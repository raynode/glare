test('post-comment', () => undefined)
// // tslint:disable-next-line
// import * as faker from 'faker'

// import { createModel } from '../create-model'

// import { Methods } from '../types'
// import { modelsToSchema, modelsToSDL } from './test-utils'

// import { graphql, GraphQLSchema } from 'graphql'

// const posts: Post[] = []
// const comments: Comment[] = []
// interface Post {
//   id: number
//   title: string
//   comments: Comment[]
// }
// interface Comment {
//   id
//   text: string
//   post: Post
// }
// const queries: Methods<Post> = {
//   createOne: async modelData => {
//     throw new Error('need some data')
//     return null
//   },
//   findOne: async (where, order, offset) => {
//     throw new Error('need some filter')
//     return null
//   },
//   deleteMany: async (where, order, offset, limit) => {
//     throw new Error('need some filter')
//     return null
//   },
//   findMany: async (where, order, offset, limit) => {
//     throw new Error('need some filter')
//     return null
//   },
//   update: async (where, order, offset, partialModelData) => {
//     throw new Error('need some filter')
//     return null
//   },
// }

// const Comment = createModel<Comment>(
//   'Comment',
//   {
//     id: {
//       dataType: 'string',
//     },
//     text: {
//       dataType: 'string',
//     },
//     post: {
//       type: 'linkSingle',
//       dataType: 'model',
//     },
//   }, {
//     post: () => ({
//       as: 'post',

//     }),
//   },
// )

// const Post = createModel<Post>(
//   'Post',
//   {
//     id: {
//       dataType: 'string',
//       allowNull: false,
//     },
//     title: {
//       dataType: 'string',
//       allowNull: false,
//     },
//     comments: {
//       type: 'linkMany',
//       dataType: 'model',
//       allowNull: false,
//     },
//   }, {
//     // comments: () => Comment,
//   },
// )

// describe('basic graphql generation', () => {
//   it('should create a basic graphql setup from a model', () => {
//     expect(modelsToSDL([Post, Comment])).toMatchSnapshot()
//   })
// })
