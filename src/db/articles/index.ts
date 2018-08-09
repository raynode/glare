
import { model, Schema, Types } from 'mongoose'
import { Article } from '../models'

const ArticleSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    required: false,
  },
  title: {
    type: String,
    required: true,
  },
  datetime: {
    type: Date,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: false,
  },
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})

// @TODO needs to be renamed to "Article"
export const Articles = model('Heise', ArticleSchema)

export const Actions = {
  articles: async () => (await Articles.find().sort({ datetime: -1 }).limit(20)) as Article[],
  findById: async (id: Types.ObjectId) => (await Articles.findById(id)) as Article,
}
