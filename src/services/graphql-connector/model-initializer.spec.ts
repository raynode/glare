import { modelCreator } from './model'
import { createModelInitializer } from './model-initializer'
import { Models, Types } from './tests/utils'

describe('model-initializer', () => {
  it('should be a function', () => {
    const modelInitializer = createModelInitializer<Types, Models>()
    expect(typeof modelInitializer).toBe('function')
  })
})
