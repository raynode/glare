import { NodeType } from 'gram'
import { createSalt, decrypt, encrypt } from 'services/crypto'
import { createModel, deletedAtModelModifier } from '../base-model'

const ENCRYPTION_KEY = '👮‍♂️'

export interface UpdateTokenStore {
  service: string
  data: any
}

export interface CreateTokenStore extends Partial<UpdateTokenStore> {
  service: string
  data: any
  userId: string
}

export type TokenStore = UpdateTokenStore & NodeType
export const TokenStores = createModel<TokenStore, CreateTokenStore, UpdateTokenStore>('TokenStore', {
  preCreate: async (context, { userId, data, ...rest }) => {
    const salt = createSalt()
    return {
      ...rest,
      userId,
      salt,
      data: await encrypt(JSON.stringify(data), ENCRYPTION_KEY, salt),
    }
  },
  postFind: async (context, { salt, data: encrypted, ...rest }) => {
    return {
      ...rest,
      data: JSON.parse(await decrypt(encrypted.toString('utf8'), ENCRYPTION_KEY, salt)),
    }
  },
})
