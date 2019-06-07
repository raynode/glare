import { NodeType } from 'gram'
import { createModel, deletedAtModelModifier } from '../base-model'

export interface Asset extends NodeType {
  name: string
  type: string
  mimetype: string
  source: string
  data: Buffer
  url: string
}

export type CreateAsset = Partial<UpdateAsset> & Pick<Asset, 'type' | 'mimetype' | 'data'>

export type UpdateAsset = Pick<Asset, 'name' | 'type' | 'mimetype' | 'source' | 'url'>

export const Assets = createModel<Asset, CreateAsset, Partial<UpdateAsset>>('Assets', deletedAtModelModifier)
