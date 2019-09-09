import { mapValues } from 'db/utils'
import { identity } from 'lodash'

describe('db:utils', () => {
  describe('::mapValues', () => {
    it('should correctly merge 2 objects with an identity function', () => {
      const merger = mapValues(identity)

      const result = merger(
        {
          a: 1,
        },
        {
          b: 2,
        },
      )

      expect(result).toEqual({
        a: 1,
        b: 2,
      })
    })

    it('should correctly map all values of an object', () => {
      const toFixed = (n: number) => n.toFixed(2)
      const toFixedProperties = mapValues(toFixed)

      const source = {
        a: 1,
        b: 2.5,
      }
      const result = toFixedProperties(source)

      expect(result).toEqual({
        a: '1.00',
        b: '2.50',
      })
    })
  })
})
