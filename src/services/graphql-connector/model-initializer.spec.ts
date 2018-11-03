import { modelCreator, ModelCreator } from './model'
import { createModelRecord } from './model-initializer'
import { createSDL, Models, Types } from './tests/utils'

describe('model-initializer', () => {
  let creator: ModelCreator<Types, Models>
  beforeEach(() => {
    creator = modelCreator<Types, Models>()
  })

  it('should be a function, even without any models', () => {
    const modelRecord = createModelRecord<Types, Models>([])
    expect(typeof modelRecord).toBe('object')
    expect(modelRecord).toHaveProperty('queryFields')
    expect(modelRecord).toHaveProperty('mutationFields')
    // expect(modelRecord).toHaveProperty('subscriptionFields')
  })

  it('should create the fields list in a model', () => {
    const sampleModel = creator('Sample', {
      number: { type: 'int' },
      name: { type: 'string' },
    })
    const otherModel = creator(
      'Other',
      {
        value: { type: 'string' },
      },
      {
        sample: { model: 'Sample' },
        more: { model: 'Other' },
      },
    )
    const modelFields = createModelRecord<Types, Models>([sampleModel, otherModel])
    console.log(createSDL(modelFields))
  })
})
