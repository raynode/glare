
import { Tag } from 'db/models'
import { Document, model, Schema, Types } from 'mongoose'

import { create } from 'services/logger'
const log = create('db', 'tags')

const TagSchema = new Schema({
  tag: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
})

export interface CreateTagInput {
  tag: string
}

export const Tags = model('Tag', TagSchema)

export const Actions = {
  tags: async () => (await Tags.find()) as Tag[],

  findTagByTag: async (tag: string) => (await Tags.findOne({ tag })) as Tag,

  createTag: async (input: CreateTagInput) => {
    const exist = await Actions.findTagByTag(input.tag)
    if(exist) {
      log(`Tag: ${input.tag} found as ${exist._id}`)
      return exist
    }
    const tag = new Tags(input)
    tag.save()
    log(`Tag: ${input.tag} created as ${tag._id}`)
    return tag
  },
}
