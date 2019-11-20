import { NodeType } from 'gram'
import { createSalt, decrypt, encrypt } from 'services/crypto'
import { createModel, deletedAtModelModifier } from '../base-model'

export interface ApiKey extends NodeType {
  key: string
  service: string
  userId: string
}

export interface UpdateApiKey {
  service: string
}

export interface CreateApiKey extends Partial<UpdateApiKey> {
  key: string
  service: string
  userId: string
}

export const ApiKeys = createModel<ApiKey, CreateApiKey, UpdateApiKey>('ApiKey')
