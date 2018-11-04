import { modelCreator, ModelCreator } from './model'
import { BaseSchemaGenerator, createModelRecord } from './model-initializer'
import { createSDL, Models, Types } from './tests/utils'

describe('model-initializer', () => {
  let creator: ModelCreator<Types, Models>
  let generator: BaseSchemaGenerator<Types>
  beforeEach(() => {
    creator = modelCreator<Types, Models>()
    generator = createModelRecord({
      typeConverter: type => null,
    })
  })

  it('should be a function, even without any models', () => {
    const modelRecord = generator([])
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
    const modelFields = generator([sampleModel, otherModel])
    console.log(createSDL(modelFields))
  })
})
