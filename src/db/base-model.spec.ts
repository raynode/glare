import { identity } from 'lodash'

import { AnyModelModifier, modelModifierReducer } from './base-model'

// describe('Base-Model Service', () => {
//   it('should create a base model from a model', () => {
//     true
//   })
// })

export const localIdentity = identity
export const localDefaultModelModifier: AnyModelModifier = {
  create: () => localIdentity,
  find: () => localIdentity,
  postFind: localIdentity,
  preCreate: localIdentity,
  preUpdate: localIdentity,
  remove: () => localIdentity,
  update: () => localIdentity,
}
describe('Base-Model utilities', () => {
  describe('Base-Model:extend', () => {
    it.skip('should return the localDefaultModelModifier', () => {
      const x = modelModifierReducer('TEST', localDefaultModelModifier, [])
      expect(x.create).toEqual(localIdentity)
    })

    it('should return the partialModelModifier', () => {
      const x = modelModifierReducer('TEST', localDefaultModelModifier, [
        {
          create: t => q => q,
        },
      ])
      console.log(x.create)
    })
  })
})
