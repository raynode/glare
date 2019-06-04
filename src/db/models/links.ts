
import { NodeType } from 'gram'
import { createModel, deletedAtModelModifier } from '../base-model'

export interface UpdateLink {
  datetime: Date
  title: string
  url: string
  content: string
  tags: string[]
}

export interface CreateLink extends Partial<UpdateLink> {
  datetime: Date
  title: string
  url: string
}

export type Link = UpdateLink & NodeType
export const Links = createModel<Link, CreateLink, UpdateLink>('Links', deletedAtModelModifier)
